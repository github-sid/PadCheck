import hashlib
import hmac
import secrets
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, HTTPException, Query, status
from fastapi.responses import RedirectResponse

from app.core.auth import create_access_token
from app.core.config import settings
from app.services.user_service import google_upsert_user

router = APIRouter()

_GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
_GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
_GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"

# ── CSRF state helpers ────────────────────────────────────────────────────────
# State is signed with our secret key so we never need to store it server-side.
# Format sent to Google:  "<random>.<hmac-signature>"

def _sign_state(token: str) -> str:
    return hmac.new(
        settings.secret_key.encode(),
        token.encode(),
        hashlib.sha256,
    ).hexdigest()


def _make_state() -> str:
    token = secrets.token_urlsafe(32)
    return f"{token}.{_sign_state(token)}"


def _verify_state(state: str) -> bool:
    try:
        token, sig = state.rsplit(".", 1)
        return hmac.compare_digest(_sign_state(token), sig)
    except ValueError:
        return False


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/google")
def google_login() -> RedirectResponse:
    """Redirect the browser to Google's OAuth consent screen."""
    params = urlencode({
        "client_id": settings.google_client_id,
        "redirect_uri": settings.google_redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "state": _make_state(),
    })
    return RedirectResponse(f"{_GOOGLE_AUTH_URL}?{params}")


@router.get("/google/callback")
def google_callback(
    code: str = Query(...),
    state: str = Query(...),
) -> RedirectResponse:
    """
    Google redirects here after the user approves.
    1. Verify CSRF state.
    2. Exchange code for Google tokens.
    3. Fetch the user's email from Google.
    4. Upsert the user in our DB.
    5. Mint our JWT and set it as an HttpOnly cookie.
    6. Redirect to the frontend.
    """
    if not _verify_state(state):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid state")

    # Exchange authorisation code for Google tokens
    with httpx.Client() as client:
        token_res = client.post(
            _GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "redirect_uri": settings.google_redirect_uri,
                "grant_type": "authorization_code",
            },
        )

    if token_res.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to exchange code with Google",
        )

    google_access_token = token_res.json().get("access_token")

    # Fetch the user's email from Google
    with httpx.Client() as client:
        userinfo_res = client.get(
            _GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {google_access_token}"},
        )

    if userinfo_res.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to fetch user info from Google",
        )

    email: str = userinfo_res.json().get("email", "").lower()
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account has no email address",
        )

    user = google_upsert_user(email)
    jwt_token = create_access_token(user.id, user.role)

    # Set JWT as an HttpOnly cookie and redirect to the frontend.
    # HttpOnly = JavaScript on the page can NEVER read this cookie.
    # The browser attaches it automatically on every request to this domain.
    response = RedirectResponse(url=settings.frontend_url, status_code=302)
    response.set_cookie(
        key="access_token",
        value=jwt_token,
        httponly=True,
        secure=False,        # set True in production (HTTPS required)
        samesite="lax",      # lax required for OAuth redirect flow
        max_age=settings.access_token_expire_minutes * 60,
        path="/",
    )
    return response
