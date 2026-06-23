import logging
import mimetypes
from uuid import UUID

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import UploadFile

from app.core.config import settings

logger = logging.getLogger(__name__)

_S3_KEY_PREFIX = "review-photos"
_ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
_MAX_BYTES = 5 * 1024 * 1024


def upload_review_photos(review_id: UUID, files: list[UploadFile]) -> list[str]:
    if not settings.aws_s3_bucket:
        logger.warning("review_images: skipping — aws_s3_bucket not configured")
        return []

    s3 = boto3.client(
        "s3",
        region_name=settings.aws_region,
        aws_access_key_id=settings.aws_access_key_id or None,
        aws_secret_access_key=settings.aws_secret_access_key or None,
    )

    urls: list[str] = []
    for idx, f in enumerate(files):
        content_type = f.content_type or mimetypes.guess_type(f.filename or "")[0] or ""
        if content_type not in _ALLOWED_TYPES:
            logger.warning("review_images: skipping file %d, unsupported type %s", idx, content_type)
            continue

        data = f.file.read()
        if len(data) > _MAX_BYTES:
            logger.warning("review_images: skipping file %d, too large (%d bytes)", idx, len(data))
            continue

        ext = content_type.split("/")[-1].replace("jpeg", "jpg")
        key = f"{_S3_KEY_PREFIX}/{review_id}/{idx}.{ext}"

        try:
            s3.put_object(
                Bucket=settings.aws_s3_bucket,
                Key=key,
                Body=data,
                ContentType=content_type,
            )
            url = f"https://{settings.aws_s3_bucket}.s3.{settings.aws_region}.amazonaws.com/{key}"
            urls.append(url)
            logger.info("review_images: uploaded %s", url)
        except (BotoCoreError, ClientError) as e:
            logger.error("review_images: S3 upload failed for file %d: %s", idx, e)

    return urls
