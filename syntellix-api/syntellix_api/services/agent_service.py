import logging
from math import ceil
from typing import Optional

from sqlalchemy import or_
from syntellix_api.extensions.ext_database import db
from syntellix_api.models.agent_model import Agent, AgentKnowledgeBase
from syntellix_api.models.dataset_model import KnowledgeBase
from syntellix_api.services.errors.agent import (
    AgentNameDuplicateError,
    AgentNotBelongToUserError,
    AgentNotFoundError,
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

    @staticmethod
    def delete_agent(tenant_id: int, user_id: int, agent_id: int) -> None:
        agent = Agent.query.filter_by(id=agent_id, tenant_id=tenant_id).first()
        if agent:
            db.session.delete(agent)
            db.session.commit()

            AgentKnowledgeBase.query.filter_by(agent_id=agent_id).delete()
            db.session.commit()
        else:
            raise AgentNotFoundError(f"Agent with id '{agent_id}' not found.")

        if agent.created_by != user_id:
            raise AgentNotBelongToUserError(
                f"You do not have permission to delete this agent."
            )

    @staticmethod
    def get_agents(
        tenant_id: int,
        user_id: int,
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None,
    ):
        query = Agent.query.filter_by(tenant_id=tenant_id, created_by=user_id)

        if search:
            query = query.filter(
                or_(
                    Agent.name.ilike(f"%{search}%"),
                    Agent.description.ilike(f"%{search}%"),
                )
            )

        total = query.count()
        total_pages = ceil(total / page_size)

        query = query.order_by(Agent.id.desc())
        agents = query.offset((page - 1) * page_size).limit(page_size).all()

        has_next = page < total_pages
        has_prev = page > 1

        return {
            "items": agents,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "has_next": has_next,
            "has_prev": has_prev,
        }

    @staticmethod
    def get_agent_base_info_by_id(agent_id: int, tenant_id: int):
        result = (
            db.session.query(Agent, KnowledgeBase)
            .join(AgentKnowledgeBase, Agent.id == AgentKnowledgeBase.agent_id)
            .join(
                KnowledgeBase, AgentKnowledgeBase.knowledge_base_id == KnowledgeBase.id
            )
            .filter(Agent.id == agent_id, Agent.tenant_id == tenant_id)
            .all()
        )

        if not result:
            return None

        agent_info = {
            "id": result[0][0].id,
            "name": result[0][0].name,
            "avatar": result[0][0].avatar,
            "description": result[0][0].description,
            "knowledge_bases": [],
        }

        for _, kb in result:
            agent_info["knowledge_bases"].append(
                {
                    "id": kb.id,
                    "name": kb.name,
                    "icon": kb.avatar,
                    "description": kb.description,
                }
            )

        return agent_info

    @staticmethod
    def get_agent_by_id(agent_id: int, tenant_id: int):
        return Agent.query.filter_by(id=agent_id, tenant_id=tenant_id).first()
