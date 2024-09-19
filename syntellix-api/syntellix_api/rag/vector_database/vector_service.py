from syntellix_api.rag.vector_database.elasticsearch.elasticsearch_vector import (
    ElasticSearchVector,
    ElasticSearchVectorFactory,
)
from syntellix_api.rag.vector_database.vector_model import BaseNode


class VectorService:

    def __init__(self, konwledge_base_id: int, document_id: int):
        self._konwledge_base_id = konwledge_base_id
        self._document_id = document_id
        self._embeddings = self._get_embeddings()
        self._vector_processor = self._init_vector()

    def _init_vector(self) -> ElasticSearchVector:
        return ElasticSearchVectorFactory().init_vector(self._konwledge_base_id)

    def add_nodes(self, text_chunks: list = None, **kwargs):
        if text_chunks:
            nodes = []
            for text_chunk in text_chunks:
                node = BaseNode(content=text_chunk)
                node.embedding = self._embeddings.embed_documents([node.content])
                node.metadata = {
                    "document_id": self._document_id,
                    "knowledge_base_id": self._konwledge_base_id,
                }
                node.set_embedding(node.embedding)
                node.set_metadata(node.metadata)
                nodes.append(node)
            self._vector_processor.add(nodes=nodes, **kwargs)

    # def add_texts(self, documents: list[Document], **kwargs):
    #     if kwargs.get("duplicate_check", False):
    #         documents = self._filter_duplicate_texts(documents)

    #     embeddings = self._embeddings.embed_documents(
    #         [document.page_content for document in documents]
    #     )
    #     self._vector_processor.create(texts=documents, embeddings=embeddings, **kwargs)

    # def text_exists(self, id: str) -> bool:
    #     return self._vector_processor.text_exists(id)

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

    def _get_embeddings(self) -> Embeddings:
        model_manager = ModelManager()

        embedding_model = model_manager.get_model_instance(
            tenant_id=self._dataset.tenant_id,
            provider=self._dataset.embedding_model_provider,
            model_type=ModelType.TEXT_EMBEDDING,
            model=self._dataset.embedding_model,
        )
        return CacheEmbedding(embedding_model)

    # def _filter_duplicate_texts(self, texts: list[Document]) -> list[Document]:
    #     for text in texts[:]:
    #         doc_id = text.metadata["doc_id"]
    #         exists_duplicate_node = self.text_exists(doc_id)
    #         if exists_duplicate_node:
    #             texts.remove(text)

    #     return texts

    # def __getattr__(self, name):
    #     if self._vector_processor is not None:
    #         method = getattr(self._vector_processor, name)
    #         if callable(method):
    #             return method

    #     raise AttributeError(f"'vector_processor' object has no attribute '{name}'")
