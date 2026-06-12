from uuid import UUID

from pydantic import BaseModel, Field


class LandlordBase(BaseModel):
    name: str = Field(min_length=1)


class LandlordCreate(LandlordBase):
    pass


class LandlordResponse(LandlordBase):
    id: UUID

    model_config = {"from_attributes": True}
