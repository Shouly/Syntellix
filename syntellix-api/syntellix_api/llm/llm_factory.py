from syntellix_api.configs import syntellix_config
from syntellix_api.rag.llm.chat_model import (
    AnthropicChat,
    DeepSeekChat,
    MoonshotChat,
    OpenRouterChat,
)


class LLMFactory:
    _instances = {}

    @classmethod
    def get_model(cls, model_type):
        if model_type not in cls._instances:
            if model_type == "moonshot":
                cls._instances[model_type] = MoonshotChat(
                    syntellix_config.MOONSHOT_API_KEY,
                    syntellix_config.MOONSHOT_MODEL_NAME,
                    syntellix_config.MOONSHOT_BASE_URL,
                )
            elif model_type == "deepseek":
                cls._instances[model_type] = DeepSeekChat(
                    syntellix_config.DEEPSEEK_API_KEY,
                    syntellix_config.DEEPSEEK_MODEL_NAME,
                    syntellix_config.DEEPSEEK_BASE_URL,
                )
            elif model_type == "openrouter":
                cls._instances[model_type] = OpenRouterChat(
                    syntellix_config.OPENROUTER_API_KEY,
                    syntellix_config.OPENROUTER_MODEL_NAME,
                    syntellix_config.OPENROUTER_BASE_URL,
                )
            elif model_type == "anthropic":
                cls._instances[model_type] = AnthropicChat(
                    syntellix_config.ANTHROPIC_API_KEY,
                    syntellix_config.ANTHROPIC_MODEL_NAME,
                    syntellix_config.ANTHROPIC_BASE_URL,
                )
            else:
                raise ValueError(f"Unsupported model type: {model_type}")

        return cls._instances[model_type]

    @classmethod
    def get_deepseek_model(cls):
        return cls.get_model("deepseek")

    @classmethod
    def get_moonshot_model(cls):
        return cls.get_model("moonshot")

    @classmethod
    def get_openrouter_model(cls):
        return cls.get_model("openrouter")

    @classmethod
    def get_anthropic_model(cls):
        return cls.get_model("anthropic")


# 使用示例
# model = LLMFactory.get_model("moonshot", "your_api_key")
# response, tokens = model.chat(system, history, gen_conf)
