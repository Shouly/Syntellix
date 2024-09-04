from configs.hosted_service import HostedServiceConfig
from configs.middleware import MiddlewareConfig
from configs.system import SystemConfig
from pydantic_settings import SettingsConfigDict


class SyntellixConfig(
    HostedServiceConfig,
    MiddlewareConfig,
    SystemConfig,
):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        frozen=True,
        extra="ignore",
    )
