from dataclasses import dataclass
from uuid import UUID


@dataclass
class ReviewAIAnalysis:
    id: UUID
    review_id: UUID
    summary: str
    pros: list[str]
    cons: list[str]
    sentiment: str
