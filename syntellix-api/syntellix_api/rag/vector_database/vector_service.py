import logging
from datetime import datetime

logger = logging.getLogger(__name__)

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
        self._embeddings_model = self._get_embeddings_model()
        self._vector_processor = self._init_vector()

    def _init_vector(self) -> ElasticSearchVector:
        return ElasticSearchVectorFactory().init_vector(self._tenant_id)

    def add_nodes(self, text_chunks: list = None, **kwargs):
        if text_chunks:
            nodes = []
            for text_chunk in text_chunks:
                content = text_chunk["content_with_weight"]
                node = BaseNode(content=content)
                try:
                    embeddings, _ = self._embeddings_model.encode([node.content])
                    node.embedding = embeddings[0]
                except Exception as e:
                    logger.error(f"Error encoding content: {str(e)}")
                    logger.error(f"Problematic content: {content[:100]}...")
                    return

                node.metadata = {
                    "document_id": self._document_id,
                    "knowledge_base_id": self._konwledge_base_id,
                    "created_at": datetime.now(),
                }
                nodes.append(node)
            try:
                self._vector_processor.add(nodes=nodes, **kwargs)
            except Exception as e:
                logger.error(f"Error adding node to vector processor: {str(e)}")

    def _get_embeddings_model(self) -> Base:
        embedding_model = EmbeddingModel[syntellix_config.EMBEDDING_MODEL]
        return embedding_model(
            key=syntellix_config.EMBEDDING_KEY,
            model_name=syntellix_config.EMBEDDING_MODEL_NAME,
            base_url=syntellix_config.EMBEDDING_BASE_URL,
        )
