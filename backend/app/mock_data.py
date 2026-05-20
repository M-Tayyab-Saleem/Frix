"""Mock provider dataset for Islamabad sectors.

Each provider includes a primary `sector` we use to compute distance to the user's requested sector.
"""

from __future__ import annotations

# Centroids (lat, lng) for Islamabad sectors as defined in api-contract.md.
# Used by tools.find_providers to compute distance_km between user and provider.
SECTOR_COORDS: dict[str, tuple[float, float]] = {
    "G-13": (33.650, 72.990),
    "F-10": (33.706, 73.022),
    "F-11": (33.716, 73.010),
    "G-9": (33.682, 73.030),
    "I-8": (33.671, 73.064),
}


MOCK_PROVIDERS: list[dict] = [
    # ---- AC technicians ----------------------------------------------------
    {
        "id": "p_001",
        "name": "Ali AC Services",
        "category": "ac_technician",
        "sector": "G-13",
        "rating": 4.7,
        "availability": "tomorrow 10:00 AM",
        "price_range": "PKR 1500–3000",
    },
    {
        "id": "p_002",
        "name": "CoolBreeze Technicians",
        "category": "ac_technician",
        "sector": "F-11",
        "rating": 4.5,
        "availability": "tomorrow 12:00 PM",
        "price_range": "PKR 1800–3200",
    },
    {
        "id": "p_003",
        "name": "ChillPro AC Repair",
        "category": "ac_technician",
        "sector": "I-8",
        "rating": 4.3,
        "availability": "today 8:00 PM",
        "price_range": "PKR 1200–2800",
    },
    {
        "id": "p_004",
        "name": "Frosty Fix",
        "category": "ac_technician",
        "sector": "F-10",
        "rating": 4.6,
        "availability": "tomorrow 9:00 AM",
        "price_range": "PKR 2000–3500",
    },

    # ---- Plumbers ----------------------------------------------------------
    {
        "id": "p_010",
        "name": "Rana Plumbing Works",
        "category": "plumber",
        "sector": "G-9",
        "rating": 4.4,
        "availability": "today 6:00 PM",
        "price_range": "PKR 800–2000",
    },
    {
        "id": "p_011",
        "name": "Quick Pipe Service",
        "category": "plumber",
        "sector": "G-13",
        "rating": 4.2,
        "availability": "tomorrow 11:00 AM",
        "price_range": "PKR 1000–2200",
    },
    {
        "id": "p_012",
        "name": "Flowmaster Plumbers",
        "category": "plumber",
        "sector": "F-10",
        "rating": 4.8,
        "availability": "tomorrow 2:00 PM",
        "price_range": "PKR 1200–2500",
    },

    # ---- Electricians ------------------------------------------------------
    {
        "id": "p_020",
        "name": "Sparks Electricals",
        "category": "electrician",
        "sector": "F-11",
        "rating": 4.6,
        "availability": "today 7:00 PM",
        "price_range": "PKR 900–2400",
    },
    {
        "id": "p_021",
        "name": "Voltage Masters",
        "category": "electrician",
        "sector": "I-8",
        "rating": 4.1,
        "availability": "tomorrow 10:30 AM",
        "price_range": "PKR 1000–2600",
    },
    {
        "id": "p_022",
        "name": "WireRight Solutions",
        "category": "electrician",
        "sector": "G-13",
        "rating": 4.5,
        "availability": "tomorrow 9:30 AM",
        "price_range": "PKR 1100–2800",
    },

    # ---- Cleaners / maids --------------------------------------------------
    {
        "id": "p_030",
        "name": "ShinyHome Cleaning",
        "category": "house_cleaner",
        "sector": "F-10",
        "rating": 4.7,
        "availability": "tomorrow 8:00 AM",
        "price_range": "PKR 2500–5000",
    },
    {
        "id": "p_031",
        "name": "FreshNest Services",
        "category": "house_cleaner",
        "sector": "G-13",
        "rating": 4.3,
        "availability": "tomorrow 11:00 AM",
        "price_range": "PKR 2200–4500",
    },

    # ---- Carpenters --------------------------------------------------------
    {
        "id": "p_040",
        "name": "Master Wood Works",
        "category": "carpenter",
        "sector": "G-9",
        "rating": 4.5,
        "availability": "day after tomorrow 10:00 AM",
        "price_range": "PKR 1500–4000",
    },
    {
        "id": "p_041",
        "name": "Precision Carpentry",
        "category": "carpenter",
        "sector": "F-11",
        "rating": 4.6,
        "availability": "tomorrow 3:00 PM",
        "price_range": "PKR 1800–4200",
    },
]
