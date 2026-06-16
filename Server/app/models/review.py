from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID


@dataclass
class Review:
    id: UUID
    address_id: UUID
    user_id: UUID
    rating_overall: int
    rating_noise: int
    rating_safety: int
    rating_transit: int
    rating_amenities: int
    rating_landlord: int
    created_at: datetime
    noise_level_day: int | None = None
    noise_level_night: int | None = None
    street_lighting: int | None = None
    parking_ease: int | None = None
    cell_signal: int | None = None
    construction_present: bool | None = None
    review_text: str | None = None
    red_flags: list[str] = field(default_factory=list)
    ai_summary: str | None = None
    tenancy_start: datetime | None = None
    tenancy_end: datetime | None = None
