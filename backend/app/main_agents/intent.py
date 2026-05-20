"""IntentParser agent — multilingual extraction of service intent."""

from __future__ import annotations

from agents import Agent

from ..config import MODEL_NAME
from ..schemas import ServiceIntent


INSTRUCTIONS = """\
You are the IntentParser specialist for an informal-economy service marketplace
in Pakistan. The user prompt may be written in English, Urdu (Arabic script),
Roman Urdu (Urdu transliterated with Latin characters), or a mix.

Extract a structured ServiceIntent:

- service_type: normalize to lowercase snake_case. Common categories:
  ac_technician, plumber, electrician, house_cleaner, carpenter, painter,
  mechanic, mason, driver, tailor. If the user says "AC theek karwana hai" /
  "AC repair" / "اے سی ٹھیک" → "ac_technician".
- location: the Karachi area or neighborhood the user mentions (e.g. "DHA Phase 6", "Clifton Block 5").
  If the user does not specify one, copy the area from the supplied user
  context (provided in the prompt). If still unknown, use "unknown".
- time_window: a short human phrase like "tomorrow morning", "today 8pm",
  "as soon as possible". Preserve the user's intent — do not invent specifics.
- language_detected: one of english / urdu / roman_urdu / mixed / unknown.
- notes: anything else useful (urgency, budget hints, the appliance brand, etc.).

Return ONLY the structured object. Do not call any tools.
"""


intent_agent = Agent(
    name="IntentParser",
    handoff_description="Parses the user's natural-language request into a structured ServiceIntent.",
    instructions=INSTRUCTIONS,
    model=MODEL_NAME,
    output_type=ServiceIntent,
)
