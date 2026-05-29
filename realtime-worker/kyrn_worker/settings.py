import os
from dataclasses import dataclass


def _env(name: str, default: str = "") -> str:
    return os.getenv(name, default).strip()


@dataclass(frozen=True)
class Settings:
    port: int
    log_level: str
    voice_api_base_url: str
    voice_runtime_secret: str
    livekit_url: str
    livekit_api_key: str
    livekit_api_secret: str
    pipecat_agent_name: str
    openai_api_key: str
    openai_model: str
    gemini_api_key: str
    gemini_model: str
    deepgram_api_key: str
    deepgram_model: str
    elevenlabs_api_key: str
    elevenlabs_voice_id: str
    elevenlabs_model: str
    twilio_account_sid: str
    twilio_auth_token: str

    @property
    def ready_for_callbacks(self) -> bool:
        return bool(self.voice_api_base_url and self.voice_runtime_secret)

    @property
    def ready_for_livekit(self) -> bool:
        return bool(self.livekit_url and self.livekit_api_key and self.livekit_api_secret)

    @property
    def ready_for_default_pipeline(self) -> bool:
        return bool((self.openai_api_key or self.gemini_api_key) and self.deepgram_api_key and self.elevenlabs_api_key)


def load_settings() -> Settings:
    return Settings(
        port=int(_env("PORT", "8080")),
        log_level=_env("LOG_LEVEL", "info"),
        voice_api_base_url=_env("VOICE_API_BASE_URL") or _env("NEXT_PUBLIC_APP_URL") or _env("BASE_URL"),
        voice_runtime_secret=_env("VOICE_RUNTIME_SECRET"),
        livekit_url=_env("LIVEKIT_URL"),
        livekit_api_key=_env("LIVEKIT_API_KEY"),
        livekit_api_secret=_env("LIVEKIT_API_SECRET"),
        pipecat_agent_name=_env("PIPECAT_AGENT_NAME", "kyrn-pipecat"),
        openai_api_key=_env("OPENAI_API_KEY"),
        openai_model=_env("OPENAI_REALTIME_MODEL") or _env("OPENAI_MODEL", "gpt-realtime-2"),
        gemini_api_key=_env("GEMINI_API_KEY") or _env("GOOGLE_API_KEY"),
        gemini_model=_env("GEMINI_TEXT_MODEL", "gemini-3.1-flash"),
        deepgram_api_key=_env("DEEPGRAM_API_KEY"),
        deepgram_model=_env("DEEPGRAM_MODEL", "nova-3"),
        elevenlabs_api_key=_env("ELEVENLABS_API_KEY"),
        elevenlabs_voice_id=_env("ELEVENLABS_VOICE_ID"),
        elevenlabs_model=_env("ELEVENLABS_MODEL", "eleven_flash_v2_5"),
        twilio_account_sid=_env("TWILIO_ACCOUNT_SID"),
        twilio_auth_token=_env("TWILIO_AUTH_TOKEN"),
    )
