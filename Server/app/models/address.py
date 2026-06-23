from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from uuid import UUID


@dataclass
class Address:
    id: UUID
    street_address: str
    city: str
    province: str
    postal_code: str
    created_at: datetime
    updated_at: datetime
    unit_number: str | None = None
    lat: Decimal | None = None
    lng: Decimal | None = None
    google_place_id: str | None = None
    neighbourhood: str | None = None
    ward: str | None = None
    street_view_url: str | None = None
