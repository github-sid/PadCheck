from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class AddressStaticDataCreate(BaseModel):
    address_id: UUID
    walk_score: int | None = Field(default=None, ge=0, le=100)
    transit_score: int | None = Field(default=None, ge=0, le=100)
    nearest_subway_m: int | None = Field(default=None, ge=0)
    nearest_subway_name: str | None = None
    nearest_bus_stop_m: int | None = Field(default=None, ge=0)
    nearest_supermarket_m: int | None = Field(default=None, ge=0)
    nearest_pharmacy_m: int | None = Field(default=None, ge=0)
    nearest_hospital_m: int | None = Field(default=None, ge=0)
    nearest_clinic_m: int | None = Field(default=None, ge=0)
    nearest_school_m: int | None = Field(default=None, ge=0)
    nearest_school_name: str | None = None
    nearest_park_m: int | None = Field(default=None, ge=0)
    bike_lane_access: bool | None = None
    isp_options: list[str] = Field(default_factory=list)


class AddressStaticDataResponse(AddressStaticDataCreate):
    id: UUID
    fetched_at: datetime

    model_config = {"from_attributes": True}
