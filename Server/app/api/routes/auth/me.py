from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.auth import get_current_user
from app.schemas.user import UserInDB, UserResponse, UserUpdate
from app.services.user_service import update_user_profile

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def me(user: Annotated[UserInDB, Depends(get_current_user)]) -> UserResponse:
    return user


@router.patch("/me", response_model=UserResponse)
async def update_me(
    data: UserUpdate,
    user: Annotated[UserInDB, Depends(get_current_user)],
) -> UserResponse:
    return update_user_profile(user.id, data)
