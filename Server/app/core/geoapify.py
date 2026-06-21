import math
from concurrent.futures import ThreadPoolExecutor, as_completed
from decimal import Decimal
from uuid import UUID

import httpx
from fastapi import HTTPException, status

from app.core.config import settings
from app.schemas.address import AddressCreate
from app.schemas.address_static_data import AddressStaticDataCreate

_PLACE_DETAILS_URL = "https://api.geoapify.com/v2/place-details"
_AUTOCOMPLETE_URL = "https://api.geoapify.com/v1/geocode/autocomplete"


def fetch_address(text: str) -> AddressCreate:
    """
    1. Call autocomplete with `text` to collect all candidate place_ids.
    2. Try each place_id against the place details API.
    3. Return an AddressCreate from the first successful result.
    """
    if not settings.geoapify_api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Geoapify API key not configured",
        )

    try:
        ac_resp = httpx.get(
            _AUTOCOMPLETE_URL,
            params={
                "text": text,
                "apiKey": settings.geoapify_api_key,
                "limit": "5",
                "filter": "countrycode:ca",
            },
            timeout=8.0,
        )
        ac_resp.raise_for_status()
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Geoapify autocomplete error: {exc.response.status_code}",
        )
    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not reach Geoapify",
        )

    place_ids = [
        f["properties"]["place_id"]
        for f in ac_resp.json().get("features", [])
        if f.get("properties", {}).get("place_id")
    ]

    if not place_ids:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No autocomplete results found",
        )

    for pid in place_ids:
        try:
            detail_resp = httpx.get(
                _PLACE_DETAILS_URL,
                params={"id": pid, "apiKey": settings.geoapify_api_key},
                timeout=8.0,
            )
            detail_resp.raise_for_status()
            features = detail_resp.json().get("features") or []
            if not features:
                continue
        except (httpx.HTTPStatusError, httpx.RequestError):
            continue

        props = features[0].get("properties", {})
        coords = features[0].get("geometry", {}).get("coordinates", [])

        house = props.get("housenumber", "")
        street = props.get("street", "")
        street_address = f"{house} {street}".strip() if house else street

        try:
            lng = Decimal(str(coords[0])) if len(coords) >= 2 else None
            lat = Decimal(str(coords[1])) if len(coords) >= 2 else None
        except Exception:
            lng, lat = None, None

        return AddressCreate(
            street_address=street_address or props.get("formatted", ""),
            city=props.get("city") or props.get("town") or props.get("village") or "",
            province=props.get("state_code") or props.get("state") or "",
            postal_code=props.get("postcode") or "",
            lat=lat,
            lng=lng,
            google_place_id=pid,
            neighbourhood=props.get("suburb") or props.get("neighbourhood") or props.get("quarter"),
            ward=props.get("district") or props.get("county"),
        )

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="No place details found for any autocomplete result",
    )



def fetch_address_static_data(address_id: UUID, lat: float, lng: float) -> AddressStaticDataCreate:
    if not settings.geoapify_api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Geoapify API key not configured",
        )

    def _nearest(category: str, radius_m: int) -> tuple[int | None, str | None]:
        try:
            resp = httpx.get(
                _PLACE_DETAILS_URL,
                params={
                    "categories": category,
                    "filter": f"circle:{lng},{lat},{radius_m}",
                    "bias": f"proximity:{lng},{lat}",
                    "limit": 1,
                    "apiKey": settings.geoapify_api_key,
                },
                timeout=8.0,
            )
            resp.raise_for_status()
        except (httpx.HTTPStatusError, httpx.RequestError):
            return None, None
        features = resp.json().get("features") or []
        if not features:
            return None, None
        props = features[0].get("properties", {})
        dist = props.get("distance")
        return (int(round(dist)) if dist is not None else None), props.get("name")

    queries: dict[str, tuple[str, int]] = {
        "subway":      ("public_transport.train.underground", 2000),
        "bus":         ("public_transport.bus",               1000),
        "supermarket": ("commercial.supermarket",             2000),
        "pharmacy":    ("healthcare.pharmacy",                2000),
        "hospital":    ("healthcare.hospital",                5000),
        "clinic":      ("healthcare.clinic_or_praxis",        2000),
        "school":      ("education.school",                   2000),
        "park":        ("leisure.park",                       2000),
    }

    results: dict[str, tuple[int | None, str | None]] = {}
    with ThreadPoolExecutor(max_workers=len(queries)) as executor:
        futures = {
            executor.submit(_nearest, cat, radius): key
            for key, (cat, radius) in queries.items()
        }
        for future in as_completed(futures):
            results[futures[future]] = future.result()

    subway_m, subway_name   = results["subway"]
    bus_m,    _             = results["bus"]
    super_m,  _             = results["supermarket"]
    pharm_m,  _             = results["pharmacy"]
    hosp_m,   _             = results["hospital"]
    clinic_m, _             = results["clinic"]
    school_m, school_name   = results["school"]
    park_m,   _             = results["park"]

    def _decay(dist_m: int | None, max_m: int) -> float:
        if dist_m is None:
            return 0.0
        return max(0.0, 1.0 - dist_m / max_m)

    # Transit: subway is primary (up to 100), bus secondary (up to 70)
    if subway_m is not None or bus_m is not None:
        transit_score = min(100, int(max(
            _decay(subway_m, 2000) * 100,
            _decay(bus_m, 1000) * 70,
        )))
    else:
        transit_score = None

    # Walk: weighted access to daily-errand amenities within 1500m
    walk_amenities = [
        (super_m,  1500, 0.35),
        (pharm_m,  1200, 0.20),
        (park_m,   1200, 0.20),
        (school_m, 1500, 0.15),
        (clinic_m, 1500, 0.10),
    ]
    if any(d is not None for d, _, _ in walk_amenities):
        walk_score = min(100, int(sum(_decay(d, mx) * w for d, mx, w in walk_amenities) * 100))
    else:
        walk_score = None

    return AddressStaticDataCreate(
        address_id=address_id,
        walk_score=walk_score,
        transit_score=transit_score,
        nearest_subway_m=subway_m,
        nearest_subway_name=subway_name,
        nearest_bus_stop_m=bus_m,
        nearest_supermarket_m=super_m,
        nearest_pharmacy_m=pharm_m,
        nearest_hospital_m=hosp_m,
        nearest_clinic_m=clinic_m,
        nearest_school_m=school_m,
        nearest_school_name=school_name,
        nearest_park_m=park_m,
    )


