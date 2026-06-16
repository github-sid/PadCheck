from uuid import UUID

from fastapi import APIRouter, status
from pydantic import BaseModel

from app.schemas.address import AddressResponse
from app.schemas.address_community_data import AddressCommunityDataResponse
from app.schemas.address_static_data import AddressStaticDataResponse
from app.schemas.review import ReviewResponse
from app.services import property_service

router = APIRouter(prefix="/properties", tags=["properties"])


class LookupRequest(BaseModel):
    place_id: str


class PropertyPageResponse(BaseModel):
    address: AddressResponse
    community: AddressCommunityDataResponse | None
    static: AddressStaticDataResponse | None
    reviews: list[ReviewResponse]


@router.post("/lookup", response_model=AddressResponse, status_code=status.HTTP_200_OK)
def lookup(body: LookupRequest) -> AddressResponse:
    """
    Called when a user picks an address from the search box.
    Returns the existing DB record or fetches from Geoapify and creates it.
    Respond with the address id so the frontend can navigate to /property/{id}.
    """

    return property_service.find_or_create_from_place_id(body.place_id)


@router.get("/{address_id}", response_model=PropertyPageResponse, status_code=status.HTTP_200_OK)
def get_property(address_id: UUID) -> PropertyPageResponse:
    """
    Returns everything the property detail page needs:
    address info, community aggregates, static neighbourhood data, and reviews.
    """
    data = property_service.get_property_page_data(address_id)
    return PropertyPageResponse(**data)
