from fastapi import APIRouter, Response, status

from app.core.config import settings
from app.schemas.login import LoginRequest
from app.services.user_service import login_user

router = APIRouter()


@router.post("/login", status_code=status.HTTP_200_OK)
def login(data: LoginRequest, response: Response) -> dict:
    token = login_user(data)
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,        # set True in production (requires HTTPS)
        samesite="lax",
        max_age=settings.access_token_expire_minutes * 60,
        path="/",
    )
    return {"ok": True}
