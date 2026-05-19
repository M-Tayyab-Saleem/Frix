"""Function tools exposed to the agents.

All tools are pure (no external I/O) so the demo is deterministic and works
offline. They are decorated with `@function_tool` from the OpenAI Agents SDK
so the model can call them by name with structured arguments.
"""

from __future__ import annotations

import math
from datetime import datetime, timedelta, timezone
from itertools import count

from agents import function_tool

from .mock_data import MOCK_PROVIDERS, SECTOR_COORDS


# Deterministic-ish per-process booking counter (resets when the server restarts;
# fine for a hackathon demo).
_booking_counter = count(1)


def _haversine_km(a: tuple[float, float], b: tuple[float, float]) -> float:
    """Great-circle distance between two (lat, lng) points, in km."""
    lat1, lng1 = math.radians(a[0]), math.radians(a[1])
    lat2, lng2 = math.radians(b[0]), math.radians(b[1])
    dlat = lat2 - lat1
    dlng = lng2 - lng1
    h = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng / 2) ** 2
    return round(2 * 6371.0 * math.asin(math.sqrt(h)), 2)


def _distance_between_sectors(user_sector: str, provider_sector: str) -> float:
    """Fake but plausible distance based on sector centroids.

    Falls back to 5km when a sector code is unknown — keeps the demo robust to
    unfamiliar inputs without crashing the workflow.
    """
    user = SECTOR_COORDS.get(user_sector.upper())
    prov = SECTOR_COORDS.get(provider_sector.upper())
    if user is None or prov is None:
        return 5.0
    return _haversine_km(user, prov)


def find_providers_raw(service_type: str, location: str) -> list[dict]:
    needle = service_type.strip().lower().replace("-", "_").replace(" ", "_")
    out: list[dict] = []
    for p in MOCK_PROVIDERS:
        if p["category"] != needle:
            continue
        distance = _distance_between_sectors(location, p["sector"])
        out.append(
            {
                "id": p["id"],
                "name": p["name"],
                "category": p["category"],
                "location": p["sector"],
                "distance_km": distance,
                "rating": p["rating"],
                "availability": p["availability"],
                "price_range": p.get("price_range"),
            }
        )
    # Sort by distance so the LLM sees nearby options first; the Ranker will
    # still do its own weighted scoring.
    out.sort(key=lambda x: x["distance_km"])
    return out


@function_tool
def find_providers(service_type: str, location: str) -> list[dict]:
    """Return mock providers matching a service category near a sector.

    Args:
        service_type: snake_case category like 'ac_technician', 'plumber'.
        location: Islamabad sector code like 'G-13'. Case-insensitive.

    Returns:
        A list of provider dicts with computed `distance_km` to `location`.
        Empty list if nothing matches.
    """
    return find_providers_raw(service_type, location)


def simulate_booking_raw(provider_id: str, provider_name: str, slot_iso: str) -> dict:
    n = next(_booking_counter)
    today = datetime.now(timezone.utc).strftime("%Y%m%d")
    confirmation_id = f"BK-{today}-{n:04d}"
    return {
        "provider_id": provider_id,
        "provider_name": provider_name,
        "slot": slot_iso,
        "confirmation_id": confirmation_id,
        "message": f"Slot booked with {provider_name} at {slot_iso}. Confirmation {confirmation_id}.",
    }


@function_tool
def simulate_booking(provider_id: str, provider_name: str, slot_iso: str) -> dict:
    """Pretend to book the given provider at the given slot.

    Returns a confirmation object. No persistence — a deterministic-format ID
    is generated per call: BK-YYYYMMDD-NNNN.
    """
    return simulate_booking_raw(provider_id, provider_name, slot_iso)


def schedule_reminder_raw(
    confirmation_id: str, slot_iso: str, channel: str = "sms_simulated"
) -> dict:
    try:
        slot_dt = datetime.fromisoformat(slot_iso.replace("Z", "+00:00"))
    except ValueError:
        # If the model handed us a non-ISO timestamp, schedule the reminder
        # "now + 23 hours" as a safe default — the demo never crashes.
        slot_dt = datetime.now(timezone.utc) + timedelta(hours=24)
    remind_at = slot_dt - timedelta(hours=1)
    return {
        "booking_id": confirmation_id,
        "reminder_at": remind_at.isoformat(),
        "channel": channel,
        "message": (
            f"Reminder scheduled 1 hour before appointment ({remind_at.isoformat()}) "
            f"via {channel}."
        ),
    }


@function_tool
def schedule_reminder(
    confirmation_id: str, slot_iso: str, channel: str = "sms_simulated"
) -> dict:
    """Schedule a reminder 1 hour before the booked slot.

    Args:
        confirmation_id: Booking confirmation ID from simulate_booking.
        slot_iso: ISO-8601 timestamp of the booked appointment.
        channel: Notification channel, e.g. 'sms_simulated', 'whatsapp_simulated'.
    """
    return schedule_reminder_raw(confirmation_id, slot_iso, channel)
