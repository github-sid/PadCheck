from concurrent.futures import ThreadPoolExecutor, as_completed
from decimal import Decimal
from uuid import UUID

import httpx 
from fastapi import HTTPException, status

from app.core.config import settings
from app.schemas.address import AddressCreate
from app.schemas.address_static_data import AddressStaticDataCreate

_GOOGLE_PLACE_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json"
_GOOGLE_NEARBY_SEARCH_URL = "https://places.googleapis.com/v1/places:searchNearby"


def _get_component(components: list, type_: str, name: str = "long_name") -> str:
    for c in components:
        if type_ in c.get("types", []):
            return c.get(name, "")
    return ""


def fetch_address(place_id: str) -> AddressCreate:
    if not settings.google_maps_api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google Maps API key not configured",
        )

    try:
        resp = httpx.get(
            _GOOGLE_PLACE_DETAILS_URL,
            params={
                "place_id": place_id,
                "fields": "address_components,geometry,formatted_address",
                "key": settings.google_maps_api_key,
            },
            timeout=8.0,
        )
        resp.raise_for_status()
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Google Places error: {exc.response.status_code}",
        )
    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not reach Google Places API",
        )

    data = resp.json()
    print(f"[fetch_address] place_id={place_id} status={data.get('status')} error={data.get('error_message')}")
    if data.get("status") != "OK":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No result for place_id: {place_id} — {data.get('status')}",
        )

    result = data["result"]
    components = result.get("address_components", [])
    location = result.get("geometry", {}).get("location", {})

    street_number = _get_component(components, "street_number")
    route = _get_component(components, "route")
    street_address = f"{street_number} {route}".strip() if street_number else route

    try:
        lat = Decimal(str(location["lat"])) if "lat" in location else None
        lng = Decimal(str(location["lng"])) if "lng" in location else None
    except Exception:
        lat, lng = None, None

    return AddressCreate(
        street_address=street_address or result.get("formatted_address", ""),
        city=(
            _get_component(components, "locality")
            or _get_component(components, "administrative_area_level_3")
        ),
        province=_get_component(components, "administrative_area_level_1", "short_name"),
        postal_code=_get_component(components, "postal_code"),
        lat=lat,
        lng=lng,
        google_place_id=place_id,
        neighbourhood=(
            _get_component(components, "neighborhood")
            or _get_component(components, "sublocality_level_1")
        ),
        ward=_get_component(components, "administrative_area_level_2"),
    )



def fetch_address_static_data(address_id: UUID, lat: float, lng: float) -> AddressStaticDataCreate:
    if not settings.google_maps_api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google Maps API key not configured",
        )

    def _nearest(google_type: str) -> tuple[int | None, str | None]:
        try:
            resp = httpx.post(
                _GOOGLE_NEARBY_SEARCH_URL,
                headers={
                    "X-Goog-Api-Key": settings.google_maps_api_key,
                    "X-Goog-FieldMask": "places.displayName",
                },
                json={
                    "includedTypes": [google_type],
                    "locationRestriction": {
                        "circle": {
                            "center": {"latitude": lat, "longitude": lng},
                            "radius": 1000.0,
                        }
                    },
                    "rankPreference": "DISTANCE",
                    "maxResultCount": 1,
                },
                timeout=8.0,
            )
            resp.raise_for_status()
        except (httpx.HTTPStatusError, httpx.RequestError):
            return None, None
        places = resp.json().get("places") or []
        if not places:
            return None, None
        name = places[0].get("displayName", {}).get("text")
        return 1000, name

    queries: dict[str, str] = {
        "subway":      "subway_station",
        "bus":         "bus_station",
        "supermarket": "supermarket",
        "pharmacy":    "pharmacy",
        "hospital":    "hospital",
        "clinic":      "doctor",
        "school":      "school",
        "park":        "park",
    }

    results: dict[str, tuple[int | None, str | None]] = {}
    with ThreadPoolExecutor(max_workers=len(queries)) as executor:
        futures = {
            executor.submit(_nearest, google_type): key
            for key, google_type in queries.items()
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


