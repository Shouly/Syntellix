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
import logging
import os
import re
import threading
from abc import ABC
from typing import List, Optional, cast

import dashscope
import numpy as np
import requests
import torch
from FlagEmbedding import FlagModel
from huggingface_hub import snapshot_download
from openai import OpenAI
from openai.lib.azure import AzureOpenAI
from sentence_transformers import SentenceTransformer
from syntellix_api.rag.utils.file_utils import get_home_cache_dir
from syntellix_api.rag.utils.parser_utils import num_tokens_from_string, truncate

logger = logging.getLogger(__name__)


class Base(ABC):
    def __init__(self, key, model_name):
        pass

    def encode(self, texts: list, batch_size=32):
        raise NotImplementedError("Please implement encode method!")

    def encode_queries(self, text: str):
        raise NotImplementedError("Please implement encode method!")


class DefaultEmbedding(Base):
    def __init__(self, key, model_name, **kwargs):
        self.key = key
        self.model_name = model_name
        self.kwargs = kwargs
        self._model = None

    def _ensure_model_loaded(self):
        if self._model is None:
            self._model = self._load_model()

    def _load_model(self):
        try:
            logger.info(f"Attempting to load model: {self.model_name}")
            model = SentenceTransformer(
                model_name_or_path="moka-ai/m3e-base", device="cpu"
            )
            logger.info("Model loaded successfully")
            return model
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            try:
                logger.info("Attempting to download model")
                model_dir = snapshot_download(
                    repo_id="BAAI/bge-large-zh-v1.5",
                    local_dir=os.path.join(
                        get_home_cache_dir(),
                        re.sub(r"^[a-zA-Z]+/", "", self.model_name),
                    ),
                    local_dir_use_symlinks=False,
                )
                logger.info(f"Model downloaded to: {model_dir}")
                model = SentenceTransformer(model_name_or_path=model_dir, device="cpu")
                logger.info("Model loaded successfully after download")
                return model
            except Exception as download_error:
                logger.error(f"Error downloading model: {str(download_error)}")
                raise

    def encode(self, texts: list, batch_size=8):
        self._ensure_model_loaded()
        return cast(List[float], self._model.encode(texts))
        # self._ensure_model_loaded()
        # logger.debug(f"Encoding {len(texts)} texts with batch size {batch_size}")

        # try:
        #     texts = [truncate(t, 2048) for t in texts]
        #     token_count = sum(num_tokens_from_string(t) for t in texts)
        #     logger.debug(f"Total tokens: {token_count}")
        #     res = []
        #     for i in range(0, len(texts), batch_size):
        #         batch = texts[i : i + batch_size]
        #         try:
        #             batch_embeddings = self._model.encode(batch, show_progress_bar=False)
        #             res.extend(batch_embeddings.tolist())
        #         except Exception as batch_error:
        #             logger.error(f"Error encoding batch {i // batch_size + 1}: {str(batch_error)}")
        #             logger.debug(f"Problematic batch (first 100 chars): {batch[0][:100]}...")
        #             # Add placeholder embeddings for the failed batch
        #             placeholder = [0] * self._model.get_sentence_embedding_dimension()
        #             res.extend([placeholder] * len(batch))

        #     return np.array(res), token_count

        # except Exception as e:
        #     logger.error(f"Error in encode method: {str(e)}")
        #     return np.array([]), 0

    def encode_queries(self, text: str):
        self._ensure_model_loaded()
        token_count = num_tokens_from_string(text)
        try:
            return self._model.encode([text], show_progress_bar=False)[0], token_count
        except Exception as e:
            logger.error(f"Error encoding query: {str(e)}")
            logger.error(f"Problematic query: {text[:100]}...")  # Log part of the query
            return np.zeros(self._model.get_sentence_embedding_dimension()), token_count


class OpenAIEmbed(Base):
    def __init__(
        self,
        key,
        model_name="text-embedding-ada-002",
        base_url="https://api.openai.com/v1",
    ):
        if not base_url:
            base_url = "https://api.openai.com/v1"
        self.client = OpenAI(api_key=key, base_url=base_url)
        self.model_name = model_name

    def encode(self, texts: list, batch_size=32):
        texts = [truncate(t, 8191) for t in texts]
        res = self.client.embeddings.create(input=texts, model=self.model_name)
        return np.array([d.embedding for d in res.data]), res.usage.total_tokens

    def encode_queries(self, text):
        res = self.client.embeddings.create(
            input=[truncate(text, 8191)], model=self.model_name
        )
        return np.array(res.data[0].embedding), res.usage.total_tokens


class LocalAIEmbed(Base):
    def __init__(self, key, model_name, base_url):
        if not base_url:
            raise ValueError("Local embedding model url cannot be None")
        if base_url.split("/")[-1] != "v1":
            base_url = os.path.join(base_url, "v1")
        self.client = OpenAI(api_key="empty", base_url=base_url)
        self.model_name = model_name.split("___")[0]

    def encode(self, texts: list, batch_size=32):
        res = self.client.embeddings.create(input=texts, model=self.model_name)
        return (
            np.array([d.embedding for d in res.data]),
            1024,
        )  # local embedding for LmStudio donot count tokens

    def encode_queries(self, text):
        embds, cnt = self.encode([text])
        return np.array(embds[0]), cnt


