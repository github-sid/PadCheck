from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class AddressCommunityDataUpdate(BaseModel):
    address_id: UUID
    avg_noise_day: Decimal | None = Field(default=None, ge=1, le=5)
    avg_noise_night: Decimal | None = Field(default=None, ge=1, le=5)
    avg_street_lighting: Decimal | None = Field(default=None, ge=1, le=5)
    avg_parking_ease: Decimal | None = Field(default=None, ge=1, le=5)
    avg_cell_signal: Decimal | None = Field(default=None, ge=1, le=5)
    avg_safety_feel: Decimal | None = Field(default=None, ge=1, le=5)
    construction_nearby: bool | None = None
    review_count: int = Field(default=0, ge=0)


class AddressCommunityDataResponse(AddressCommunityDataUpdate):
    id: UUID
    last_updated: datetime

    model_config = {"from_attributes": True}
