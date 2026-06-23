import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, health, property, review

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)

_startup_logger = logging.getLogger(__name__)


def _log_settings() -> None:
    from app.core.config import settings
    _startup_logger.info(
        "Settings loaded — google_maps_api_key=%s aws_s3_bucket=%r aws_region=%s aws_access_key_id=%s",
        bool(settings.google_maps_api_key),
        settings.aws_s3_bucket,
        settings.aws_region,
        bool(settings.aws_access_key_id),
    )


def create_app() -> FastAPI:
    _log_settings()
    app = FastAPI(
        title="PadCheck API",
        description="Rental property review platform API",
        version="0.1.0",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(auth.router)
    app.include_router(property.router)
    app.include_router(review.router)

    return app