class AzureEmbed(OpenAIEmbed):
    def __init__(self, key, model_name, **kwargs):
        self.client = AzureOpenAI(
            api_key=key, azure_endpoint=kwargs["base_url"], api_version="2024-02-01"
        )
        self.model_name = model_name


class BaiChuanEmbed(OpenAIEmbed):
    def __init__(
        self,
        key,
        model_name="Baichuan-Text-Embedding",
        base_url="https://api.baichuan-ai.com/v1",
    ):
        if not base_url:
            base_url = "https://api.baichuan-ai.com/v1"
        super().__init__(key, model_name, base_url)


class QWenEmbed(Base):
    def __init__(self, key, model_name="text_embedding_v2", **kwargs):
        dashscope.api_key = key
        self.model_name = model_name

    def encode(self, texts: list, batch_size=10):
        import dashscope

        batch_size = min(batch_size, 4)
        try:
            res = []
            token_count = 0
            texts = [truncate(t, 2048) for t in texts]
            for i in range(0, len(texts), batch_size):
                resp = dashscope.TextEmbedding.call(
                    model=self.model_name,
                    input=texts[i : i + batch_size],
                    text_type="document",
                )
                embds = [[] for _ in range(len(resp["output"]["embeddings"]))]
                for e in resp["output"]["embeddings"]:
                    embds[e["text_index"]] = e["embedding"]
                res.extend(embds)
                token_count += resp["usage"]["total_tokens"]
            return np.array(res), token_count
        except Exception as e:
            raise Exception(
                "Account abnormal. Please ensure it's on good standing to use QWen's "
                + self.model_name
            )
        return np.array([]), 0

    def encode_queries(self, text):
        try:
            resp = dashscope.TextEmbedding.call(
                model=self.model_name, input=text[:2048], text_type="query"
            )
            return (
                np.array(resp["output"]["embeddings"][0]["embedding"]),
                resp["usage"]["total_tokens"],
            )
        except Exception as e:
            raise Exception(
                "Account abnormal. Please ensure it's on good standing to use QWen's "
                + self.model_name
            )
        return np.array([]), 0


class XinferenceEmbed(Base):
    def __init__(self, key, model_name="", base_url=""):
        self.client = OpenAI(api_key="xxx", base_url=base_url)
        self.model_name = model_name

    def encode(self, texts: list, batch_size=32):
        res = self.client.embeddings.create(input=texts, model=self.model_name)
        return np.array([d.embedding for d in res.data]), res.usage.total_tokens

    def encode_queries(self, text):
        res = self.client.embeddings.create(input=[text], model=self.model_name)
        return np.array(res.data[0].embedding), res.usage.total_tokens


class JinaEmbed(Base):
    def __init__(
        self,
        key,
        model_name="jina-embeddings-v2-base-zh",
        base_url="https://api.jina.ai/v1/embeddings",
    ):

        self.base_url = "https://api.jina.ai/v1/embeddings"
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {key}",
        }
        self.model_name = model_name

    def encode(self, texts: list, batch_size=None):
        texts = [truncate(t, 8196) for t in texts]
        data = {"model": self.model_name, "input": texts, "encoding_type": "float"}
        res = requests.post(self.base_url, headers=self.headers, json=data).json()
        return (
            np.array([d["embedding"] for d in res["data"]]),
            res["usage"]["total_tokens"],
        )

    def encode_queries(self, text):
        embds, cnt = self.encode([text])
        return np.array(embds[0]), cnt


class OpenAI_APIEmbed(OpenAIEmbed):
    def __init__(self, key, model_name, base_url):
        if not base_url:
            raise ValueError("url cannot be None")
        if base_url.split("/")[-1] != "v1":
            base_url = os.path.join(base_url, "v1")
        self.client = OpenAI(api_key=key, base_url=base_url)
        self.model_name = model_name.split("___")[0]


class PerfXCloudEmbed(OpenAIEmbed):
    def __init__(self, key, model_name, base_url="https://cloud.perfxlab.cn/v1"):
        if not base_url:
            base_url = "https://cloud.perfxlab.cn/v1"
        super().__init__(key, model_name, base_url)


class UpstageEmbed(OpenAIEmbed):
    def __init__(self, key, model_name, base_url="https://api.upstage.ai/v1/solar"):
        if not base_url:
            base_url = "https://api.upstage.ai/v1/solar"
        super().__init__(key, model_name, base_url)


class SILICONFLOWEmbed(Base):
    def __init__(
        self, key, model_name, base_url="https://api.siliconflow.cn/v1/embeddings"
    ):
        if not base_url:
            base_url = "https://api.siliconflow.cn/v1/embeddings"
        self.headers = {
            "accept": "application/json",
            "content-type": "application/json",
            "authorization": f"Bearer {key}",
        }
        self.base_url = base_url
        self.model_name = model_name

    def encode(self, texts: list, batch_size=32):
        payload = {
            "model": self.model_name,
            "input": texts,
            "encoding_format": "float",
        }
        res = requests.post(self.base_url, json=payload, headers=self.headers).json()
        return (
            np.array([d["embedding"] for d in res["data"]]),
            res["usage"]["total_tokens"],
        )

    def encode_queries(self, text):
        payload = {
            "model": self.model_name,
            "input": text,
            "encoding_format": "float",
        }
        res = requests.post(self.base_url, json=payload, headers=self.headers).json()
        return np.array(res["data"][0]["embedding"]), res["usage"]["total_tokens"]
