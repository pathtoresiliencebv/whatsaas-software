from __future__ import annotations

import asyncio
import json
import logging
from typing import Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse

from .saas_client import SaasClient
from .settings import load_settings
from .twilio import TwilioStartContext, parse_start_context

settings = load_settings()
logging.basicConfig(level=getattr(logging, settings.log_level.upper(), logging.INFO))
logger = logging.getLogger("kyrn-worker")

app = FastAPI(title="Kyrn realtime worker", version="0.1.0")


@app.get("/health")
async def health() -> dict[str, Any]:
    return {
        "ok": True,
        "callbacks": settings.ready_for_callbacks,
        "livekit": settings.ready_for_livekit,
        "defaultPipeline": settings.ready_for_default_pipeline,
        "agentName": settings.pipecat_agent_name,
    }


@app.get("/api/voice/runtime/twilio-media")
async def twilio_media_get() -> JSONResponse:
    return JSONResponse(
        {
            "status": "websocket-required",
            "message": "Connect Twilio Media Streams with wss:// to this path.",
        },
        status_code=426,
    )


@app.websocket("/api/voice/runtime/twilio-media")
async def twilio_media(websocket: WebSocket) -> None:
    await websocket.accept()
    context: TwilioStartContext | None = None
    client = SaasClient(settings)

    try:
        context = await wait_for_twilio_start(websocket)
        await client.post_event(
            team_id=context.team_id,
            run_id=context.run_id,
            event={
                "type": "run.started",
                "channel": "phone",
                "transport": "twilio-media-streams",
                "roomName": context.room_name,
                "callSid": context.call_sid,
            },
        )

        runtime_config = await client.get_runtime_config(team_id=context.team_id, run_id=context.run_id)
        await run_twilio_pipecat_session(websocket, context, runtime_config)

        await client.post_event(
            team_id=context.team_id,
            run_id=context.run_id,
            event={"type": "run.ended", "status": "completed", "transport": "twilio-media-streams"},
        )
    except WebSocketDisconnect:
        logger.info("Twilio websocket disconnected")
    except Exception as error:
        logger.exception("Twilio media runtime failed")
        if context:
            try:
                await client.post_event(
                    team_id=context.team_id,
                    run_id=context.run_id,
                    event={"type": "run.error", "message": str(error), "transport": "twilio-media-streams"},
                )
            except Exception:
                logger.warning("Failed to post runtime error event", exc_info=True)
        await websocket.close(code=1011)


async def wait_for_twilio_start(websocket: WebSocket) -> TwilioStartContext:
    while True:
        payload = json.loads(await websocket.receive_text())
        event = payload.get("event")
        if event == "connected":
            continue
        if event == "start":
            return parse_start_context(payload)
        raise ValueError(f"Expected Twilio start event, received {event!r}")


async def run_twilio_pipecat_session(
    websocket: WebSocket,
    context: TwilioStartContext,
    runtime_config: dict[str, Any],
) -> None:
    try:
        from .pipecat_twilio import run_session
    except Exception as error:
        raise RuntimeError(f"Pipecat runtime is unavailable: {error}") from error

    await run_session(websocket=websocket, context=context, runtime_config=runtime_config, settings=settings)


@app.on_event("startup")
async def log_startup() -> None:
    logger.info(
        "Kyrn realtime worker starting callbacks=%s livekit=%s pipeline=%s",
        settings.ready_for_callbacks,
        settings.ready_for_livekit,
        settings.ready_for_default_pipeline,
    )
    await asyncio.sleep(0)
