from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.auth import get_current_user
from app.schemas.user import UserInDB, UserResponse

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def me(user: Annotated[UserInDB, Depends(get_current_user)]) -> UserResponse:
    return user
