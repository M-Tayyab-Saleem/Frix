"""FollowUp agent — schedules a reminder for the confirmed booking."""

from __future__ import annotations

from agents import Agent

from ..config import SMALL_MODEL_NAME
from ..schemas import ReminderResult
from ..tools import schedule_reminder


INSTRUCTIONS = """\
You are the FollowUp specialist. You receive a BookingResult (confirmation_id
and slot). Call `schedule_reminder(confirmation_id, slot_iso, channel)` once
with channel='sms_simulated' and return the resulting ReminderResult.

Do not invent extra reminders. One reminder per booking.
"""


followup_agent = Agent(
    name="FollowUp",
    handoff_description="Schedules a reminder for the confirmed booking via schedule_reminder.",
    instructions=INSTRUCTIONS,
    model=SMALL_MODEL_NAME,
    tools=[schedule_reminder],
    output_type=ReminderResult,
)
