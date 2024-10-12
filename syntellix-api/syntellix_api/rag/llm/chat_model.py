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
import json
from abc import ABC

import openai
from openai import OpenAI
from syntellix_api.rag.nlp import is_english
from syntellix_api.rag.utils.parser_utils import num_tokens_from_string


class Base(ABC):
    def __init__(self, key, model_name, base_url):
        self.client = OpenAI(api_key=key, base_url=base_url)
        self.model_name = model_name

    def system_message(self, message: str) -> any:
        return {"role": "system", "content": message}

    def user_message(self, message: str) -> any:
        return {"role": "user", "content": message}

    def assistant_message(self, message: str) -> any:
        return {"role": "assistant", "content": message}

    def chat(self, system, history, gen_conf):
        if system:
            history.insert(0, self.system_message(system))
        try:
            response = self.client.chat.completions.create(
                model=self.model_name, messages=history, **gen_conf
            )
            ans = response.choices[0].message.content.strip()
            if response.choices[0].finish_reason == "length":
                ans += (
                    "...\nFor the content length reason, it stopped, continue?"
                    if is_english([ans])
                    else "······\n由于长度的原因，回答被截断了，要继续吗？"
                )
            return ans, response.usage.total_tokens
        except openai.APIError as e:
            return "**ERROR**: " + str(e), 0

    def chat_streamly(self, system, history, gen_conf):
        if system:
            history.insert(0, self.system_message(system))
        ans = ""
        try:

            print(history)

            response = self.client.chat.completions.create(
                model=self.model_name, messages=history, stream=True, **gen_conf
            )
            
            for i, resp in enumerate(response):
                if not resp.choices:
                    continue
                if not resp.choices[0].delta.content:
                    resp.choices[0].delta.content = ""
                delta_content = resp.choices[0].delta.content
                ans += delta_content

                # 立即yield每个delta_content
                yield delta_content

                if resp.choices[0].finish_reason == "length":
                    truncation_message = (
                        "...\nFor the content length reason, it stopped, continue?"
                        if is_english([ans])
                        else "······\n由于长度的原因，回答被截断了，要继续吗？"
                    )
                    ans += truncation_message
                    yield truncation_message

        except openai.APIError as e:
            yield f"\n**ERROR**: {str(e)}"


class MoonshotChat(Base):
    def __init__(
        self, key, model_name="moonshot-v1-8k", base_url="https://api.moonshot.cn/v1"
    ):
        if not base_url:
            base_url = "https://api.moonshot.cn/v1"
        super().__init__(key, model_name, base_url)


class DeepSeekChat(Base):
    def __init__(
        self, key, model_name="deepseek-chat", base_url="https://api.deepseek.com/v1"
    ):
        if not base_url:
            base_url = "https://api.deepseek.com/v1"
        super().__init__(key, model_name, base_url)


## openrouter
class OpenRouterChat(Base):
    def __init__(self, key, model_name, base_url="https://openrouter.ai/api/v1"):
        if not base_url:
            base_url = "https://openrouter.ai/api/v1"
        super().__init__(key, model_name, base_url)


class AnthropicChat(Base):
    def __init__(self, key, model_name, base_url=None):
        import anthropic

        self.client = anthropic.Anthropic(api_key=key)
        self.model_name = model_name
        self.system = ""

    def chat(self, system, history, gen_conf):
        if system:
            self.system = system
        if "max_tokens" not in gen_conf:
            gen_conf["max_tokens"] = 4096

        try:
            response = self.client.messages.create(
                model=self.model_name,
                messages=history,
                system=self.system,
                stream=False,
                **gen_conf,
            ).json()
            ans = response["content"][0]["text"]
            if response["stop_reason"] == "max_tokens":
                ans += (
                    "...\nFor the content length reason, it stopped, continue?"
                    if is_english([ans])
                    else "······\n由于长度的原因，回答被截断了，要继续吗？"
                )
            return (
                ans,
                response["usage"]["input_tokens"] + response["usage"]["output_tokens"],
            )
        except Exception as e:
            return ans + "\n**ERROR**: " + str(e), 0

    def chat_streamly(self, system, history, gen_conf):
        if system:
            self.system = system
        if "max_tokens" not in gen_conf:
            gen_conf["max_tokens"] = 4096

        ans = ""
        total_tokens = 0
        try:
            response = self.client.messages.create(
                model=self.model_name,
                messages=history,
                system=self.system,
                stream=True,
                **gen_conf,
            )
            for res in response.iter_lines():
                res = res.decode("utf-8")
                if "content_block_delta" in res and "data" in res:
                    text = json.loads(res[6:])["delta"]["text"]
                    ans += text
                    total_tokens += num_tokens_from_string(text)
        except Exception as e:
            yield ans + "\n**ERROR**: " + str(e)

        yield total_tokens
