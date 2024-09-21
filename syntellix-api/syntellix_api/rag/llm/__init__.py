#
#  Copyright 2024 The InfiniFlow Authors. All Rights Reserved.
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
#
from .chat_model import *
from .cv_model import *
from .embedding_model import *
from .rerank_model import *
from .sequence2txt_model import *
from .tts_model import *

EmbeddingModel = {
    "LocalAI": LocalAIEmbed,
    "OpenAI": OpenAIEmbed,
    "Azure-OpenAI": AzureEmbed,
    "Xinference": XinferenceEmbed,
    "Tongyi-Qianwen": QWenEmbed,
    "Youdao": YoudaoEmbed,
    "BaiChuan": BaiChuanEmbed,
    "Jina": JinaEmbed,
    "BAAI": DefaultEmbedding,
    "OpenAI-API-Compatible": OpenAI_APIEmbed,
    "PerfXCloud": PerfXCloudEmbed,
    "Upstage": UpstageEmbed,
    "SILICONFLOW": SILICONFLOWEmbed,
}


CvModel = {
    "OpenAI": GptV4,
    "Azure-OpenAI": AzureGptV4,
    "Xinference": XinferenceCV,
    "Tongyi-Qianwen": QWenCV,
    # "ZHIPU-AI": Zhipu4V,
    "Moonshot": LocalCV,
    "OpenRouter": OpenRouterCV,
    "LocalAI": LocalAICV,
    "NVIDIA": NvidiaCV,
    "LM-Studio": LmStudioCV,
    "StepFun": StepFunCV,
    "OpenAI-API-Compatible": OpenAI_APICV,
    "TogetherAI": TogetherAICV,
    "01.AI": YiCV,
}


ChatModel = {
    "OpenAI": GptTurbo,
    "Tongyi-Qianwen": QWenChat,
    "LocalAI": LocalAIChat,
    "Moonshot": MoonshotChat,
    "DeepSeek": DeepSeekChat,
    "VolcEngine": VolcEngineChat,
    "MiniMax": MiniMaxChat,
    "Minimax": MiniMaxChat,
    "OpenRouter": OpenRouterChat,
    "StepFun": StepFunChat,
    "NVIDIA": NvidiaChat,
    "LM-Studio": LmStudioChat,
    "OpenAI-API-Compatible": OpenAI_APIChat,
    "Anthropic": AnthropicChat,
}


RerankModel = {
    "BAAI": DefaultRerank,
    "Jina": JinaRerank,
    "Youdao": YoudaoRerank,
    "Xinference": XInferenceRerank,
    "NVIDIA": NvidiaRerank,
    "LM-Studio": LmStudioRerank,
    "OpenAI-API-Compatible": OpenAI_APIRerank,
}


Seq2txtModel = {
    "OpenAI": GPTSeq2txt,
    "Tongyi-Qianwen": QWenSeq2txt,
    "Azure-OpenAI": AzureSeq2txt,
    "Xinference": XinferenceSeq2txt,
}

TTSModel = {"Fish Audio": FishAudioTTS, "Tongyi-Qianwen": QwenTTS}
