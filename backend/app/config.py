"""Centralized config — model names + env loading.

We load `.env` once at import time so that running `uvicorn app.api:app` picks
up `OPENAI_API_KEY` and `MODEL_NAME` / `SMALL_MODEL_NAME` without extra setup.
"""

from __future__ import annotations

import os

from dotenv import load_dotenv

load_dotenv()  # idempotent, safe to call multiple times


# Big model — multilingual intent extraction and orchestration glue. Override
# with MODEL_NAME=gpt-4o or similar if you prefer.
MODEL_NAME: str = os.getenv("MODEL_NAME", "gpt-4.1")

# Small model — used for specialists that don't need heavy reasoning
# (ProviderFinder, Booking, FollowUp). Keeps cost predictable.
SMALL_MODEL_NAME: str = os.getenv("SMALL_MODEL_NAME", "gpt-4.1-mini")
