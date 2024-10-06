import logging
import os
from typing import Any, Callable, Dict, List, Optional, Union

from syntellix_api.rag.vector_database.elasticsearch.elasticsearch_vector import (
    ElasticSearchVector, ElasticSearchVectorFactory)
from syntellix_api.rag.vector_database.vector_model import BaseNode

logger = logging.getLogger(__name__)

# Ensure that the 'fork' start method is not used in macOS
if os.name == "posix" and os.uname().sysname == "Darwin":
    import multiprocessing

    multiprocessing.set_start_method("spawn", force=True)


class VectorService:
    def __init__(self, tenant_id: int):
        logger.info(f"Initializing VectorService for tenant {tenant_id}")
        self._tenant_id = tenant_id
        self._vector_processor = self._init_vector()

    def _init_vector(self) -> ElasticSearchVector:
        logger.info(f"Initializing ElasticSearchVector for tenant {self._tenant_id}")
        return ElasticSearchVectorFactory().init_vector(self._tenant_id)

    def add_nodes(self, nodes: list[BaseNode]):
        logger.info(f"Adding {len(nodes)} nodes to vector database")
        try:
            self._vector_processor.add(nodes)
            logger.info("Nodes added successfully")
        except Exception as e:
            logger.error(f"Error adding nodes: {str(e)}", exc_info=True)

    def query(
        self,
        query: dict,
        es_filter: Optional[List[Dict]] = None,
        **kwargs: Any,
    ) -> list[BaseNode]:
        logger.info(f"Querying vector database with query: {query}")
        try:
            return self._vector_processor.query(query, es_filter, **kwargs)
        except Exception as e:
            logger.error(f"Error querying vector database: {str(e)}", exc_info=True)
            return []

    def delete_by_knowledge_base_and_document_id(
        self, knowledge_base_id: str, document_id: str
    ) -> None:
        logger.info(
            f"Deleting document with knowledge_base_id {knowledge_base_id} and document_id {document_id}"
        )
        try:
            self._vector_processor.delete_by_knowledge_base_and_document_id(
                knowledge_base_id, document_id
            )
            logger.info("Document deleted successfully")
        except Exception as e:
            logger.error(f"Error deleting document: {str(e)}", exc_info=True)
