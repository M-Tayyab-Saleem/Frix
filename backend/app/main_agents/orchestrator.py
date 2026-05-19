"""Orchestrator module.

The orchestration pattern here is a **deterministic agent chain wrapped in a
single SDK trace** — not a single root Agent with handoffs. We chose this
because:

  - Each specialist has its own structured `output_type`, which lets us pass
    typed data forward (ServiceIntent → ProviderCandidates → RankedProviders
    → BookingResult → ReminderResult) without re-parsing free-form text.
  - It still produces a multi-agent trace tree in the OpenAI tracing UI (one
    span per `Runner.run`), which is exactly the evidence the hackathon
    rubric asks for under "Agentic Reasoning".
  - It is far more reliable than free handoffs for a fixed pipeline like
    intent → discovery → rank → book → remind.

See `app/runtime.py` for the actual workflow implementation.
"""

from .intent import intent_agent
from .discovery import discovery_agent
from .ranker import ranker_agent
from .booking import booking_agent
from .followup import followup_agent

__all__ = [
    "intent_agent",
    "discovery_agent",
    "ranker_agent",
    "booking_agent",
    "followup_agent",
]
