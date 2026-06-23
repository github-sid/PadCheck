from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    address_id: UUID

    # Required ratings
    rating_overall: int = Field(ge=1, le=5)
    rating_noise: int = Field(ge=1, le=5)
    rating_safety: int = Field(ge=1, le=5)
    rating_transit: int = Field(ge=1, le=5)
    rating_amenities: int = Field(ge=1, le=5)
    rating_landlord: int = Field(ge=1, le=5)

    # Optional detail ratings
    noise_level_day: int | None = Field(default=None, ge=1, le=5)
    noise_level_night: int | None = Field(default=None, ge=1, le=5)
    street_lighting: int | None = Field(default=None, ge=1, le=5)
    parking_ease: int | None = Field(default=None, ge=1, le=5)
    cell_signal: int | None = Field(default=None, ge=1, le=5)

    # Qualitative
    construction_present: bool | None = None
    review_text: str | None = None
    red_flags: list[str] = Field(default_factory=list)
    photo_urls: list[str] = Field(default_factory=list)

    # Tenancy window
    tenancy_start: datetime | None = None
    tenancy_end: datetime | None = None


class ReviewResponse(ReviewCreate):
    id: UUID
    user_id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}
