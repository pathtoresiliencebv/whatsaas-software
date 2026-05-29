from __future__ import annotations

import time
from typing import Any

import httpx

from .settings import Settings


class SaasClient:
    def __init__(self, settings: Settings) -> None:
        if not settings.voice_api_base_url:
            raise RuntimeError("VOICE_API_BASE_URL is required")
        self.base_url = settings.voice_api_base_url.rstrip("/")
        self.runtime_secret = settings.voice_runtime_secret

    async def get_runtime_config(self, *, team_id: int, run_id: int) -> dict[str, Any]:
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(
                f"{self.base_url}/api/voice/runtime/config",
                headers=self._headers(),
                json={"teamId": team_id, "runId": run_id},
            )
            response.raise_for_status()
            payload = response.json()
            return payload["config"]

    async def post_event(self, *, team_id: int, run_id: int, event: dict[str, Any]) -> None:
        event.setdefault("at", time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()))
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(
                f"{self.base_url}/api/voice/runtime/events",
                headers=self._headers(),
                json={"teamId": team_id, "runId": run_id, "event": event},
            )
            response.raise_for_status()

    def _headers(self) -> dict[str, str]:
        headers = {"content-type": "application/json"}
        if self.runtime_secret:
            headers["x-voice-runtime-secret"] = self.runtime_secret
        return headers
