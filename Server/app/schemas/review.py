from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ReviewBase(BaseModel):
    property_id: UUID
    rating: int = Field(ge=1, le=5)
    title: str = Field(min_length=1)
    content: str = Field(min_length=1)


class ReviewCreate(ReviewBase):
    pass


class ReviewResponse(ReviewBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}
