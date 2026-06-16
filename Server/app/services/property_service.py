from uuid import UUID

from fastapi import HTTPException, status

from app.core.geoapify import fetch_address_by_place_id, fetch_address_static_data
from app.repositories import (
    address_community_data_repository,
    address_repository,
    address_static_data_repository,
)
from app.schemas.address import AddressCreate, AddressResponse
from app.schemas.address_community_data import AddressCommunityDataResponse
from app.schemas.address_static_data import AddressStaticDataResponse
from app.services import review_service


def get_property_page_data(address_id: UUID) -> dict:
    address = address_repository.get_address_by_id(address_id)
    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found",
        )

    community = address_community_data_repository.get_by_address_id(address_id)
    static = address_static_data_repository.get_by_address_id(address_id)
    reviews = review_service.find_review_by_address_id(address_id)

    return {
        "address": AddressResponse.model_validate(address.__dict__),
        "community": AddressCommunityDataResponse.model_validate(community.__dict__)
        if community
        else None,
        "static": AddressStaticDataResponse.model_validate(static.__dict__)
        if static
        else None,
        "reviews": reviews,
    }


def find_or_create_from_place_id(place_id: str) -> AddressResponse:
    """
    Main entry point for the search flow.
    1. Check DB by place_id — return immediately if found.
    2. Fetch full details from Geoapify.
    3. Persist and return the new record.
    """
    existing = address_repository.get_address_by_place_id(place_id)
    if existing:
        return AddressResponse.model_validate(existing.__dict__)

    address_data: AddressCreate = fetch_address_by_place_id(place_id)
    address = address_repository.create_address(address_data)

    try:
        if address_data.lat is not None and address_data.lng is not None:
            static_data = fetch_address_static_data(
                address.id, float(address_data.lat), float(address_data.lng)
            )
            address_static_data_repository.upsert(static_data)
    except Exception:
        address_repository.delete_address(address.id)
        raise

    return AddressResponse.model_validate(address.__dict__)
