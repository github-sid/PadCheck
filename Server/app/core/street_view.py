import logging
from uuid import UUID

import boto3
import httpx
from botocore.exceptions import BotoCoreError, ClientError

from app.core.config import settings

logger = logging.getLogger(__name__)

_STREET_VIEW_URL = "https://maps.googleapis.com/maps/api/streetview"
_S3_KEY_PREFIX = "street-view"


def fetch_and_upload_street_view(address_id: UUID, lat: float, lng: float) -> str | None:
    if not settings.google_maps_api_key or not settings.aws_s3_bucket:
        logger.warning(
            "Street View: skipping — google_maps_api_key set=%s, aws_s3_bucket set=%s",
            bool(settings.google_maps_api_key),
            bool(settings.aws_s3_bucket),
        )
        return None

    try:
        resp = httpx.get(
            _STREET_VIEW_URL,
            params={
                "size": "800x600",
                "location": f"{lat},{lng}",
                "key": settings.google_maps_api_key,
            },
            timeout=10.0,
        )
        resp.raise_for_status()
    except (httpx.HTTPStatusError, httpx.RequestError):
        return None

    # Google returns a grey "no imagery" placeholder with a 200 status.
    # Detect it by content type — real images are image/jpeg.
    content_type = resp.headers.get("content-type", "")
    if "image/jpeg" not in content_type:
        logger.info("Street View: no imagery for address_id=%s (content-type=%s)", address_id, content_type)
        return None

    logger.info("Street View: received image for address_id=%s (%d bytes)", address_id, len(resp.content))

    s3_key = f"{_S3_KEY_PREFIX}/{address_id}.jpg"
    try:
        s3 = boto3.client(
            "s3",
            region_name=settings.aws_region,
            aws_access_key_id=settings.aws_access_key_id or None,
            aws_secret_access_key=settings.aws_secret_access_key or None,
        )
        s3_resp = s3.put_object(
            Bucket=settings.aws_s3_bucket,
            Key=s3_key,
            Body=resp.content,
            ContentType="image/jpeg",
        )
        logger.info("S3 put_object response: %s", s3_resp)
    except (BotoCoreError, ClientError) as e:
        logger.error("S3 upload failed for address_id=%s: %s", address_id, e)
        return None

    return f"https://{settings.aws_s3_bucket}.s3.{settings.aws_region}.amazonaws.com/{s3_key}"
