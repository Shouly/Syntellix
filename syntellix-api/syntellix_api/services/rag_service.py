from typing import Any, Generator, List, Tuple

from syntellix_api.configs import syntellix_config
from syntellix_api.llm.llm_factory import LLMFactory
from syntellix_api.llm.prompts import rag_prompt
from syntellix_api.rag.llm.embedding_model_local import EmbeddingModel
from syntellix_api.rag.llm.rerank_model_local import RerankModel
from syntellix_api.rag.vector_database.vector_service import VectorService
from syntellix_api.services.agent_service import AgentService


class RAGService:
    @staticmethod
    def retrieve_relevant_documents(tenant_id: int, agent_id: int, message: str) -> str:
        agent = AgentService.get_agent_by_id(agent_id, tenant_id)
        embedding_model = EmbeddingModel(
            model_name=syntellix_config.EMBEDDING_MODEL_NAME
        )
        user_message_embedding = embedding_model.encode([message])[0].tolist()

        agent_knowledge_base_ids = AgentService.get_agent_knowledge_base_ids(agent_id)
        vector_service = VectorService(tenant_id)
        nodes, _, _ = vector_service.query(
            query={
                "query_str": message,
                "query_embedding": user_message_embedding,
                "similarity_top_k": agent.advanced_config.get("top_n", 5),
            },
            es_filter=[
                {"terms": {"metadata.knowledge_base_id": agent_knowledge_base_ids}}
            ],
        )

        rerank_model = RerankModel(model_name=syntellix_config.RERANK_MODEL_NAME)
        rerank_nodes_scores, _ = rerank_model.similarity(
            message, [node.content for node in nodes]
        )

        similarity_threshold = agent.advanced_config.get("similarity_threshold", 0.5)
        filtered_nodes = [
            node
            for score, node in zip(rerank_nodes_scores, nodes)
            if score >= similarity_threshold
        ]

        return filtered_nodes, RAGService._format_context(filtered_nodes)

    @staticmethod
    def _format_context(nodes: List) -> str:
        context_str = ""
        for node in nodes:
            context_str += f"### 文件名: {node.metadata.get('file_name')}\n"
            context_str += f"### 文档ID: {node.metadata.get('document_id')}\n"
            context_str += f"### 文本: {node.content}\n"
        return context_str

    @staticmethod
    def call_llm(
        conversation_history: List[dict], message: str, context_str: str
    ) -> Generator[str, None, None]:
        llm = LLMFactory.get_deepseek_model()
        system_message = rag_prompt.SYSTEM_PROMPT
        user_message = rag_prompt.USER_PROMPT_TEMPLATE.format(
            context_str=context_str, question=message
        )

        for chunk in llm.chat_streamly(
            system_message,
            conversation_history + [{"role": "user", "content": user_message}],
            {},
        ):
            yield chunk
