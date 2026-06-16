from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from uuid import UUID


@dataclass
class AddressCommunityData:
    id: UUID
    address_id: UUID
    review_count: int
    last_updated: datetime
    avg_noise_day: Decimal | None = None
    avg_noise_night: Decimal | None = None
    avg_street_lighting: Decimal | None = None
    avg_parking_ease: Decimal | None = None
    avg_cell_signal: Decimal | None = None
    avg_safety_feel: Decimal | None = None
    construction_nearby: bool | None = None
