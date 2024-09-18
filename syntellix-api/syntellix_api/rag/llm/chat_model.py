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
import asyncio
import json
import os
from abc import ABC

import openai
import requests
from dashscope import Generation
from openai import OpenAI
from syntellix_api.rag.nlp import is_english
from syntellix_api.rag.utils.parser_utils import num_tokens_from_string


class Base(ABC):
    def __init__(self, key, model_name, base_url):
        self.client = OpenAI(api_key=key, base_url=base_url)
        self.model_name = model_name

    def chat(self, system, history, gen_conf):
        if system:
            history.insert(0, {"role": "system", "content": system})
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
            history.insert(0, {"role": "system", "content": system})
        ans = ""
        total_tokens = 0
        try:
            response = self.client.chat.completions.create(
                model=self.model_name, messages=history, stream=True, **gen_conf
            )
            for resp in response:
                if not resp.choices:
                    continue
                if not resp.choices[0].delta.content:
                    resp.choices[0].delta.content = ""
                ans += resp.choices[0].delta.content
                total_tokens = (
                    (
                        total_tokens
                        + num_tokens_from_string(resp.choices[0].delta.content)
                    )
                    if not hasattr(resp, "usage") or not resp.usage
                    else resp.usage.get("total_tokens", total_tokens)
                )
                if resp.choices[0].finish_reason == "length":
                    ans += (
                        "...\nFor the content length reason, it stopped, continue?"
                        if is_english([ans])
                        else "······\n由于长度的原因，回答被截断了，要继续吗？"
                    )
                yield ans

        except openai.APIError as e:
            yield ans + "\n**ERROR**: " + str(e)

        yield total_tokens


class GptTurbo(Base):
    def __init__(
        self, key, model_name="gpt-3.5-turbo", base_url="https://api.openai.com/v1"
    ):
        if not base_url:
            base_url = "https://api.openai.com/v1"
        super().__init__(key, model_name, base_url)


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


class QWenChat(Base):
    def __init__(self, key, model_name=Generation.Models.qwen_turbo, **kwargs):
        import dashscope

        dashscope.api_key = key
        self.model_name = model_name

    def chat(self, system, history, gen_conf):
        from http import HTTPStatus

        if system:
            history.insert(0, {"role": "system", "content": system})
        response = Generation.call(
            self.model_name, messages=history, result_format="message", **gen_conf
        )
        ans = ""
        tk_count = 0
        if response.status_code == HTTPStatus.OK:
            ans += response.output.choices[0]["message"]["content"]
            tk_count += response.usage.total_tokens
            if response.output.choices[0].get("finish_reason", "") == "length":
                ans += (
                    "...\nFor the content length reason, it stopped, continue?"
                    if is_english([ans])
                    else "······\n由于长度的原因，回答被截断了，要继续吗？"
                )
            return ans, tk_count

        return "**ERROR**: " + response.message, tk_count

    def chat_streamly(self, system, history, gen_conf):
        from http import HTTPStatus

        if system:
            history.insert(0, {"role": "system", "content": system})
        ans = ""
        tk_count = 0
        try:
            response = Generation.call(
                self.model_name,
                messages=history,
                result_format="message",
                stream=True,
                **gen_conf,
            )
            for resp in response:
                if resp.status_code == HTTPStatus.OK:
                    ans = resp.output.choices[0]["message"]["content"]
                    tk_count = resp.usage.total_tokens
                    if resp.output.choices[0].get("finish_reason", "") == "length":
                        ans += (
                            "...\nFor the content length reason, it stopped, continue?"
                            if is_english([ans])
                            else "······\n由于长度的原因，回答被截断了，要继续吗？"
                        )
                    yield ans
                else:
                    yield (
                        ans + "\n**ERROR**: " + resp.message
                        if str(resp.message).find("Access") < 0
                        else "Out of credit. Please set the API key in **settings > Model providers.**"
                    )
        except Exception as e:
            yield ans + "\n**ERROR**: " + str(e)

        yield tk_count


class LocalAIChat(Base):
    def __init__(self, key, model_name, base_url):
        if not base_url:
            raise ValueError("Local llm url cannot be None")
        if base_url.split("/")[-1] != "v1":
            base_url = os.path.join(base_url, "v1")
        self.client = OpenAI(api_key="empty", base_url=base_url)
        self.model_name = model_name.split("___")[0]


