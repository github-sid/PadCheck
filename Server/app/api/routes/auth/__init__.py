from fastapi import APIRouter

from app.api.routes.auth import google, login, logout, me, register

router = APIRouter(prefix="/auth", tags=["auth"])
router.include_router(register.router)
router.include_router(login.router)
router.include_router(logout.router)
router.include_router(me.router)
router.include_router(google.router)
