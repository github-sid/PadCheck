import logging
import threading
from uuid import UUID

from fastapi import HTTPException, status

from app.core.geoapify import fetch_address, fetch_address_static_data
from app.core.street_view import fetch_and_upload_street_view

logger = logging.getLogger(__name__)

_place_locks: dict[str, threading.Lock] = {}
_place_locks_mutex = threading.Lock()


def _get_place_lock(place_id: str) -> threading.Lock:
    with _place_locks_mutex:
        if place_id not in _place_locks:
            _place_locks[place_id] = threading.Lock()
        return _place_locks[place_id]


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
    with _get_place_lock(place_id):
        address_data: AddressCreate = fetch_address(place_id)

        if address_data.google_place_id:
            existing = address_repository.get_address_by_google_place_id(address_data.google_place_id)
            if existing:
                logger.info("property_service: address already exists id=%s, skipping street view", existing.id)
                return AddressResponse.model_validate(existing.__dict__)

        address = address_repository.create_address(address_data)

        if address is None:
            # Lost an INSERT ON CONFLICT race (cross-worker); fetch the winner's row
            existing = address_repository.get_address_by_google_place_id(address_data.google_place_id)
            logger.info("property_service: conflict on insert, returning existing id=%s", existing.id if existing else None)
            return AddressResponse.model_validate(existing.__dict__)

        try:
            if address_data.lat is not None and address_data.lng is not None:
                static_data = fetch_address_static_data(
                    address.id, float(address_data.lat), float(address_data.lng)
                )
                address_static_data_repository.upsert(static_data)
        except Exception:
            address_repository.delete_address(address.id)
            raise

        if address_data.lat is not None and address_data.lng is not None:
            logger.info("property_service: fetching street view for address_id=%s lat=%s lng=%s", address.id, address_data.lat, address_data.lng)
            s3_url = fetch_and_upload_street_view(
                address.id, float(address_data.lat), float(address_data.lng)
            )
            if s3_url:
                logger.info("property_service: street view uploaded url=%s", s3_url)
                address_repository.update_street_view_url(address.id, s3_url)
                address.street_view_url = s3_url
            else:
                logger.info("property_service: no street view url returned for address_id=%s", address.id)
        else:
            logger.info("property_service: skipping street view, no coords for address_id=%s", address.id)

        return AddressResponse.model_validate(address.__dict__)
