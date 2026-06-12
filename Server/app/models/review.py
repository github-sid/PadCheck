from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass
class Review:
    id: UUID
    user_id: UUID
    property_id: UUID
    rating: int
    title: str
    content: str
    created_at: datetime
