from typing import Annotated, Optional

from pydantic import (AliasChoices, Field, NonNegativeInt, PositiveInt,
                      computed_field)
from pydantic_settings import BaseSettings


class SecurityConfig(BaseSettings):
    """
    Secret Key configs
    """

    SECRET_KEY: Optional[str] = Field(
        description="Your App secret key will be used for securely signing the session cookie"
        "Make sure you are changing this key for your deployment with a strong key."
        "You can generate a strong key using `openssl rand -base64 42`."
        "Alternatively you can set it with `SECRET_KEY` environment variable.",
        default=None,
    )

    RESET_PASSWORD_TOKEN_EXPIRY_HOURS: PositiveInt = Field(
        description="Expiry time in hours for reset token",
        default=24,
    )


class AppExecutionConfig(BaseSettings):
    """
    App Execution configs
    """

    APP_MAX_EXECUTION_TIME: PositiveInt = Field(
        description="execution timeout in seconds for app execution",
        default=1200,
    )
    APP_MAX_ACTIVE_REQUESTS: NonNegativeInt = Field(
        description="max active request per app, 0 means unlimited",
        default=0,
    )


class EndpointConfig(BaseSettings):
    """
    Module URL configs
    """

    CONSOLE_API_URL: str = Field(
        description="The backend URL prefix of the console API."
        "used to concatenate the login authorization callback or notion integration callback.",
        default="",
    )

    CONSOLE_WEB_URL: str = Field(
        description="The front-end URL prefix of the console web."
        "used to concatenate some front-end addresses and for CORS configuration use.",
        default="",
    )

    SERVICE_API_URL: str = Field(
        description="Service API Url prefix."
        "used to display Service API Base Url to the front-end.",
        default="",
    )

    APP_WEB_URL: str = Field(
        description="WebApp Url prefix."
        "used to display WebAPP API Base Url to the front-end.",
        default="",
    )


class FileAccessConfig(BaseSettings):
    """
    File Access configs
    """

    FILES_URL: str = Field(
        description="File preview or download Url prefix."
        " used to display File preview or download Url to the front-end or as Multi-model inputs;"
        "Url is signed and has expiration time.",
        validation_alias=AliasChoices("FILES_URL", "CONSOLE_API_URL"),
        alias_priority=1,
        default="",
    )

    FILES_ACCESS_TIMEOUT: int = Field(
        description="timeout in seconds for file accessing",
        default=300,
    )


class FileUploadConfig(BaseSettings):
    """
    File Uploading configs
    """

    UPLOAD_FILE_SIZE_LIMIT: NonNegativeInt = Field(
        description="size limit in Megabytes for uploading files",
        default=15,
    )

    UPLOAD_FILE_BATCH_LIMIT: NonNegativeInt = Field(
        description="batch size limit for uploading files",
        default=5,
    )

    UPLOAD_IMAGE_FILE_SIZE_LIMIT: NonNegativeInt = Field(
        description="image file size limit in Megabytes for uploading files",
        default=10,
    )

    BATCH_UPLOAD_LIMIT: NonNegativeInt = Field(
        description="",  # todo: to be clarified
        default=20,
    )


class HttpConfig(BaseSettings):
    """
    HTTP configs
    """

    API_COMPRESSION_ENABLED: bool = Field(
        description="whether to enable HTTP response compression of gzip",
        default=False,
    )

    inner_CONSOLE_CORS_ALLOW_ORIGINS: str = Field(
        description="",
        validation_alias=AliasChoices("CONSOLE_CORS_ALLOW_ORIGINS", "CONSOLE_WEB_URL"),
        default="",
    )

    @computed_field
    @property
    def CONSOLE_CORS_ALLOW_ORIGINS(self) -> list[str]:
        return self.inner_CONSOLE_CORS_ALLOW_ORIGINS.split(",")

    inner_WEB_API_CORS_ALLOW_ORIGINS: str = Field(
        description="",
        validation_alias=AliasChoices("WEB_API_CORS_ALLOW_ORIGINS"),
        default="*",
    )

    @computed_field
    @property
    def WEB_API_CORS_ALLOW_ORIGINS(self) -> list[str]:
        return self.inner_WEB_API_CORS_ALLOW_ORIGINS.split(",")

    HTTP_REQUEST_MAX_CONNECT_TIMEOUT: Annotated[
        PositiveInt,
        Field(ge=10, description="connect timeout in seconds for HTTP request"),
    ] = 10

    HTTP_REQUEST_MAX_READ_TIMEOUT: Annotated[
        PositiveInt,
        Field(ge=60, description="read timeout in seconds for HTTP request"),
    ] = 60

    HTTP_REQUEST_MAX_WRITE_TIMEOUT: Annotated[
        PositiveInt,
        Field(ge=10, description="read timeout in seconds for HTTP request"),
    ] = 20

    HTTP_REQUEST_NODE_MAX_BINARY_SIZE: PositiveInt = Field(
        description="",
        default=10 * 1024 * 1024,
    )

    HTTP_REQUEST_NODE_MAX_TEXT_SIZE: PositiveInt = Field(
        description="",
        default=1 * 1024 * 1024,
    )

    SSRF_PROXY_HTTP_URL: Optional[str] = Field(
        description="HTTP URL for SSRF proxy",
        default=None,
    )

    SSRF_PROXY_HTTPS_URL: Optional[str] = Field(
        description="HTTPS URL for SSRF proxy",
        default=None,
    )


