from fastapi import APIRouter, Response, status

router = APIRouter()


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(response: Response) -> dict:
    response.delete_cookie(key="access_token", path="/", samesite="lax")
    return {"ok": True}
