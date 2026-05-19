# api-contract.md — Backend ↔ Frontend Contract
## AI Service Orchestrator | Challenge 2

> This file is the single source of truth for data shapes.
> Frontend types must mirror this exactly.
> If backend changes a field name, update this file first, then `src/types/api.ts`.

---

## Endpoint

```
POST http://<EXPO_PUBLIC_API_URL>/orchestrate
Content-Type: application/json
```

No authentication required (hackathon scope).

---

## Request Body

```json
{
  "user_prompt": "Mujhe kal subah G-13 mein AC technician chahiye",
  "user_location": {
    "sector": "G-13",
    "city": "Islamabad",
    "lat": 33.65,
    "lng": 72.99
  },
  "current_time": "2026-05-18T22:00:00+05:00"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `user_prompt` | string | YES | Min 5 chars. Any language. |
| `user_location.sector` | string | YES | Islamabad sector (G-13, F-10, etc.) |
| `user_location.city` | string | YES | "Islamabad" for mock dataset |
| `user_location.lat` | number | YES | Latitude |
| `user_location.lng` | number | YES | Longitude |
| `current_time` | string (ISO8601) | NO | If omitted, backend uses `now()` |

---

## Response Body (200 OK)

```json
{
  "intent": {
    "service_type": "AC Technician",
    "location": "G-13",
    "time_window": "tomorrow morning",
    "language_detected": "roman_urdu"
  },
  "top_providers": [
    {
      "name": "Ali AC Services",
      "category": "ac_technician",
      "location": "G-13",
      "distance_km": 2.1,
      "rating": 4.7,
      "availability": "tomorrow 10:00 AM",
      "score": 0.93,
      "reasoning": "Closest available provider with high rating and AC specialization"
    },
    {
      "name": "Karachi Cool Systems",
      "category": "ac_technician",
      "location": "F-11",
      "distance_km": 4.3,
      "rating": 4.5,
      "availability": "tomorrow 11:00 AM",
      "score": 0.78,
      "reasoning": "Slightly farther but strong review recency and low cancellation rate"
    },
    {
      "name": "QuickFix AC",
      "category": "ac_technician",
      "location": "G-9",
      "distance_km": 6.1,
      "rating": 4.2,
      "availability": "tomorrow 2:00 PM",
      "score": 0.61,
      "reasoning": "Available but lower rating and afternoon slot"
    }
  ],
  "recommended": {
    "name": "Ali AC Services",
    "category": "ac_technician",
    "location": "G-13",
    "distance_km": 2.1,
    "rating": 4.7,
    "availability": "tomorrow 10:00 AM",
    "score": 0.93,
    "reasoning": "Closest available provider with high rating and AC specialization"
  },
  "booking": {
    "provider": "Ali AC Services",
    "slot": "2026-05-19T10:00:00+05:00",
    "confirmation_id": "BK-20260519-0001",
    "message": "Slot booked: 10:00 AM. Confirmation sent."
  },
  "followup": {
    "reminder_at": "2026-05-19T09:00:00+05:00",
    "channel": "sms_simulated",
    "message": "Reminder scheduled 1 hour before appointment"
  },
  "trace": {
    "workflow_id": "wf_abc123",
    "steps": [
      {
        "agent": "IntentParser",
        "summary": "Detected: AC Technician | Location: G-13 | Time: tomorrow morning | Language: Roman Urdu"
      },
      {
        "agent": "ProviderFinder",
        "summary": "Found 8 AC technician providers across G-13, F-10, F-11, G-9 sectors"
      },
      {
        "agent": "Ranker",
        "summary": "Scored 8 providers. Top score: Ali AC Services (0.93). Weights: distance 40%, rating 30%, availability 30%"
      },
      {
        "agent": "Booking",
        "summary": "Booked slot 10:00 AM with Ali AC Services. Confirmation ID: BK-20260519-0001"
      },
      {
        "agent": "FollowUp",
        "summary": "Reminder scheduled via sms_simulated for 09:00 AM on 2026-05-19"
      }
    ]
  }
}
```

---

## Field Reference

### `intent`

| Field | Type | Values |
|---|---|---|
| `service_type` | string | Human-readable, e.g. "AC Technician", "Plumber" |
| `location` | string | Sector string, e.g. "G-13" |
| `time_window` | string | Natural language, e.g. "tomorrow morning" |
| `language_detected` | string | `"english"` \| `"urdu"` \| `"roman_urdu"` |

### `top_providers[]` and `recommended`

| Field | Type | Notes |
|---|---|---|
| `name` | string | Provider business name |
| `category` | string | Snake_case, e.g. `"ac_technician"` |
| `location` | string | Sector |
| `distance_km` | number | Float, e.g. `2.1` |
| `rating` | number | 0–5, one decimal, e.g. `4.7` |
| `availability` | string | Human-readable slot, e.g. `"tomorrow 10:00 AM"` |
| `score` | number | 0–1 float, e.g. `0.93` |
| `reasoning` | string | 1–2 sentence explanation from the Ranker agent |

### `booking`

| Field | Type | Notes |
|---|---|---|
| `provider` | string | Provider name |
| `slot` | string | ISO8601 datetime |
| `confirmation_id` | string | Format: `BK-YYYYMMDD-NNNN` |
| `message` | string | Short confirmation message |

### `followup`

| Field | Type | Notes |
|---|---|---|
| `reminder_at` | string | ISO8601 datetime |
| `channel` | string | `"sms_simulated"` |
| `message` | string | Human-readable reminder description |

### `trace`

| Field | Type | Notes |
|---|---|---|
| `workflow_id` | string | Unique ID for this orchestration run |
| `steps[]` | TraceStep[] | In order: IntentParser → ProviderFinder → Ranker → Booking → FollowUp |
| `steps[].agent` | string | Agent name |
| `steps[].summary` | string | What this agent did/decided |

---

## Error Response

```json
{
  "detail": "Low confidence language parsing: service type unclear",
  "error_code": "LOW_CONFIDENCE",
  "agent": "IntentParser",
  "fallback_prompt": "Did you mean: AC repair, plumber, or electrician?"
}
```

Frontend must handle:
- `LOW_CONFIDENCE` → show a clarification dialog with `fallback_prompt`
- `NO_PROVIDERS` → show "No providers found" with alternate suggestion
- `BOOKING_FAILED` → show retry with different slot
- Network failure → show generic retry with mock fallback option

---

## Sector ↔ Coordinates Reference (Islamabad Mock Data)

| Sector | Lat | Lng |
|---|---|---|
| G-13 | 33.650 | 72.990 |
| F-10 | 33.706 | 73.022 |
| F-11 | 33.716 | 73.010 |
| G-9  | 33.682 | 73.030 |
| I-8  | 33.671 | 73.064 |

Default to G-13 if location is not provided or not recognized.

---

## Environment Variables

```bash
# .env.local
EXPO_PUBLIC_API_URL=http://192.168.x.x:8000   # Your local FastAPI server IP
EXPO_PUBLIC_USE_MOCK=false                     # Set to true for offline demo
```

**Important for demo day:** Use your machine's local network IP (not `localhost`) so the phone can reach the server. Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux) to find it.
