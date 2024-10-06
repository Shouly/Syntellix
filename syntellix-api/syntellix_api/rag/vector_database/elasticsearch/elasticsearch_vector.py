import os
import urllib.parse as urlparse
import uuid
from logging import getLogger
from typing import Any, Callable, Dict, List, Literal, Optional, Tuple, Union, cast

import numpy as np
import requests
from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk
from flask import current_app
from pydantic import BaseModel, model_validator
from syntellix_api.rag.vector_database.vector_model import BaseNode

logger = getLogger(__name__)

DISTANCE_STRATEGIES = Literal[
    "COSINE",
    "DOT_PRODUCT",
    "EUCLIDEAN_DISTANCE",
]

# Ensure that the 'fork' start method is not used in macOS
if os.name == "posix" and os.uname().sysname == "Darwin":
    import multiprocessing

    multiprocessing.set_start_method("spawn", force=True)


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
        client: Optional[Elasticsearch] = None,
    ) -> None:
        self._index_name = index_name
        self._client = client or self._init_client(client_config)
        self._text_field = text_field
        self._vector_field = vector_field
        self._batch_size = batch_size
        self._distance_strategy = distance_strategy

    def _init_client(self, config: ElasticSearchConfig) -> Elasticsearch:
        try:
            parsed_url = urlparse.urlparse(config.host)
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
        exists = self._client.indices.exists(index=index_name)
        if exists:
            logger.debug(f"Index {index_name} already exists. Skipping creation.")
        else:
            if dims_length is None:
                raise ValueError(
                    "Cannot create index without specifying dims_length "
                    "when the index doesn't already exist. We infer "
                    "dims_length from the first embedding. Check that "
                    "you have provided an embedding function."
                )

            if self._distance_strategy == "COSINE":
                similarityAlgo = "cosine"
            elif self._distance_strategy == "EUCLIDEAN_DISTANCE":
                similarityAlgo = "l2_norm"
            elif self._distance_strategy == "DOT_PRODUCT":
                similarityAlgo = "dot_product"
            else:
                raise ValueError(f"Similarity {self._distance_strategy} not supported.")

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
                                "created_at": {"type": "date"},
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
        if len(nodes) == 0:
            return []

        if create_index_if_not_exists:
            dims_length = len(nodes[0].get_embedding())
            self._create_index_if_not_exists(
                index_name=self._index_name, dims_length=dims_length
            )

        return self._bulk_add(nodes, **add_kwargs)

    def _bulk_add(self, nodes: List[BaseNode], **add_kwargs: Any) -> List[str]:
        requests = []
        return_ids = []

        for node in nodes:
            _id = node.node_id or str(uuid.uuid4())
            request = {
                "_op_type": "index",
                "_index": self._index_name,
                "_id": _id,
                "_source": {
                    self._vector_field: node.get_embedding(),
                    self._text_field: node.get_content(),
                    "metadata": node.get_metadata(),
                },
            }
            requests.append(request)
            return_ids.append(_id)

        try:
            success, failed = bulk(self._client, requests, refresh=True)
            logger.debug(f"Successfully added {success} documents to index")
            if failed:
                logger.warning(f"Failed to add {len(failed)} documents to index")
            return return_ids
        except Exception as e:
            logger.error(f"Error adding texts: {e}")
            if e.errors:
                firstError = e.errors[0].get("index", {}).get("error", {})
                logger.error(f"First error reason: {firstError.get('reason')}")
            raise

    def delete(self, ref_doc_id: str, **delete_kwargs: Any) -> None:
        try:
            res = self._client.delete_by_query(
                index=self._index_name,
                body={"term": {"metadata.ref_doc_id": ref_doc_id}},
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

    def delete_by_knowledge_base_and_document_id(
        self, knowledge_base_id: str, document_id: str
    ) -> None:
        try:
            res = self._client.delete_by_query(
                index=self._index_name,
                body={
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "metadata.knowledge_base_id": knowledge_base_id
                                    }
                                },
                                {"term": {"metadata.document_id": document_id}},
                            ]
                        }
                    }
                },
                refresh=True,
            )
            if res["deleted"] == 0:
                logger.warning(
                    f"Could not find document with knowledge_base_id {knowledge_base_id} and document_id {document_id} to delete"
                )
            else:
                logger.debug(
                    f"Deleted document with knowledge_base_id {knowledge_base_id} and document_id {document_id} from index"
                )
        except Exception as e:
            logger.error(
                f"Error deleting document with knowledge_base_id {knowledge_base_id} and document_id {document_id}: {e}"
            )
            raise

    def query(
        self,
        query: dict,
        es_filter: Optional[List[Dict]] = None,
        **kwargs: Any,
    ) -> list[BaseNode]:
        query_embedding = cast(List[float], query["query_embedding"])

        filter = es_filter or []

        es_query = {
            "knn": {
                "filter": filter,
                "field": self._vector_field,
                "query_vector": query_embedding,
                "k": query["similarity_top_k"],
                "num_candidates": query["similarity_top_k"] * 10,
            },
            "query": {
                "bool": {
                    "must": [
                        {"match": {self._text_field: {"query": query["query_str"]}}},
                    ],
                    "filter": filter,
                }
            },
            "rank": {"rrf": {"rank_constant": 20}},
        }

        response = self._client.search(
            index=self._index_name,
            **es_query,
            size=query["similarity_top_k"],
            _source={"excludes": [self._vector_field]},
        )

        print(response)
        
        top_k_nodes = []
        top_k_ids = []
        top_k_scores = []
        hits = response["hits"]["hits"]
        nodes = []
        for hit in hits:
            source = hit["_source"]
            metadata = source.get("metadata", None)
            content = source.get(self._text_field, None)
            node_id = hit["_id"]

            node = BaseNode(content=content, metadata=metadata, id_=node_id)

            top_k_nodes.append(node)
            top_k_ids.append(node_id)
            top_k_scores.append(hit.get("_rank", hit["_score"]))

            nodes.append(node)

        total_rank = sum(top_k_scores)
        top_k_scores = [total_rank - rank / total_rank for rank in top_k_scores]

        return (nodes, top_k_ids, _to_llama_similarities(top_k_scores))


