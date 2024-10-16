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
import uuid
from abc import ABC
from io import BytesIO

import requests
from openai import OpenAI
from openai.lib.azure import AzureOpenAI
from PIL import Image
from syntellix_api.rag.nlp import is_english
from syntellix_api.rag.utils.file_utils import get_project_base_directory


class Base(ABC):
    def __init__(self, key, model_name):
        pass

    def describe(self, image, max_tokens=300):
        raise NotImplementedError("Please implement encode method!")

    def chat(self, system, history, gen_conf, image=""):
        if system:
            history[-1]["content"] = (
                system
                + history[-1]["content"]
                + "user query: "
                + history[-1]["content"]
            )
        try:
            for his in history:
                if his["role"] == "user":
                    his["content"] = self.chat_prompt(his["content"], image)

            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=history,
                max_tokens=gen_conf.get("max_tokens", 1000),
                temperature=gen_conf.get("temperature", 0.3),
                top_p=gen_conf.get("top_p", 0.7),
            )
            return (
                response.choices[0].message.content.strip(),
                response.usage.total_tokens,
            )
        except Exception as e:
            return "**ERROR**: " + str(e), 0

    def chat_streamly(self, system, history, gen_conf, image=""):
        if system:
            history[-1]["content"] = (
                system
                + history[-1]["content"]
                + "user query: "
                + history[-1]["content"]
            )

        ans = ""
        tk_count = 0
        try:
            for his in history:
                if his["role"] == "user":
                    his["content"] = self.chat_prompt(his["content"], image)

            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=history,
                max_tokens=gen_conf.get("max_tokens", 1000),
                temperature=gen_conf.get("temperature", 0.3),
                top_p=gen_conf.get("top_p", 0.7),
                stream=True,
            )
            for resp in response:
                if not resp.choices[0].delta.content:
                    continue
                delta = resp.choices[0].delta.content
                ans += delta
                if resp.choices[0].finish_reason == "length":
                    ans += (
                        "...\nFor the content length reason, it stopped, continue?"
                        if is_english([ans])
                        else "······\n由于长度的原因，回答被截断了，要继续吗？"
                    )
                    tk_count = resp.usage.total_tokens
                if resp.choices[0].finish_reason == "stop":
                    tk_count = resp.usage.total_tokens
                yield ans
        except Exception as e:
            yield ans + "\n**ERROR**: " + str(e)

        yield tk_count

    def image2base64(self, image):
        if isinstance(image, bytes):
            return base64.b64encode(image).decode("utf-8")
        if isinstance(image, BytesIO):
            return base64.b64encode(image.getvalue()).decode("utf-8")
        buffered = BytesIO()
        try:
            image.save(buffered, format="JPEG")
        except Exception as e:
            image.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode("utf-8")

    def prompt(self, b64):
        return [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{b64}"},
                    },
                    {
                        "text": (
                            "请用中文详细描述一下图中的内容，比如时间，地点，人物，事情，人物心情等，如果有数据请提取出数据。"
                            if self.lang.lower() == "chinese"
                            else "Please describe the content of this picture, like where, when, who, what happen. If it has number data, please extract them out."
                        ),
                    },
                ],
            }
        ]

    def chat_prompt(self, text, b64):
        return [
            {
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{b64}",
                },
            },
            {"type": "text", "text": text},
        ]


class GptV4(Base):
    def __init__(
        self,
        key,
        model_name="gpt-4-vision-preview",
        lang="Chinese",
        base_url="https://api.openai.com/v1",
    ):
        if not base_url:
            base_url = "https://api.openai.com/v1"
        self.client = OpenAI(api_key=key, base_url=base_url)
        self.model_name = model_name
        self.lang = lang

    def describe(self, image, max_tokens=300):
        b64 = self.image2base64(image)
        prompt = self.prompt(b64)
        for i in range(len(prompt)):
            for c in prompt[i]["content"]:
                if "text" in c:
                    c["type"] = "text"

        res = self.client.chat.completions.create(
            model=self.model_name,
            messages=prompt,
            max_tokens=max_tokens,
        )
        return res.choices[0].message.content.strip(), res.usage.total_tokens


