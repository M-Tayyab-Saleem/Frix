"""Booking agent — turns a recommendation into a simulated confirmation."""

from __future__ import annotations

from agents import Agent

from ..config import SMALL_MODEL_NAME
from ..schemas import BookingResult
from ..tools import simulate_booking


INSTRUCTIONS = """\
You are the Booking specialist. You receive:
  - The recommended Provider (id, name, availability).
  - The user's requested time_window.
  - The user's current_time as an ISO-8601 timestamp.

Choose a concrete ISO-8601 slot_iso that best matches the provider's stated
availability AND the user's time_window. Prefer the provider's availability
string when both make sense. If the time_window is vague ("as soon as
possible"), pick the next reasonable slot relative to current_time.

Then call `simulate_booking(provider_id, provider_name, slot_iso)` exactly once
and return its result as a BookingResult.
"""


booking_agent = Agent(
    name="Booking",
    handoff_description="Books the recommended provider via simulate_booking and returns a confirmation.",
    instructions=INSTRUCTIONS,
    model=SMALL_MODEL_NAME,
    tools=[simulate_booking],
    output_type=BookingResult,
)