class ElasticSearchVectorFactory:
    _instance = None
    _es_client = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ElasticSearchVectorFactory, cls).__new__(cls)
        return cls._instance

    def init_vector(self, tenant_id: int) -> ElasticSearchVector:
        index_name = f"syntellix_telent_{tenant_id}_knowledge_base"
        config = current_app.config

        if self._es_client is None:
            self._es_client = self._init_client(config)

        return ElasticSearchVector(
            index_name=index_name,
            client_config=ElasticSearchConfig(
                host=config.get("ELASTICSEARCH_HOST"),
                port=config.get("ELASTICSEARCH_PORT"),
                username=config.get("ELASTICSEARCH_USERNAME"),
                password=config.get("ELASTICSEARCH_PASSWORD"),
            ),
            client=self._es_client,
        )

    @staticmethod
    def _init_client(config):
        return Elasticsearch(
            hosts=f"http://{config.get('ELASTICSEARCH_HOST')}:{config.get('ELASTICSEARCH_PORT')}",
            basic_auth=(
                config.get("ELASTICSEARCH_USERNAME"),
                config.get("ELASTICSEARCH_PASSWORD"),
            ),
            request_timeout=100000,
            retry_on_timeout=True,
            max_retries=10000,
        )


def _to_llama_similarities(scores: List[float]) -> List[float]:
    if scores is None or len(scores) == 0:
        return []

    scores_to_norm: np.ndarray = np.array(scores)
    return np.exp(scores_to_norm - np.max(scores_to_norm)).tolist()
