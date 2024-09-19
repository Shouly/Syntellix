import asyncio
import urllib.parse as urlparse
import uuid
from logging import getLogger
from typing import Any, Callable, Dict, List, Literal, Optional, Tuple, Union, cast

import numpy as np
import requests
from elasticsearch import Elasticsearch
from elasticsearch.helpers import BulkIndexError, async_bulk
from flask import current_app
from pydantic import BaseModel, model_validator
from syntellix_api.rag.vector_database.vector_model import BaseNode

logger = getLogger(__name__)

DISTANCE_STRATEGIES = Literal[
    "COSINE",
    "DOT_PRODUCT",
    "EUCLIDEAN_DISTANCE",
]


class ElasticSearchConfig(BaseModel):
    host: str
    port: int
    username: str
    password: str

    @model_validator(mode="before")
    @classmethod
    def validate_config(cls, values: dict) -> dict:
        if not values["host"]:
            raise ValueError("config HOST is required")
        if not values["port"]:
            raise ValueError("config PORT is required")
        if not values["username"]:
            raise ValueError("config USERNAME is required")
        if not values["password"]:
            raise ValueError("config PASSWORD is required")
        return values


class ElasticSearchVector:

    def __init__(
        self,
        index_name: str,
        client_config: ElasticSearchConfig,
        text_field: str = "content",
        vector_field: str = "embedding",
        batch_size: int = 200,
        distance_strategy: Optional[DISTANCE_STRATEGIES] = "COSINE",
    ) -> None:
        self._index_name = index_name
        self._client = self._init_client(client_config)
        self._text_field = text_field
        self._vector_field = vector_field
        self._batch_size = batch_size
        self._distance_strategy = distance_strategy

    def _init_client(self, config: ElasticSearchConfig) -> Elasticsearch:
        try:
            parsed_url = urlparse(config.host)
            if parsed_url.scheme in ["http", "https"]:
                hosts = f"{config.host}:{config.port}"
            else:
                hosts = f"http://{config.host}:{config.port}"
            client = Elasticsearch(
                hosts=hosts,
                basic_auth=(config.username, config.password),
                request_timeout=100000,
                retry_on_timeout=True,
                max_retries=10000,
            )
        except requests.exceptions.ConnectionError:
            raise ConnectionError("Elasticsearch connection error")

        return client

    def _create_index_if_not_exists(
        self, index_name: str, dims_length: Optional[int] = None
    ) -> None:
        if self._client.indices.exists(index=index_name):
            logger.debug(f"Index {index_name} already exists. Skipping creation.")
        else:
            if dims_length is None:
                raise ValueError(
                    "Cannot create index without specifying dims_length "
                    "when the index doesn't already exist. We infer "
                    "dims_length from the first embedding. Check that "
                    "you have provided an embedding function."
                )

            if self.distance_strategy == "COSINE":
                similarityAlgo = "cosine"
            elif self.distance_strategy == "EUCLIDEAN_DISTANCE":
                similarityAlgo = "l2_norm"
            elif self.distance_strategy == "DOT_PRODUCT":
                similarityAlgo = "dot_product"
            else:
                raise ValueError(f"Similarity {self.distance_strategy} not supported.")

            index_settings = {
                "mappings": {
                    "properties": {
                        self._vector_field: {
                            "type": "dense_vector",
                            "dims": dims_length,
                            "index": True,
                            "similarity": similarityAlgo,
                        },
                        self._text_field: {"type": "text"},
                        "metadata": {
                            "properties": {
                                "document_id": {"type": "keyword"},
                                "knowledge_base_id": {"type": "keyword"},
                            }
                        },
                    }
                }
            }

            logger.debug(
                f"Creating index {index_name} with mappings {index_settings['mappings']}"
            )
            self._client.indices.create(index=index_name, **index_settings)

    def add(
        self,
        nodes: List[BaseNode],
        *,
        create_index_if_not_exists: bool = True,
        **add_kwargs: Any,
    ) -> List[str]:
        return asyncio.get_event_loop().run_until_complete(
            self.async_add(nodes, create_index_if_not_exists=create_index_if_not_exists)
        )

    async def async_add(
        self,
        nodes: List[BaseNode],
        *,
        create_index_if_not_exists: bool = True,
        **add_kwargs: Any,
    ) -> List[str]:

        if len(nodes) == 0:
            return []

        if create_index_if_not_exists:
            dims_length = len(nodes[0].get_embedding())
            await self._create_index_if_not_exists(
                index_name=self._index_name, dims_length=dims_length
            )

        embeddings: List[List[float]] = []
        texts: List[str] = []
        metadatas: List[dict] = []
        ids: List[str] = []
        for node in nodes:
            ids.append(node.node_id)
            embeddings.append(node.get_embedding())
            texts.append(node.get_content())
            metadatas.append(node.get_metadata())

        requests = []
        return_ids = []

        for i, text in enumerate(texts):
            metadata = metadatas[i] if metadatas else {}
            _id = ids[i] if ids else str(uuid.uuid4())
            request = {
                "_op_type": "index",
                "_index": self._index_name,
                self._vector_field: embeddings[i],
                self._text_field: text,
                "metadata": metadata,
                "_id": _id,
            }
            requests.append(request)
            return_ids.append(_id)

        async with self._client as client:
            await async_bulk(
                client, requests, chunk_size=self._batch_size, refresh=True
            )
            try:
                success, failed = await async_bulk(
                    client, requests, stats_only=True, refresh=True
                )
                logger.debug(
                    f"Added {success} and failed to add {failed} texts to index"
                )
                logger.debug(f"added texts {ids} to index")
                return return_ids
            except BulkIndexError as e:
                logger.error(f"Error adding texts: {e}")
                firstError = e.errors[0].get("index", {}).get("error", {})
                logger.error(f"First error reason: {firstError.get('reason')}")
                raise

    def delete(self, ref_doc_id: str, **delete_kwargs: Any) -> None:
        return asyncio.get_event_loop().run_until_complete(
            self.async_delete(ref_doc_id, **delete_kwargs)
        )

    async def async_delete(self, ref_doc_id: str, **delete_kwargs: Any) -> None:
        try:
            async with self._client as client:
                res = await client.delete_by_query(
                    index=self._index_name,
                    query={"term": {"metadata.ref_doc_id": ref_doc_id}},
                    refresh=True,
                    **delete_kwargs,
                )
            if res["deleted"] == 0:
                logger.warning(f"Could not find text {ref_doc_id} to delete")
            else:
                logger.debug(f"Deleted text {ref_doc_id} from index")
        except Exception:
            logger.error(f"Error deleting text: {ref_doc_id}")
            raise

    def query(
        self,
        query: dict,
        custom_query: Optional[Callable[[Dict, Union[dict, None]], Dict]] = None,
        es_filter: Optional[List[Dict]] = None,
        **kwargs: Any,
    ) -> list[BaseNode]:
        return asyncio.get_event_loop().run_until_complete(
            self.async_query(query, custom_query, es_filter, **kwargs)
        )

    async def async_query(
        self,
        query: dict,
        custom_query: Optional[Callable[[Dict, Union[dict, None]], Dict]] = None,
        es_filter: Optional[List[Dict]] = None,
        **kwargs: Any,
    ) -> Tuple[List[BaseNode], List[str], List[float]]:

        query_embedding = cast(List[float], query["query_embedding"])

        es_query = {}

        filter = es_filter or []

        es_query["knn"] = {
            "filter": filter,
            "field": self._vector_field,
            "query_vector": query_embedding,
            "k": query["similarity_top_k"],
            "num_candidates": query["similarity_top_k"] * 10,
        }

        es_query["query"] = {
            "bool": {
                "must": {"match": {self._text_field: {"query": query["query_str"]}}},
                "filter": filter,
            }
        }

        es_query["rank"] = {"rrf": {}}

        if custom_query is not None:
            es_query = custom_query(es_query, query)
            logger.debug(f"Calling custom_query, Query body now: {es_query}")

        async with self._client as client:
            response = await client.search(
                index=self.index_name,
                **es_query,
                size=query["similarity_top_k"],
                _source={"excludes": [self._vector_field]},
            )

        top_k_nodes = []
        top_k_ids = []
        top_k_scores = []
        hits = response["hits"]["hits"]
        nodes = []
        for hit in hits:
            source = hit["_source"]
            metadata = source.get("metadata", None)
            text = source.get(self._text_field, None)
            node_id = hit["_id"]

            node = BaseNode(text=text, metadata=metadata, id_=node_id)

            top_k_nodes.append(node)
            top_k_ids.append(node_id)
            top_k_scores.append(hit.get("_rank", hit["_score"]))

            nodes.append(node)

        total_rank = sum(top_k_scores)
        top_k_scores = [total_rank - rank / total_rank for rank in top_k_scores]

        return (nodes, top_k_ids, _to_llama_similarities(top_k_scores))


class ElasticSearchVectorFactory:

    def init_vector(
        self,
        telent_id: int,
    ) -> ElasticSearchVector:

        index_name = f"idx_telent_{telent_id}_knowledge_base"

        config = current_app.config

        return ElasticSearchVector(
            index_name=index_name,
            client_config=ElasticSearchConfig(
                host=config.get("ELASTICSEARCH_HOST"),
                port=config.get("ELASTICSEARCH_PORT"),
                username=config.get("ELASTICSEARCH_USERNAME"),
                password=config.get("ELASTICSEARCH_PASSWORD"),
            ),
        )


def _to_llama_similarities(scores: List[float]) -> List[float]:
    if scores is None or len(scores) == 0:
        return []

    scores_to_norm: np.ndarray = np.array(scores)
    return np.exp(scores_to_norm - np.max(scores_to_norm)).tolist()
