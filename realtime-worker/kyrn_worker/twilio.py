from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class TwilioStartContext:
    stream_sid: str
    call_sid: str | None
    team_id: int
    run_id: int
    agent_id: int | None = None
    room_name: str | None = None
    from_number: str | None = None
    to_number: str | None = None


def parse_start_context(payload: dict[str, Any]) -> TwilioStartContext:
    start = payload.get("start") or {}
    params = start.get("customParameters") or {}

    def optional_int(name: str) -> int | None:
        value = params.get(name)
        return int(value) if value not in (None, "") else None

    team_id = optional_int("teamId")
    run_id = optional_int("runId")
    if team_id is None or run_id is None:
        raise ValueError("Twilio start event must include teamId and runId custom parameters")

    return TwilioStartContext(
        stream_sid=start.get("streamSid") or payload.get("streamSid") or "",
        call_sid=start.get("callSid") or params.get("callSid"),
        team_id=team_id,
        run_id=run_id,
        agent_id=optional_int("agentId"),
        room_name=params.get("roomName"),
        from_number=params.get("from"),
        to_number=params.get("to"),
    )
