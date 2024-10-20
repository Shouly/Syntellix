from typing import Any, Optional
from urllib.parse import quote_plus

from pydantic import Field, NonNegativeInt, PositiveFloat, PositiveInt, computed_field
from pydantic_settings import BaseSettings
from syntellix_api.configs.middleware.cache.redis_config import RedisConfig
from syntellix_api.configs.middleware.storage.aliyun_oss_config import AliyunOSSConfig
from syntellix_api.configs.middleware.storage.minio_config import MinioConfig
from syntellix_api.configs.middleware.vector_db.elasticsearch_config import (
    ElasticsearchConfig,
)
from syntellix_api.configs.middleware.vector_db.qdrant_config import QdrantConfig


class StorageConfig(BaseSettings):
    STORAGE_TYPE: str = Field(
        description="storage type,"
        " default to `local`,"
        " available values are `local`, `minio`, `aliyun-oss`.",
        default="minio",
    )

    STORAGE_LOCAL_PATH: str = Field(
        description="local storage path",
        default="storage",
    )


class VectorStoreConfig(BaseSettings):
    VECTOR_STORE: Optional[str] = Field(
        description="vector store type",
        default=None,
    )


class KeywordStoreConfig(BaseSettings):
    KEYWORD_STORE: str = Field(
        description="keyword store type",
        default="jieba",
    )


class DatabaseConfig(BaseSettings):
    DB_HOST: str = Field(
        description="MySQL database host",
        default="localhost",
    )

    DB_PORT: PositiveInt = Field(
        description="MySQL database port",
        default=3306,
    )

    DB_USERNAME: str = Field(
        description="MySQL database username",
        default="syntellix",
    )

    DB_PASSWORD: str = Field(
        description="MySQL database password",
        default="syntellix_password",
    )

    DB_DATABASE: str = Field(
        description="MySQL database name",
        default="syntellix",
    )

    DB_CHARSET: str = Field(
        description="MySQL database charset",
        default="utf8mb4",
    )

    DB_COLLATION: str = Field(
        description="MySQL database collation",
        default="utf8mb4_unicode_ci",
    )

    SQLALCHEMY_DATABASE_URI_SCHEME: str = Field(
        description="Database URI scheme for MySQL",
        default="mysql+pymysql",
    )

    @computed_field
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return (
            f"{self.SQLALCHEMY_DATABASE_URI_SCHEME}://"
            f"{quote_plus(self.DB_USERNAME)}:{quote_plus(self.DB_PASSWORD)}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_DATABASE}"
            f"?charset={self.DB_CHARSET}&collation={self.DB_COLLATION}"
        )

    SQLALCHEMY_POOL_SIZE: NonNegativeInt = Field(
        description="SQLAlchemy connection pool size",
        default=10,
    )

    SQLALCHEMY_MAX_OVERFLOW: NonNegativeInt = Field(
        description="SQLAlchemy connection pool max overflow",
        default=20,
    )

    SQLALCHEMY_POOL_RECYCLE: NonNegativeInt = Field(
        description="SQLAlchemy connection pool recycle time in seconds",
        default=3600,
    )

    SQLALCHEMY_POOL_TIMEOUT: int = Field(
        description="SQLAlchemy connection pool timeout in seconds",
        default=30,
    )

    SQLALCHEMY_POOL_PRE_PING: bool = Field(
        description="Enable SQLAlchemy connection pool pre-ping",
        default=True,
    )

    SQLALCHEMY_ECHO: bool = Field(
        description="Enable SQLAlchemy query echoing",
        default=False,
    )

    @computed_field
    @property
    def SQLALCHEMY_ENGINE_OPTIONS(self) -> dict[str, Any]:
        return {
            "pool_size": self.SQLALCHEMY_POOL_SIZE,
            "max_overflow": self.SQLALCHEMY_MAX_OVERFLOW,
            "pool_recycle": self.SQLALCHEMY_POOL_RECYCLE,
            "pool_pre_ping": self.SQLALCHEMY_POOL_PRE_PING,
            "pool_timeout": self.SQLALCHEMY_POOL_TIMEOUT,
            "connect_args": {
                "charset": self.DB_CHARSET,
                "collation": self.DB_COLLATION,
            },
        }


class CeleryConfig(DatabaseConfig):
    CELERY_BACKEND: str = Field(
        description="Celery backend, available values are `database`, `redis`",
        default="redis",
    )

    CELERY_BROKER_URL: Optional[str] = Field(
        description="CELERY_BROKER_URL",
        default=None,
    )

    CELERY_USE_SENTINEL: Optional[bool] = Field(
        description="Whether to use Redis Sentinel mode",
        default=False,
    )

    CELERY_SENTINEL_MASTER_NAME: Optional[str] = Field(
        description="Redis Sentinel master name",
        default=None,
    )

    CELERY_SENTINEL_SOCKET_TIMEOUT: Optional[PositiveFloat] = Field(
        description="Redis Sentinel socket timeout",
        default=0.1,
    )

    @computed_field
    @property
    def CELERY_RESULT_BACKEND(self) -> str | None:
        return (
            "db+{}".format(self.SQLALCHEMY_DATABASE_URI)
            if self.CELERY_BACKEND == "database"
            else self.CELERY_BROKER_URL
        )

    @computed_field
    @property
    def BROKER_USE_SSL(self) -> bool:
        return (
            self.CELERY_BROKER_URL.startswith("rediss://")
            if self.CELERY_BROKER_URL
            else False
        )


class MiddlewareConfig(
    CeleryConfig,
    DatabaseConfig,
    KeywordStoreConfig,
    RedisConfig,
    StorageConfig,
    MinioConfig,
    AliyunOSSConfig,
    VectorStoreConfig,
    QdrantConfig,
    ElasticsearchConfig,
):
    pass
