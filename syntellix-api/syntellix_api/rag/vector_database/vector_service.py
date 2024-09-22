import logging
from datetime import datetime
import asyncio
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

from syntellix_api.configs import syntellix_config
from syntellix_api.rag.llm.embedding_model_local import EmbeddingModel
from syntellix_api.rag.llm.embedding_model import Base
from syntellix_api.rag.vector_database.elasticsearch.elasticsearch_vector import (
    ElasticSearchVector,
    ElasticSearchVectorFactory,
)
from syntellix_api.rag.vector_database.vector_model import BaseNode


class VectorService:
    _embedding_model = None

    @classmethod
    def get_embedding_model(cls):
        if cls._embedding_model is None:
            logger.info(f"Initializing embedding model with {syntellix_config.EMBEDDING_MODEL_NAME}")
            cls._embedding_model = EmbeddingModel(model_name=syntellix_config.EMBEDDING_MODEL_NAME)
        return cls._embedding_model

    def __init__(self, tenant_id: int, konwledge_base_id: int, document_id: int):
        logger.info(f"Initializing VectorService for tenant {tenant_id}, knowledge base {konwledge_base_id}, document {document_id}")
        self._tenant_id = tenant_id
        self._konwledge_base_id = konwledge_base_id
        self._document_id = document_id
        self._embeddings_model = self.get_embedding_model()
        self._vector_processor = self._init_vector()

    def _init_vector(self) -> ElasticSearchVector:
        logger.info(f"Initializing ElasticSearchVector for tenant {self._tenant_id}")
        return ElasticSearchVectorFactory().init_vector(self._tenant_id)

    def add_nodes(self, text_chunks: list = None, **kwargs):
        logger.info(f"Adding {len(text_chunks)} nodes to vector database")
        with ThreadPoolExecutor() as executor:
            future = executor.submit(self._run_async_add_nodes, text_chunks)
            try:
                future.result()  # This will re-raise any exception that occurred
                logger.info("Nodes added successfully")
            except Exception as e:
                logger.error(f"Error adding nodes: {str(e)}", exc_info=True)

    def _run_async_add_nodes(self, text_chunks: list) -> None:
        logger.debug("Starting _run_async_add_nodes")
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            loop.run_until_complete(self._async_add_nodes(text_chunks))
        except Exception as e:
            logger.error(f"Error in _run_async_add_nodes: {str(e)}", exc_info=True)
            raise
        finally:
            loop.close()
        logger.debug("Finished _run_async_add_nodes")

    async def _async_add_nodes(self, text_chunks: list) -> None:
        logger.debug(f"Starting _async_add_nodes with {len(text_chunks)} chunks")
        try:
            nodes = []
            for text in text_chunks:
                embedding = self._embeddings_model.encode([text])[0]  # Generate embedding for single chunk
                node = BaseNode(
                    content=text,
                    embedding=embedding,
                    metadata={
                        "document_id": self._document_id,
                        "knowledge_base_id": self._konwledge_base_id,
                        "created_at": datetime.now(),
                    },
                )
                nodes.append(node)

            logger.debug(f"Created {len(nodes)} BaseNode objects")
            
            result = await self._vector_processor.async_add(nodes)
            logger.info(f"Added {len(result)} nodes to vector database")
        except Exception as e:
            logger.error(f"Error in _async_add_nodes: {str(e)}", exc_info=True)
            raise

    def _get_embeddings_model(self) -> EmbeddingModel:
        return self.get_embedding_model()
