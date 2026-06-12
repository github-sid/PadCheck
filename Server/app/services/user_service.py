from fastapi import HTTPException, status

from app.core.auth import create_access_token, hash_password, verify_password
from app.repositories.user_repository import create_user, get_user_by_email
from app.schemas.user import UserCreate, UserResponse
from app.schemas.login import LoginRequest
from app.models.user import User



def register_user(data: UserCreate) -> UserResponse:
    if get_user_by_email(data.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    hashed_password = (
        hash_password(data.password) if data.provider == "email" else None
    )

    user = create_user(
        email=data.email,
        hashed_password=hashed_password,
        provider=data.provider,
    )

    return UserResponse.model_validate(user)


def login_user(data: LoginRequest) -> str:
    user = get_user_by_email(data.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.hashed_password or not verify_password(
        data.password, user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )
    return create_access_token(user.id, user.role)


def google_upsert_user(email: str) -> User:
    """Return existing user or create a new Google-provider account."""
    user = get_user_by_email(email)
    if user:
        return user
    return create_user(email=email, hashed_password=None, provider="gmail")