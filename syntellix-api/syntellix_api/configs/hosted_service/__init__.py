from typing import Optional

from pydantic import Field, NonNegativeInt
from pydantic_settings import BaseSettings


class HostedOpenAiConfig(BaseSettings):
    """
    Hosted OpenAI service config
    """

    HOSTED_OPENAI_API_KEY: Optional[str] = Field(
        description="",
        default=None,
    )

    HOSTED_OPENAI_API_BASE: Optional[str] = Field(
        description="",
        default=None,
    )

    HOSTED_OPENAI_API_ORGANIZATION: Optional[str] = Field(
        description="",
        default=None,
    )

    HOSTED_OPENAI_TRIAL_ENABLED: bool = Field(
        description="",
        default=False,
    )

    HOSTED_OPENAI_TRIAL_MODELS: str = Field(
        description="",
        default="gpt-3.5-turbo,"
        "gpt-3.5-turbo-1106,"
        "gpt-3.5-turbo-instruct,"
        "gpt-3.5-turbo-16k,"
        "gpt-3.5-turbo-16k-0613,"
        "gpt-3.5-turbo-0613,"
        "gpt-3.5-turbo-0125,"
        "text-davinci-003",
    )

    HOSTED_OPENAI_QUOTA_LIMIT: NonNegativeInt = Field(
        description="",
        default=200,
    )

    HOSTED_OPENAI_PAID_ENABLED: bool = Field(
        description="",
        default=False,
    )

    HOSTED_OPENAI_PAID_MODELS: str = Field(
        description="",
        default="gpt-4,"
        "gpt-4-turbo-preview,"
        "gpt-4-turbo-2024-04-09,"
        "gpt-4-1106-preview,"
        "gpt-4-0125-preview,"
        "gpt-3.5-turbo,"
        "gpt-3.5-turbo-16k,"
        "gpt-3.5-turbo-16k-0613,"
        "gpt-3.5-turbo-1106,"
        "gpt-3.5-turbo-0613,"
        "gpt-3.5-turbo-0125,"
        "gpt-3.5-turbo-instruct,"
        "text-davinci-003",
    )


class HostedAnthropicConfig(BaseSettings):
    """
    Hosted Azure OpenAI service config
    """

    HOSTED_ANTHROPIC_API_BASE: Optional[str] = Field(
        description="",
        default=None,
    )

    HOSTED_ANTHROPIC_API_KEY: Optional[str] = Field(
        description="",
        default=None,
    )

    HOSTED_ANTHROPIC_TRIAL_ENABLED: bool = Field(
        description="",
        default=False,
    )

    HOSTED_ANTHROPIC_QUOTA_LIMIT: NonNegativeInt = Field(
        description="",
        default=600000,
    )

    HOSTED_ANTHROPIC_PAID_ENABLED: bool = Field(
        description="",
        default=False,
    )


class HostedDeepSeekConfig(BaseSettings):
    """
    Hosted Azure OpenAI service config
    """

    HOSTED_DEEPSEEK_API_BASE: Optional[str] = Field(
        description="",
        default=None,
    )

    HOSTED_DEEPSEEK_API_KEY: Optional[str] = Field(
        description="",
        default=None,
    )

    HOSTED_DEEPSEEK_TRIAL_ENABLED: bool = Field(
        description="",
        default=False,
    )

    HOSTED_DEEPSEEK_QUOTA_LIMIT: NonNegativeInt = Field(
        description="",
        default=600000,
    )

    HOSTED_DEEPSEEK_PAID_ENABLED: bool = Field(
        description="",
        default=False,
    )


class HostedMoonshotConfig(BaseSettings):
    """
    Hosted Moonshot service config
    """

    HOSTED_MOONSHOT_API_BASE: Optional[str] = Field(
        description="",
        default=None,
    )

    HOSTED_MOONSHOT_API_KEY: Optional[str] = Field(
        description="",
        default=None,
    )

    HOSTED_MOONSHOT_TRIAL_ENABLED: bool = Field(
        description="",
        default=False,
    )

    HOSTED_MOONSHOT_QUOTA_LIMIT: NonNegativeInt = Field(
        description="",
        default=600000,
    )

    HOSTED_MOONSHOT_PAID_ENABLED: bool = Field(
        description="",
        default=False,
    )


class HostedZhipuAIConfig(BaseSettings):
    """
    Hosted ZhipuAI service config
    """

    HOSTED_ZHIPUAI_ENABLED: bool = Field(
        description="",
        default=False,
    )


class HostedServiceConfig(
    HostedAnthropicConfig,
    HostedOpenAiConfig,
    HostedDeepSeekConfig,
    HostedMoonshotConfig,
    HostedZhipuAIConfig,
):
    pass
