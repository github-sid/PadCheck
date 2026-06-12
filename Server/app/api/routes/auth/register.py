from fastapi import APIRouter, status

from app.schemas.user import UserCreate, UserResponse
from app.services.user_service import register_user

router = APIRouter()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    name="register",
)
async def register(data: UserCreate) -> UserResponse:
    return register_user(data)
