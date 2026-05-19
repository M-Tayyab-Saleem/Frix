"""Ranker agent — scores candidates and picks the recommended one.

Scoring weights (made explicit so evaluators can see the reasoning):
    - distance     40%
    - rating       30%
    - availability 30%   (alignment with the user's time_window)
"""

from __future__ import annotations

from agents import Agent

from ..config import MODEL_NAME
from ..schemas import RankedProviders


INSTRUCTIONS = """\
You are the Ranker specialist. You receive:
  - A ServiceIntent (with time_window).
  - A list of candidate Providers (with distance_km, rating, availability).

Score each provider in [0.0, 1.0] using these weights:
  - distance      40%   (closer is better; treat <=2km as ~1.0, >=10km as ~0.0)
  - rating        30%   (5.0 → 1.0, 3.0 → 0.0, linear)
  - availability  30%   (full credit if availability matches the time_window,
                         partial if same day, low if much later)

For each provider, write a SHORT one-sentence reasoning explaining why it
got the score it did (mention the strongest factor).

Return a RankedProviders object containing:
  - top_providers: the TOP 3 providers, sorted by score descending.
  - recommended_id: the id of the #1 provider.

If fewer than 3 candidates are supplied, return all of them. If none, return
an empty top_providers list and an empty recommended_id (the orchestrator
will surface a clarifying error).

Do not call any tools. Reason directly over the input list.
"""


ranker_agent = Agent(
    name="Ranker",
    handoff_description="Scores candidate providers and selects the top 3 plus a recommendation.",
    instructions=INSTRUCTIONS,
    model=MODEL_NAME,
    output_type=RankedProviders,
)
