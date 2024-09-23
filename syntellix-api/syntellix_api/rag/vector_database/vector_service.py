import logging
import os

from syntellix_api.rag.vector_database.elasticsearch.elasticsearch_vector import (
    ElasticSearchVector,
    ElasticSearchVectorFactory,
)
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
