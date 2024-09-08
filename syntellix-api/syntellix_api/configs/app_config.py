from pathlib import Path

from syntellix_api.configs.hosted_service import HostedServiceConfig
from syntellix_api.configs.middleware import MiddlewareConfig
from syntellix_api.configs.system import SystemConfig
from pydantic_settings import SettingsConfigDict


class SyntellixConfig(
    HostedServiceConfig,
    MiddlewareConfig,
    SystemConfig,
):
    model_config = SettingsConfigDict(
        env_file=f"{Path(__file__).parents[2] / '.env'}",
        env_file_encoding="utf-8",
        frozen=True,
        extra="ignore",
    )
