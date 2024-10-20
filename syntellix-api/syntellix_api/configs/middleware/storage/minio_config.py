from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings


class MinioConfig(BaseSettings):
    """
    MinIO configs
    """

    MINIO_BUCKET_NAME: Optional[str] = Field(
        description="MinIO bucket name",
        default=None,
    )

    MINIO_ACCESS_KEY: Optional[str] = Field(
        description="MinIO access key",
        default=None,
    )

    MINIO_SECRET_KEY: Optional[str] = Field(
        description="MinIO secret key",
        default=None,
    )

    MINIO_ENDPOINT: Optional[str] = Field(
        description="MinIO endpoint URL",
        default=None,
    )

    MINIO_SECURE: Optional[bool] = Field(
        description="Use secure (HTTPS) connection",
        default=True,
    )
