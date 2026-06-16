from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.core.auth import get_current_user
from app.schemas.review import ReviewCreate, ReviewResponse
from app.schemas.user import UserInDB
from app.services import review_service

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("write/{address_id}", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def send_review(
    address_id: UUID,
    review_data: ReviewCreate,
    user: Annotated[UserInDB, Depends(get_current_user)],
) -> ReviewResponse:
    """
    Adds a new review for the given address. Requires an authenticated user.
    """
    return review_service.add_review_for_address(address_id, review_data, user.id)



@router.get("/reviews/id}", response_model=list[ReviewResponse], status_code=status.HTTP_200_OK)
def get_reviews_by_id(id: UUID) -> list[ReviewResponse]:
    """
    Returns specific review for a given ID.
    """