class AzureGptV4(Base):
    def __init__(self, key, model_name, lang="Chinese", **kwargs):
        self.client = AzureOpenAI(
            api_key=key, azure_endpoint=kwargs["base_url"], api_version="2024-02-01"
        )
        self.model_name = model_name
        self.lang = lang

    def describe(self, image, max_tokens=300):
        b64 = self.image2base64(image)
        prompt = self.prompt(b64)
        for i in range(len(prompt)):
            for c in prompt[i]["content"]:
                if "text" in c:
                    c["type"] = "text"

        res = self.client.chat.completions.create(
            model=self.model_name,
            messages=prompt,
            max_tokens=max_tokens,
        )
        return res.choices[0].message.content.strip(), res.usage.total_tokens


class QWenCV(Base):
    def __init__(self, key, model_name="qwen-vl-chat-v1", lang="Chinese", **kwargs):
        import dashscope

        dashscope.api_key = key
        self.model_name = model_name
        self.lang = lang

    def prompt(self, binary):
        # stupid as hell
        tmp_dir = get_project_base_directory("tmp")
        if not os.path.exists(tmp_dir):
            os.mkdir(tmp_dir)
        path = os.path.join(tmp_dir, "%s.jpg" % uuid.uuid1().hex)
        Image.open(io.BytesIO(binary)).save(path)
        return [
            {
                "role": "user",
                "content": [
                    {"image": f"file://{path}"},
                    {
                        "text": (
                            "请用中文详细描述一下图中的内容，比如时间，地点，人物，事情，人物心情等，如果有数据请提取出数据。"
                            if self.lang.lower() == "chinese"
                            else "Please describe the content of this picture, like where, when, who, what happen. If it has number data, please extract them out."
                        ),
                    },
                ],
            }
        ]

    def chat_prompt(self, text, b64):
        return [
            {"image": f"{b64}"},
            {"text": text},
        ]

    def describe(self, image, max_tokens=300):
        from http import HTTPStatus

        from dashscope import MultiModalConversation

        response = MultiModalConversation.call(
            model=self.model_name, messages=self.prompt(image)
        )
        if response.status_code == HTTPStatus.OK:
            return (
                response.output.choices[0]["message"]["content"][0]["text"],
                response.usage.output_tokens,
            )
        return response.message, 0

    def chat(self, system, history, gen_conf, image=""):
        from http import HTTPStatus

        from dashscope import MultiModalConversation

        if system:
            history[-1]["content"] = (
                system
                + history[-1]["content"]
                + "user query: "
                + history[-1]["content"]
            )

        for his in history:
            if his["role"] == "user":
                his["content"] = self.chat_prompt(his["content"], image)
        response = MultiModalConversation.call(
            model=self.model_name,
            messages=history,
            max_tokens=gen_conf.get("max_tokens", 1000),
            temperature=gen_conf.get("temperature", 0.3),
            top_p=gen_conf.get("top_p", 0.7),
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

    def chat_streamly(self, system, history, gen_conf, image=""):
        from http import HTTPStatus

        from dashscope import MultiModalConversation

        if system:
            history[-1]["content"] = (
                system
                + history[-1]["content"]
                + "user query: "
                + history[-1]["content"]
            )

        for his in history:
            if his["role"] == "user":
                his["content"] = self.chat_prompt(his["content"], image)

        ans = ""
        tk_count = 0
        try:
            response = MultiModalConversation.call(
                model=self.model_name,
                messages=history,
                max_tokens=gen_conf.get("max_tokens", 1000),
                temperature=gen_conf.get("temperature", 0.3),
                top_p=gen_conf.get("top_p", 0.7),
                stream=True,
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


# class Zhipu4V(Base):
#     def __init__(self, key, model_name="glm-4v", lang="Chinese", **kwargs):
#         self.client = ZhipuAI(api_key=key)
#         self.model_name = model_name
#         self.lang = lang

#     def describe(self, image, max_tokens=1024):
#         b64 = self.image2base64(image)

#         prompt = self.prompt(b64)
#         prompt[0]["content"][1]["type"] = "text"

#         res = self.client.chat.completions.create(
#             model=self.model_name,
#             messages=prompt,
#             max_tokens=max_tokens,
#         )
#         return res.choices[0].message.content.strip(), res.usage.total_tokens

#     def chat(self, system, history, gen_conf, image=""):
#         if system:
#             history[-1]["content"] = (
#                 system
#                 + history[-1]["content"]
#                 + "user query: "
#                 + history[-1]["content"]
#             )
#         try:
#             for his in history:
#                 if his["role"] == "user":
#                     his["content"] = self.chat_prompt(his["content"], image)

#             response = self.client.chat.completions.create(
#                 model=self.model_name,
#                 messages=history,
#                 max_tokens=gen_conf.get("max_tokens", 1000),
#                 temperature=gen_conf.get("temperature", 0.3),
#                 top_p=gen_conf.get("top_p", 0.7),
#             )
#             return (
#                 response.choices[0].message.content.strip(),
#                 response.usage.total_tokens,
#             )
#         except Exception as e:
#             return "**ERROR**: " + str(e), 0

#     def chat_streamly(self, system, history, gen_conf, image=""):
#         if system:
#             history[-1]["content"] = (
#                 system
#                 + history[-1]["content"]
#                 + "user query: "
#                 + history[-1]["content"]
#             )

#         ans = ""
#         tk_count = 0
#         try:
#             for his in history:
#                 if his["role"] == "user":
#                     his["content"] = self.chat_prompt(his["content"], image)

#             response = self.client.chat.completions.create(
#                 model=self.model_name,
#                 messages=history,
#                 max_tokens=gen_conf.get("max_tokens", 1000),
#                 temperature=gen_conf.get("temperature", 0.3),
#                 top_p=gen_conf.get("top_p", 0.7),
#                 stream=True,
#             )
#             for resp in response:
#                 if not resp.choices[0].delta.content:
#                     continue
#                 delta = resp.choices[0].delta.content
#                 ans += delta
#                 if resp.choices[0].finish_reason == "length":
#                     ans += (
#                         "...\nFor the content length reason, it stopped, continue?"
#                         if is_english([ans])
#                         else "······\n由于长度的原因，回答被截断了，要继续吗？"
#                     )
#                     tk_count = resp.usage.total_tokens
#                 if resp.choices[0].finish_reason == "stop":
#                     tk_count = resp.usage.total_tokens
#                 yield ans
#         except Exception as e:
#             yield ans + "\n**ERROR**: " + str(e)

#         yield tk_count


class LocalAICV(GptV4):
    def __init__(self, key, model_name, base_url, lang="Chinese"):
        if not base_url:
            raise ValueError("Local cv model url cannot be None")
        if base_url.split("/")[-1] != "v1":
            base_url = os.path.join(base_url, "v1")
        self.client = OpenAI(api_key="empty", base_url=base_url)
        self.model_name = model_name.split("___")[0]
        self.lang = lang


class XinferenceCV(Base):
    def __init__(self, key, model_name="", lang="Chinese", base_url=""):
        self.client = OpenAI(api_key="xxx", base_url=base_url)
        self.model_name = model_name
        self.lang = lang

    def describe(self, image, max_tokens=300):
        b64 = self.image2base64(image)

        res = self.client.chat.completions.create(
            model=self.model_name,
            messages=self.prompt(b64),
            max_tokens=max_tokens,
        )
        return res.choices[0].message.content.strip(), res.usage.total_tokens


class OpenRouterCV(GptV4):
    def __init__(
        self,
        key,
        model_name,
        lang="Chinese",
        base_url="https://openrouter.ai/api/v1",
    ):
        if not base_url:
            base_url = "https://openrouter.ai/api/v1"
        self.client = OpenAI(api_key=key, base_url=base_url)
        self.model_name = model_name
        self.lang = lang


class LocalCV(Base):
    def __init__(self, key, model_name="glm-4v", lang="Chinese", **kwargs):
        pass

    def describe(self, image, max_tokens=1024):
        return "", 0


class NvidiaCV(Base):
    def __init__(
        self,
        key,
        model_name,
        lang="Chinese",
        base_url="https://ai.api.nvidia.com/v1/vlm",
    ):
        if not base_url:
            base_url = ("https://ai.api.nvidia.com/v1/vlm",)
        self.lang = lang
        factory, llm_name = model_name.split("/")
        if factory != "liuhaotian":
            self.base_url = os.path.join(base_url, factory, llm_name)
        else:
            self.base_url = os.path.join(
                base_url, "community", llm_name.replace("-v1.6", "16")
            )
        self.key = key

    def describe(self, image, max_tokens=1024):
        b64 = self.image2base64(image)
        response = requests.post(
            url=self.base_url,
            headers={
                "accept": "application/json",
                "content-type": "application/json",
                "Authorization": f"Bearer {self.key}",
            },
            json={
                "messages": self.prompt(b64),
                "max_tokens": max_tokens,
            },
        )
        response = response.json()
        return (
            response["choices"][0]["message"]["content"].strip(),
            response["usage"]["total_tokens"],
        )

    def prompt(self, b64):
        return [
            {
                "role": "user",
                "content": (
                    "请用中文详细描述一下图中的内容，比如时间，地点，人物，事情，人物心情等，如果有数据请提取出数据。"
                    if self.lang.lower() == "chinese"
                    else "Please describe the content of this picture, like where, when, who, what happen. If it has number data, please extract them out."
                )
                + f' <img src="data:image/jpeg;base64,{b64}"/>',
            }
        ]

    def chat_prompt(self, text, b64):
        return [
            {
                "role": "user",
                "content": text + f' <img src="data:image/jpeg;base64,{b64}"/>',
            }
        ]


class StepFunCV(GptV4):
    def __init__(
        self,
        key,
        model_name="step-1v-8k",
        lang="Chinese",
        base_url="https://api.stepfun.com/v1",
    ):
        if not base_url:
            base_url = "https://api.stepfun.com/v1"
        self.client = OpenAI(api_key=key, base_url=base_url)
        self.model_name = model_name
        self.lang = lang


class LmStudioCV(GptV4):
    def __init__(self, key, model_name, lang="Chinese", base_url=""):
        if not base_url:
            raise ValueError("Local llm url cannot be None")
        if base_url.split("/")[-1] != "v1":
            base_url = os.path.join(base_url, "v1")
        self.client = OpenAI(api_key="lm-studio", base_url=base_url)
        self.model_name = model_name
        self.lang = lang


class OpenAI_APICV(GptV4):
    def __init__(self, key, model_name, lang="Chinese", base_url=""):
        if not base_url:
            raise ValueError("url cannot be None")
        if base_url.split("/")[-1] != "v1":
            base_url = os.path.join(base_url, "v1")
        self.client = OpenAI(api_key=key, base_url=base_url)
        self.model_name = model_name.split("___")[0]
        self.lang = lang


class TogetherAICV(GptV4):
    def __init__(
        self, key, model_name, lang="Chinese", base_url="https://api.together.xyz/v1"
    ):
        if not base_url:
            base_url = "https://api.together.xyz/v1"
        super().__init__(key, model_name, lang, base_url)


class YiCV(GptV4):
    def __init__(
        self,
        key,
        model_name,
        lang="Chinese",
        base_url="https://api.lingyiwanwu.com/v1",
    ):
        if not base_url:
            base_url = "https://api.lingyiwanwu.com/v1"
        super().__init__(key, model_name, lang, base_url)
