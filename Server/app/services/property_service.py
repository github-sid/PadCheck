from uuid import UUID

from fastapi import HTTPException, status

from app.core.address_normalize import build_canonical_key
from app.core.geoapify import fetch_address, fetch_address_static_data
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


def find_or_create_from_place_id(address: str) -> AddressResponse:
    """
    Main entry point for the search flow.
    1. Fetch structured address data from Geoapify.
    2. Compute canonical key and check DB — return immediately if found.
    3. Persist and return the new record.
    """
    
      



    address_data: AddressCreate = fetch_address(address)
    key = build_canonical_key(address_data.street_address, address_data.unit_number, address_data.postal_code)

    existing = address_repository.get_address_by_canonical_key(key)
    if existing:
        return AddressResponse.model_validate(existing.__dict__)

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
