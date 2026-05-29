from __future__ import annotations

from typing import Any

from fastapi import WebSocket

from .settings import Settings
from .twilio import TwilioStartContext


async def run_session(
    *,
    websocket: WebSocket,
    context: TwilioStartContext,
    runtime_config: dict[str, Any],
    settings: Settings,
) -> None:
    from pipecat.pipeline.pipeline import Pipeline
    from pipecat.pipeline.runner import PipelineRunner
    from pipecat.pipeline.task import PipelineParams, PipelineTask
    from pipecat.serializers.twilio import TwilioFrameSerializer
    from pipecat.services.deepgram.stt import DeepgramSTTService, DeepgramSTTSettings
    from pipecat.services.elevenlabs.tts import ElevenLabsTTSService, ElevenLabsTTSSettings
    from pipecat.services.openai.base_llm import OpenAILLMSettings
    from pipecat.services.openai.llm import OpenAILLMService
    from pipecat.transports.websocket.fastapi import FastAPIWebsocketParams, FastAPIWebsocketTransport

    serializer = TwilioFrameSerializer(
        stream_sid=context.stream_sid,
        call_sid=context.call_sid or "",
        account_sid=settings.twilio_account_sid,
        auth_token=settings.twilio_auth_token,
    )

    transport = FastAPIWebsocketTransport(
        websocket=websocket,
        params=FastAPIWebsocketParams(
            audio_in_enabled=True,
            audio_out_enabled=True,
            audio_in_sample_rate=8000,
            audio_out_sample_rate=8000,
            add_wav_header=False,
            serializer=serializer,
        ),
    )

    provider_config = runtime_config.get("providers") or {}
    credentials = provider_config.get("credentials") or {}
    system_prompt = _system_prompt(runtime_config)
    stt = DeepgramSTTService(
        api_key=credentials.get("sttApiKey") or settings.deepgram_api_key,
        settings=DeepgramSTTSettings(model=provider_config.get("sttModel") or settings.deepgram_model, language="multi"),
        sample_rate=8000,
    )
    llm_provider = provider_config.get("llm") or "openai"
    llm_model = provider_config.get("llmModel") or settings.openai_model
    llm_base_url = None
    llm_api_key = credentials.get("llmApiKey") or settings.openai_api_key
    if llm_provider in {"gemini", "gemini-live"}:
        llm_api_key = credentials.get("llmApiKey") or settings.gemini_api_key
        llm_model = _gemini_text_fallback_model(llm_model, settings)
        llm_base_url = "https://generativelanguage.googleapis.com/v1beta/openai/"

    llm_kwargs = {
        "api_key": llm_api_key,
        "settings": OpenAILLMSettings(model=llm_model, temperature=0.2),
    }
    if llm_base_url:
        llm_kwargs["base_url"] = llm_base_url
    llm = OpenAILLMService(**llm_kwargs)
    tts = ElevenLabsTTSService(
        api_key=credentials.get("ttsApiKey") or settings.elevenlabs_api_key,
        settings=ElevenLabsTTSSettings(
            voice=provider_config.get("ttsVoice") or settings.elevenlabs_voice_id,
            model=provider_config.get("ttsModel") or settings.elevenlabs_model,
        ),
    )

    context_aggregators = _create_context_aggregators(system_prompt)
    user_aggregator, assistant_aggregator = context_aggregators

    pipeline = Pipeline(
        [
            transport.input(),
            stt,
            user_aggregator,
            llm,
            tts,
            transport.output(),
            assistant_aggregator,
        ]
    )
    task = PipelineTask(
        pipeline,
        params=PipelineParams(
            enable_metrics=True,
            enable_usage_metrics=True,
            audio_in_sample_rate=8000,
            audio_out_sample_rate=8000,
        ),
        enable_rtvi=False,
    )

    runner = PipelineRunner(handle_sigint=False, handle_sigterm=False)
    await runner.run(task)


def _system_prompt(runtime_config: dict[str, Any]) -> str:
    workflow = runtime_config.get("workflow") or {}
    variables = runtime_config.get("variables") or {}
    nodes = workflow.get("nodes") if isinstance(workflow, dict) else None
    start_text = "You are Kyrn, a concise and helpful realtime voice assistant."
    if isinstance(nodes, list) and nodes:
        first = nodes[0]
        label = first.get("label") or first.get("title") or first.get("type")
        if label:
            start_text += f" Current workflow starts at: {label}."
    if variables:
        start_text += f" Session variables: {variables}."
    return start_text


def _gemini_text_fallback_model(model: str, settings: Settings) -> str:
    if "-live" in model or "-tts" in model:
        return settings.gemini_model or "gemini-3.1-flash"
    return model or settings.gemini_model or "gemini-3.1-flash"


def _create_context_aggregators(system_prompt: str):
    try:
        from pipecat.processors.aggregators.llm_context import LLMContext
        from pipecat.processors.aggregators.llm_response import LLMContextAggregatorPair

        context = LLMContext([{"role": "system", "content": system_prompt}])
        return LLMContextAggregatorPair(context)
    except Exception:
        from pipecat.processors.aggregators.openai_llm_context import OpenAILLMContext

        context = OpenAILLMContext([{"role": "system", "content": system_prompt}])
        return context.aggregator_pair()
