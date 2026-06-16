from uuid import UUID

from app.repositories import review_repository
from app.schemas.review import ReviewCreate, ReviewResponse


def find_review_by_address_id(address_id: UUID) -> list[ReviewResponse]:
    """
    Fetches all reviews for a given address ID.
    Implement pagination if the number of reviews can be large.
    """
    reviews = review_repository.get_by_address_id(address_id)
    return [ReviewResponse.model_validate(review.__dict__) for review in reviews]


def add_review_for_address(
    address_id: UUID, review_data: ReviewCreate, user_id: UUID
) -> ReviewResponse:
    """
    Adds a new review for a given address ID.
    """
    review_data = review_data.model_copy(update={"address_id": address_id})
    review = review_repository.create_review(review_data, user_id)
    return ReviewResponse.model_validate(review.__dict__)
