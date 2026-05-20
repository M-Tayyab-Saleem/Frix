"""ProviderFinder agent — calls the find_providers tool and returns candidates."""

from __future__ import annotations

from agents import Agent
from pydantic import BaseModel

from ..config import SMALL_MODEL_NAME
from ..schemas import Provider
from ..tools import find_providers


class ProviderCandidates(BaseModel):
    """Wrapper so the agent's `output_type` is a single pydantic model."""

    providers: list[Provider]


INSTRUCTIONS = """\
You are the ProviderFinder specialist. You will receive a ServiceIntent
(service_type + location) along with optional user coordinates (user_lat, user_lng) in the prompt.

Your job is simple and deterministic:
1. Call the `find_providers` tool with the exact service_type, location (area),
   and optional user_lat and user_lng if they are available in the input.
2. Return EVERY provider the tool returns, wrapped in a ProviderCandidates
   object. Do not filter, re-order, or invent providers — that is the
   Ranker's job.

If the tool returns an empty list, return an empty providers list. Do not
fabricate providers.
"""


discovery_agent = Agent(
    name="ProviderFinder",
    handoff_description="Looks up matching service providers via the find_providers tool.",
    instructions=INSTRUCTIONS,
    model=SMALL_MODEL_NAME,
    tools=[find_providers],
    output_type=ProviderCandidates,
)
