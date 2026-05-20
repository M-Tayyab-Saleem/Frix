"""Pydantic models for request/response and inter-agent structured outputs.

All agents in this project use `output_type=<one of these models>` so that the
final_output of each Runner.run call is a typed object we can pass forward to
the next agent in the chain.
"""

from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field


# ---------- Request ----------------------------------------------------------


class UserLocation(BaseModel):
    area: Optional[str] = Field(
        default=None, description="Karachi area / neighborhood code, e.g. 'DHA Phase 6', 'Clifton Block 5'."
    )
    city: Optional[str] = "Karachi"
    lat: Optional[float] = None
    lng: Optional[float] = None


class OrchestrateRequest(BaseModel):
    user_prompt: str = Field(
        ..., description="Natural-language request in English, Urdu, or Roman Urdu."
    )
    user_location: Optional[UserLocation] = None
    current_time: Optional[str] = Field(
        default=None,
        description="ISO-8601 timestamp. If omitted, the server uses datetime.now().",
    )


# ---------- Inter-agent payloads --------------------------------------------


class ServiceIntent(BaseModel):
    """Parsed by IntentParser. Consumed by ProviderFinder + downstream agents."""

    service_type: str = Field(
        ...,
        description="Normalized snake_case category, e.g. 'ac_technician', 'plumber', 'electrician'.",
    )
    location: str = Field(
        ...,
        description="Area the user wants the service in, e.g. 'DHA Phase 6'.",
    )
    time_window: str = Field(
        ...,
        description="Free-text human time window, e.g. 'tomorrow morning', 'today 8pm', 'as soon as possible'.",
    )
    language_detected: Literal["english", "urdu", "roman_urdu", "mixed", "unknown"] = (
        "unknown"
    )
    notes: Optional[str] = Field(
        default=None, description="Any extra detail extracted from the prompt."
    )
    # User GPS coordinates passed through from request for accurate haversine distance
    user_lat: Optional[float] = Field(
        default=None, description="User latitude (from GPS or area centroid)."
    )
    user_lng: Optional[float] = Field(
        default=None, description="User longitude (from GPS or area centroid)."
    )


class Provider(BaseModel):
    """Raw provider record returned by the find_providers tool."""

    id: str
    name: str
    category: str
    location: str
    distance_km: float
    rating: float
    availability: str
    price_range: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    area: Optional[str] = None
    on_time_score: Optional[float] = None
    cancellation_rate: Optional[float] = None
    review_count: Optional[int] = None
    specializations: Optional[list[str]] = None
    base_fee_pkr: Optional[int] = None
    per_hour_pkr: Optional[int] = None
    years_experience: Optional[int] = None
    phone: Optional[str] = None


class RankedProvider(BaseModel):
    """A provider after the Ranker has scored and explained it."""

    id: str
    name: str
    category: str
    location: str
    distance_km: float
    rating: float
    availability: str
    price_range: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    area: Optional[str] = None
    on_time_score: Optional[float] = None
    cancellation_rate: Optional[float] = None
    review_count: Optional[int] = None
    specializations: Optional[list[str]] = None
    base_fee_pkr: Optional[int] = None
    per_hour_pkr: Optional[int] = None
    years_experience: Optional[int] = None
    phone: Optional[str] = None
    score: float = Field(..., ge=0.0, le=1.0)
    reasoning: str


class RankedProviders(BaseModel):
    """Ranker output: top providers + the one recommended for booking."""

    top_providers: list[RankedProvider]
    recommended_id: str


class BookingResult(BaseModel):
    provider_id: str
    provider_name: str
    slot: str
    confirmation_id: str
    message: str


class ReminderResult(BaseModel):
    booking_id: str
    reminder_at: str
    channel: str
    message: str


# ---------- Final response ---------------------------------------------------


class TraceStep(BaseModel):
    agent: str
    summary: str


class TraceResponse(BaseModel):
    workflow_id: str
    steps: list[TraceStep] = Field(default_factory=list)


class OrchestratorResponse(BaseModel):
    intent: ServiceIntent
    top_providers: list[RankedProvider]
    recommended: RankedProvider
    booking: BookingResult
    followup: ReminderResult
    trace: TraceResponse
    error: Optional[str] = None
