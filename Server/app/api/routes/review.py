from typing import Annotated
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, UploadFile, status

from app.core.auth import get_current_user
from app.core.review_images import upload_review_photos
from app.schemas.review import ReviewCreate, ReviewResponse
from app.schemas.user import UserInDB
from app.services import review_service

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("/photos", status_code=status.HTTP_200_OK)
def upload_photos(
    files: Annotated[list[UploadFile], File()],
    _user: Annotated[UserInDB, Depends(get_current_user)],
) -> dict:
    """
    Upload up to 6 review photos to S3. Returns presigned S3 URLs.
    Call this before submitting the review, then pass the returned URLs in photo_urls.
    """
    batch_id = uuid4()
    urls = upload_review_photos(batch_id, files[:6])
    return {"urls": urls}


@router.post("/write/{address_id}", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
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