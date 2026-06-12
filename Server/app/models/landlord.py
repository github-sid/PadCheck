from dataclasses import dataclass
from uuid import UUID


@dataclass
class Landlord:
    id: UUID
    name: str
