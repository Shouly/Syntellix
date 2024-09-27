import logging
from typing import Optional

from syntellix_api.extensions.ext_database import db
from syntellix_api.models.agent_model import Agent, AgentKnowledgeBase
from syntellix_api.services.errors.agent import (
    AgentNameDuplicateError,
    KonwledgeBaseIdEmptyError,
)

logger = logging.getLogger(__name__)


class AgentService:

    @staticmethod
    def create_agent(
        tenant_id: int,
        user_id: int,
        name: str,
        description: str,
        avatar: Optional[str] = None,
        greeting_message: str = "你好！我是你的助理，有什么可以帮到你的吗？",
        show_citation: bool = True,
        empty_response: str = "我没有找到相关的信息，请问您可以换个问题吗？",
        advanced_config: Optional[dict] = None,
        knowledge_base_ids: Optional[list[int]] = None,
    ):
        if Agent.query.filter_by(name=name, tenant_id=tenant_id).first():
            raise AgentNameDuplicateError(f"Agent with name '{name}' already exists.")

        agent = Agent(
            name=name,
            description=description,
            avatar=avatar,
            greeting_message=greeting_message,
            show_citation=show_citation,
            empty_response=empty_response,
            advanced_config=advanced_config,
            tenant_id=tenant_id,
            created_by=user_id,
            updated_by=user_id,
        )

        db.session.add(agent)
        db.session.commit()

        if knowledge_base_ids:
            for knowledge_base_id in knowledge_base_ids:
                agent_knowledge_base = AgentKnowledgeBase(
                    agent_id=agent.id,
                    knowledge_base_id=knowledge_base_id,
                )
                db.session.add(agent_knowledge_base)
                db.session.commit()
        else:
            raise KonwledgeBaseIdEmptyError("Knowledge base ids is empty")

        return agent

    @staticmethod
    def is_agent_name_exists(tenant_id: int, name: str) -> bool:
        return Agent.query.filter_by(name=name, tenant_id=tenant_id).first() is not None
