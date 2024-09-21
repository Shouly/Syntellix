from datetime import datetime

from syntellix_api.configs import syntellix_config
from syntellix_api.rag.llm import EmbeddingModel
from syntellix_api.rag.llm.embedding_model import Base
from syntellix_api.rag.vector_database.elasticsearch.elasticsearch_vector import (
    ElasticSearchVector,
    ElasticSearchVectorFactory,
)
from syntellix_api.rag.vector_database.vector_model import BaseNode


class VectorService:

    def __init__(self, tenant_id: int, konwledge_base_id: int, document_id: int):
        self._tenant_id = tenant_id
        self._konwledge_base_id = konwledge_base_id
        self._document_id = document_id
        self._embeddings = self._get_embeddings()
        self._vector_processor = self._init_vector()

    def _init_vector(self) -> ElasticSearchVector:
        return ElasticSearchVectorFactory().init_vector(self._tenant_id)

    def add_nodes(self, text_chunks: list = None, **kwargs):
        if text_chunks:
            nodes = []
            for text_chunk in text_chunks:
                content = text_chunk["content_with_weight"]
                node = BaseNode(content=content)
                node.embedding = self._embeddings.encode([node.content])
                node.metadata = {
                    "document_id": self._document_id,
                    "knowledge_base_id": self._konwledge_base_id,
                    "created_at": datetime.now(),
                }
                nodes.append(node)
            self._vector_processor.add(nodes=nodes, **kwargs)

    # def delete_by_ids(self, ids: list[str]) -> None:
    #     self._vector_processor.delete_by_ids(ids)

    # def delete_by_metadata_field(self, key: str, value: str) -> None:
    #     self._vector_processor.delete_by_metadata_field(key, value)

    # def search_by_vector(self, query: str, **kwargs: Any) -> list[Document]:
    #     query_vector = self._embeddings.embed_query(query)
    #     return self._vector_processor.search_by_vector(query_vector, **kwargs)

    # def search_by_full_text(self, query: str, **kwargs: Any) -> list[Document]:
    #     return self._vector_processor.search_by_full_text(query, **kwargs)

    # def delete(self) -> None:
    #     self._vector_processor.delete()
    #     # delete collection redis cache
    #     if self._vector_processor.collection_name:
    #         collection_exist_cache_key = "vector_indexing_{}".format(
    #             self._vector_processor.collection_name
    #         )
    #         redis_client.delete(collection_exist_cache_key)

    def _get_embeddings(self) -> Base:
        embedding_model = EmbeddingModel[syntellix_config.EMBEDDING_MODEL]
        return embedding_model(
            key=syntellix_config.EMBEDDING_KEY,
            model_name=syntellix_config.EMBEDDING_MODEL_NAME,
            base_url=syntellix_config.EMBEDDING_BASE_URL,
        )