class VolcEngineChat(Base):
    def __init__(
        self, key, model_name, base_url="https://ark.cn-beijing.volces.com/api/v3"
    ):
        """
        Since do not want to modify the original database fields, and the VolcEngine authentication method is quite special,
        Assemble ark_api_key, ep_id into api_key, store it as a dictionary type, and parse it for use
        model_name is for display only
        """
        base_url = base_url if base_url else "https://ark.cn-beijing.volces.com/api/v3"
        ark_api_key = json.loads(key).get("ark_api_key", "")
        model_name = json.loads(key).get("ep_id", "")
        super().__init__(ark_api_key, model_name, base_url)


class MiniMaxChat(Base):
    def __init__(
        self,
        key,
        model_name,
        base_url="https://api.minimax.chat/v1/text/chatcompletion_v2",
    ):
        if not base_url:
            base_url = "https://api.minimax.chat/v1/text/chatcompletion_v2"
        self.base_url = base_url
        self.model_name = model_name
        self.api_key = key

    def chat(self, system, history, gen_conf):
        if system:
            history.insert(0, {"role": "system", "content": system})
        for k in list(gen_conf.keys()):
            if k not in ["temperature", "top_p", "max_tokens"]:
                del gen_conf[k]
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = json.dumps(
            {"model": self.model_name, "messages": history, **gen_conf}
        )
        try:
            response = requests.request(
                "POST", url=self.base_url, headers=headers, data=payload
            )
            response = response.json()
            ans = response["choices"][0]["message"]["content"].strip()
            if response["choices"][0]["finish_reason"] == "length":
                ans += (
                    "...\nFor the content length reason, it stopped, continue?"
                    if is_english([ans])
                    else "······\n由于长度的原因，回答被截断了，要继续吗？"
                )
            return ans, response["usage"]["total_tokens"]
        except Exception as e:
            return "**ERROR**: " + str(e), 0

    def chat_streamly(self, system, history, gen_conf):
        if system:
            history.insert(0, {"role": "system", "content": system})
        ans = ""
        total_tokens = 0
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            }
            payload = json.dumps(
                {
                    "model": self.model_name,
                    "messages": history,
                    "stream": True,
                    **gen_conf,
                }
            )
            response = requests.request(
                "POST",
                url=self.base_url,
                headers=headers,
                data=payload,
            )
            for resp in response.text.split("\n\n")[:-1]:
                resp = json.loads(resp[6:])
                text = ""
                if "choices" in resp and "delta" in resp["choices"][0]:
                    text = resp["choices"][0]["delta"]["content"]
                ans += text
                total_tokens = (
                    total_tokens + num_tokens_from_string(text)
                    if "usage" not in resp
                    else resp["usage"]["total_tokens"]
                )
                yield ans

        except Exception as e:
            yield ans + "\n**ERROR**: " + str(e)

        yield total_tokens


## openrouter
class OpenRouterChat(Base):
    def __init__(self, key, model_name, base_url="https://openrouter.ai/api/v1"):
        if not base_url:
            base_url = "https://openrouter.ai/api/v1"
        super().__init__(key, model_name, base_url)


class StepFunChat(Base):
    def __init__(self, key, model_name, base_url="https://api.stepfun.com/v1"):
        if not base_url:
            base_url = "https://api.stepfun.com/v1"
        super().__init__(key, model_name, base_url)


class NvidiaChat(Base):
    def __init__(self, key, model_name, base_url="https://integrate.api.nvidia.com/v1"):
        if not base_url:
            base_url = "https://integrate.api.nvidia.com/v1"
        super().__init__(key, model_name, base_url)


class LmStudioChat(Base):
    def __init__(self, key, model_name, base_url):
        if not base_url:
            raise ValueError("Local llm url cannot be None")
        if base_url.split("/")[-1] != "v1":
            base_url = os.path.join(base_url, "v1")
        self.client = OpenAI(api_key="lm-studio", base_url=base_url)
        self.model_name = model_name


class OpenAI_APIChat(Base):
    def __init__(self, key, model_name, base_url):
        if not base_url:
            raise ValueError("url cannot be None")
        if base_url.split("/")[-1] != "v1":
            base_url = os.path.join(base_url, "v1")
        model_name = model_name.split("___")[0]
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
