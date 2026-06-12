from uuid import UUID

from pydantic import BaseModel, Field


class ReviewAIAnalysisBase(BaseModel):
    summary: str = Field(min_length=1)
    pros: list[str] = Field(default_factory=list)
    cons: list[str] = Field(default_factory=list)
    sentiment: str = Field(min_length=1)


class ReviewAIAnalysisCreate(ReviewAIAnalysisBase):
    review_id: UUID


class ReviewAIAnalysisResponse(ReviewAIAnalysisBase):
    id: UUID
    review_id: UUID

    model_config = {"from_attributes": True}
