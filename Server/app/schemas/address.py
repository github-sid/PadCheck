from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel


class AddressCreate(BaseModel):
    street_address: str
    city: str
    province: str
    postal_code: str
    unit_number: str | None = None
    lat: Decimal | None = None
    lng: Decimal | None = None
    google_place_id: str | None = None
    neighbourhood: str | None = None
    ward: str | None = None


class AddressResponse(BaseModel):
    id: UUID
    street_address: str
    city: str
    province: str
    postal_code: str
    unit_number: str | None
    lat: Decimal | None
    lng: Decimal | None
    google_place_id: str | None
    neighbourhood: str | None
    ward: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
