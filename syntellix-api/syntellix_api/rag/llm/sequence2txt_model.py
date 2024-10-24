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
import base64
import io
import json
import os
import re
from abc import ABC

from openai import OpenAI
from openai.lib.azure import AzureOpenAI
from syntellix_api.rag.utils.parser_utils import num_tokens_from_string


class Base(ABC):
    def __init__(self, key, model_name):
        pass

    def transcription(self, audio, **kwargs):
        transcription = self.client.audio.transcriptions.create(
            model=self.model_name, file=audio, response_format="text"
        )
        return transcription.text.strip(), num_tokens_from_string(
            transcription.text.strip()
        )

    def audio2base64(self, audio):
        if isinstance(audio, bytes):
            return base64.b64encode(audio).decode("utf-8")
        if isinstance(audio, io.BytesIO):
            return base64.b64encode(audio.getvalue()).decode("utf-8")
        raise TypeError("The input audio file should be in binary format.")


class GPTSeq2txt(Base):
    def __init__(
        self, key, model_name="whisper-1", base_url="https://api.openai.com/v1"
    ):
        if not base_url:
            base_url = "https://api.openai.com/v1"
        self.client = OpenAI(api_key=key, base_url=base_url)
        self.model_name = model_name


class QWenSeq2txt(Base):
    def __init__(self, key, model_name="paraformer-realtime-8k-v1", **kwargs):
        import dashscope

        dashscope.api_key = key
        self.model_name = model_name

    def transcription(self, audio, format):
        from http import HTTPStatus

        from dashscope.audio.asr import Recognition

        recognition = Recognition(
            model=self.model_name, format=format, sample_rate=16000, callback=None
        )
        result = recognition.call(audio)

        ans = ""
        if result.status_code == HTTPStatus.OK:
            for sentence in result.get_sentence():
                ans += sentence.text.decode("utf-8") + "\n"
            return ans, num_tokens_from_string(ans)

        return "**ERROR**: " + result.message, 0


class AzureSeq2txt(Base):
    def __init__(self, key, model_name, lang="Chinese", **kwargs):
        self.client = AzureOpenAI(
            api_key=key, azure_endpoint=kwargs["base_url"], api_version="2024-02-01"
        )
        self.model_name = model_name
        self.lang = lang


class XinferenceSeq2txt(Base):
    def __init__(self, key, model_name="", base_url=""):
        self.client = OpenAI(api_key="xxx", base_url=base_url)
        self.model_name = model_name