class LoggingConfig(BaseSettings):
    """
    Logging configs
    """

    LOG_LEVEL: str = Field(
        description="Log output level, default to INFO."
        "It is recommended to set it to ERROR for production.",
        default="INFO",
    )

    LOG_FILE: Optional[str] = Field(
        description="logging output file path",
        default=None,
    )

    LOG_FORMAT: str = Field(
        description="log format",
        default="%(asctime)s.%(msecs)03d %(levelname)s [%(threadName)s] [%(filename)s:%(lineno)d] - %(message)s",
    )

    LOG_DATEFORMAT: Optional[str] = Field(
        description="log date format",
        default=None,
    )

    LOG_TZ: Optional[str] = Field(
        description="specify log timezone, eg: America/New_York",
        default=None,
    )


class ModelLoadBalanceConfig(BaseSettings):
    """
    Model load balance configs
    """

    MODEL_LB_ENABLED: bool = Field(
        description="whether to enable model load balancing",
        default=False,
    )


class OAuthConfig(BaseSettings):
    """
    oauth configs
    """

    OAUTH_REDIRECT_PATH: str = Field(
        description="redirect path for OAuth",
        default="/console/api/oauth/authorize",
    )

    GITHUB_CLIENT_ID: Optional[str] = Field(
        description="GitHub client id for OAuth",
        default=None,
    )

    GITHUB_CLIENT_SECRET: Optional[str] = Field(
        description="GitHub client secret key for OAuth",
        default=None,
    )

    GOOGLE_CLIENT_ID: Optional[str] = Field(
        description="Google client id for OAuth",
        default=None,
    )

    GOOGLE_CLIENT_SECRET: Optional[str] = Field(
        description="Google client secret key for OAuth",
        default=None,
    )


class DataSetConfig(BaseSettings):
    """
    Dataset configs
    """

    CLEAN_DAY_SETTING: PositiveInt = Field(
        description="interval in days for cleaning up dataset",
        default=30,
    )

    DATASET_OPERATOR_ENABLED: bool = Field(
        description="whether to enable dataset operator",
        default=False,
    )


class IndexingConfig(BaseSettings):
    """
    Indexing configs.
    """

    INDEXING_MAX_SEGMENTATION_TOKENS_LENGTH: PositiveInt = Field(
        description="max segmentation token length for indexing",
        default=1000,
    )


class ImageFormatConfig(BaseSettings):
    MULTIMODAL_SEND_IMAGE_FORMAT: str = Field(
        description="multi model send image format, support base64, url, default is base64",
        default="base64",
    )


class EmbeddingConfig(BaseSettings):
    EMBEDDING_MODEL: str = Field(
        description="embedding model",
        default="default",
    )

    EMBEDDING_KEY: str = Field(
        description="embedding key",
        default="your_embedding_key_here",
    )

    EMBEDDING_MODEL_NAME: str = Field(
        description="embedding model name",
        default="BAAI/bge-large-zh-v1.5",
    )

    EMBEDDING_BASE_URL: str = Field(
        description="embedding base url",
        default="https://api.openai.com/v1",
    )

class RerankConfig(BaseSettings):
    """
    Rerank configs
    """

    RERANK_MODEL_NAME: str = Field(
        description="rerank model name",
        default="",
    )

class LLMConfig(BaseSettings):
    """
    LLM configs
    """

    MOONSHOT_API_KEY: str = Field(
        description="moonshot api key",
        default="",
    )

    MOONSHOT_MODEL_NAME: str = Field(
        description="moonshot model name",
        default="",
    )

    MOONSHOT_BASE_URL: str = Field(
        description="moonshot base url",
        default="",
    )

    DEEPSEEK_API_KEY: str = Field(
        description="deepseek api key",
        default="",
    )

    DEEPSEEK_MODEL_NAME: str = Field(
        description="deepseek model name",
        default="",
    )

    DEEPSEEK_BASE_URL: str = Field(
        description="deepseek base url",
        default="",
    )

    OPENROUTER_API_KEY: str = Field(
        description="openrouter api key",
        default="",
    )

    OPENROUTER_MODEL_NAME: str = Field(
        description="openrouter model name",
        default="",
    )

    OPENROUTER_BASE_URL: str = Field(
        description="openrouter base url",
        default="",
    )

    ANTHROPIC_API_KEY: str = Field(
        description="anthropic api key",
        default="",
    )

    ANTHROPIC_MODEL_NAME: str = Field(
        description="anthropic model name",
        default="",
    )

    ANTHROPIC_BASE_URL: str = Field(
        description="anthropic base url",
        default="",
    )


class SystemConfig(
    AppExecutionConfig,
    DataSetConfig,
    EndpointConfig,
    FileAccessConfig,
    FileUploadConfig,
    HttpConfig,
    ImageFormatConfig,
    IndexingConfig,
    LoggingConfig,
    ModelLoadBalanceConfig,
    OAuthConfig,
    SecurityConfig,
    EmbeddingConfig,
    RerankConfig,
    LLMConfig,
):
    pass
