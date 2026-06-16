from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID


@dataclass
class AddressStaticData:
    id: UUID
    address_id: UUID
    fetched_at: datetime
    walk_score: int | None = None
    transit_score: int | None = None
    nearest_subway_m: int | None = None
    nearest_subway_name: str | None = None
    nearest_bus_stop_m: int | None = None
    nearest_supermarket_m: int | None = None
    nearest_pharmacy_m: int | None = None
    nearest_hospital_m: int | None = None
    nearest_clinic_m: int | None = None
    nearest_school_m: int | None = None
    nearest_school_name: str | None = None
    nearest_park_m: int | None = None
    bike_lane_access: bool | None = None
    isp_options: list[str] = field(default_factory=list)
