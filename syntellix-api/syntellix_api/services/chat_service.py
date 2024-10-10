import json
from typing import Generator

from syntellix_api.extensions.ext_database import db
from syntellix_api.extensions.ext_redis import redis_client
from syntellix_api.models.chat_model import (
    Conversation,
    ConversationMessage,
    ConversationMessageType,
)
from syntellix_api.services.agent_service import AgentService
from syntellix_api.services.rag_service import RAGService
from syntellix_api.tasks.chat_tasks import save_message_task, update_conversation_task


class ChatService:
    CONVERSATION_HISTORY_CACHE_KEY = "chat:conversation:history:{}"

    @staticmethod
    def create_conversation(user_id: int, agent_id: int, name: str):
        conversation = Conversation(user_id=user_id, agent_id=agent_id, name=name)
        db.session.add(conversation)
        db.session.commit()
        return conversation

    @staticmethod
    def delete_conversation(conversation_id: int):
        conversation = Conversation.query.get(conversation_id)
        if conversation:
            # Delete associated messages
            ConversationMessage.query.filter_by(
                conversation_id=conversation_id
            ).delete()

            # Delete the conversation
            db.session.delete(conversation)
            db.session.commit()
            return True
        return False

    @staticmethod
    def rename_conversation(conversation_id: int, new_name: str):
        conversation = Conversation.query.get(conversation_id)
        if conversation:
            conversation.name = new_name
            db.session.commit()
            return conversation
        return None

    @staticmethod
    def get_latest_agent(user_id: int):
        latest_conversation = (
            Conversation.query.filter_by(user_id=user_id)
            .order_by(Conversation.created_at.desc())
            .first()
        )

        if latest_conversation:
            return latest_conversation.agent_id

        return None

    @staticmethod
    def get_latest_conversation(user_id: int, agent_id: int):
        latest_conversation = (
            Conversation.query.filter_by(user_id=user_id, agent_id=agent_id)
            .order_by(Conversation.created_at.desc())
            .first()
        )

        return latest_conversation

    @staticmethod
    def save_conversation_message(
        conversation_id: int,
        user_id: int,
        agent_id: int,
        message: str,
        message_type: ConversationMessageType,
        citation: dict = None,
        pre_message_id: int = None,
        next_message_id: int = None,
    ):
        conversation_message = ConversationMessage(
            conversation_id=conversation_id,
            user_id=user_id,
            agent_id=agent_id,
            message=message,
            message_type=message_type,
            citation=citation,
            pre_message_id=pre_message_id,
            next_message_id=next_message_id,
        )

        db.session.add(conversation_message)
        db.session.commit()

        return conversation_message

    @staticmethod
    def get_conversation_messages(
        conversation_id: int, page: int = 1, per_page: int = 7
    ):
        conversation = Conversation.query.get(conversation_id)
        if not conversation:
            return None

        offset = (page - 1) * per_page

        messages = (
            ConversationMessage.query.filter_by(conversation_id=conversation_id)
            .order_by(ConversationMessage.created_at.desc())
            .offset(offset)
            .limit(per_page)
            .all()
        )

        messages.reverse()

        total_messages = ConversationMessage.query.filter_by(conversation_id=conversation_id).count()
        has_more = total_messages > offset + len(messages)

        return conversation, messages, has_more

    @staticmethod
    def get_all_pinned_conversations(user_id: int, agent_id: int):
        conversations = (
            Conversation.query.filter_by(
                user_id=user_id, agent_id=agent_id, is_pinned=True
            )
            .order_by(Conversation.updated_at.desc())
            .all()
        )
        return conversations

    @staticmethod
    def get_conversation_history(
        agent_id: int, user_id: int, last_id: int = None, limit: int = 10
    ):
        query = Conversation.query.filter_by(user_id=user_id, agent_id=agent_id)

        if last_id:
            last_conversation = Conversation.query.get(last_id)
            if last_conversation:
                query = query.filter(
                    Conversation.updated_at < last_conversation.updated_at
                )

        conversations = (
            query.order_by(Conversation.updated_at.desc()).limit(limit).all()
        )

        return conversations

    @staticmethod
    def chat_stream(
        tenant_id: int, conversation_id: int, user_id: int, agent_id: int, message: str
    ) -> Generator[str, None, None]:
        # 初始化检查
        agent, conversation = ChatService._initialize_chat(
            tenant_id, agent_id, conversation_id
        )
        if not agent or not conversation:
            yield json.dumps({"error": "Agent or Conversation not found"})
            return

        # 保存用户消息
        ChatService._save_user_message(conversation_id, user_id, agent_id, message)

        # 发送状态更新，表明正在检索文档
        yield json.dumps({"status": "retrieving_documents"})

        # 检索相关文档
        filtered_nodes, context_str = RAGService.retrieve_relevant_documents(
            tenant_id, agent_id, message
        )

        yield json.dumps({"status": "retrieving_documents_done"})

        if not filtered_nodes:
            yield json.dumps(
                {"chunk": agent.advanced_config.get("empty_response", "I don't know")}
            )
            return

        # 发送状态更新，表明正在生成回答
        yield json.dumps({"status": "generating_answer"})

        # 获取对话历史
        conversation_history = ChatService.get_conversation_histories(conversation_id)

        # 生成响应
        full_response = ""
        for chunk in RAGService.call_llm(conversation_history, message, context_str):
            full_response += chunk
            yield json.dumps({"chunk": chunk}, ensure_ascii=False)

        # 保存AI响应并更新对话历史
        ChatService._save_ai_response_and_update_history(
            conversation_id, user_id, agent_id, message, full_response
        )

    @staticmethod
    def _initialize_chat(tenant_id: int, agent_id: int, conversation_id: int):
        agent = AgentService.get_agent_by_id(agent_id, tenant_id)
        conversation = Conversation.query.get(conversation_id)
        return agent, conversation

    @staticmethod
    def _save_user_message(
        conversation_id: int, user_id: int, agent_id: int, message: str
    ):
        save_message_task.delay(
            conversation_id=conversation_id,
            user_id=user_id,
            agent_id=agent_id,
            message=message,
            message_type=ConversationMessageType.USER,
        )

    @staticmethod
    def _save_ai_response_and_update_history(
        conversation_id: int,
        user_id: int,
        agent_id: int,
        message: str,
        full_response: str,
    ):
        # 保存 AI 响应消息
        save_message_task.delay(
            conversation_id=conversation_id,
            user_id=user_id,
            agent_id=agent_id,
            message=full_response,
            message_type=ConversationMessageType.AGENT,
        )

        # 更新对话历史缓存
        ChatService.update_conversation_history_cache(
            conversation_id, {"role": "user", "content": message}
        )
        ChatService.update_conversation_history_cache(
            conversation_id, {"role": "assistant", "content": full_response}
        )

        # 更新对话
        update_conversation_task.delay(conversation_id)

    @staticmethod
    def get_conversation_histories(conversation_id: int, max_messages: int = 10):
        # 使用类常量来生成 cache_key
        cache_key = ChatService.CONVERSATION_HISTORY_CACHE_KEY.format(conversation_id)
        cached_history = redis_client.lrange(cache_key, 0, -1)

        if cached_history:
            # 如果有缓存，直接返回
            return [json.loads(msg) for msg in cached_history][-max_messages:]
        else:
            # 如果没有缓存，从数据库获取并缓存
            messages = (
                ConversationMessage.query.filter_by(conversation_id=conversation_id)
                .order_by(ConversationMessage.created_at)
                .limit(max_messages)
                .all()
            )
            history = []
            for msg in messages:
                role = (
                    "user"
                    if msg.message_type == ConversationMessageType.USER
                    else "assistant"
                )
                history_item = {"role": role, "content": msg.message}
                history.append(history_item)
                redis_client.rpush(cache_key, json.dumps(history_item))

            # 设置缓存过期时间，例如 1 小时
            redis_client.expire(cache_key, 3600)

            return history

    @staticmethod
    def update_conversation_history_cache(conversation_id: int, message: dict):
        # 使用类常量来生成 cache_key
        cache_key = ChatService.CONVERSATION_HISTORY_CACHE_KEY.format(conversation_id)
        redis_client.rpush(cache_key, json.dumps(message))
        redis_client.ltrim(cache_key, -10, -1)  # 保留最新的 10 条消息
        redis_client.expire(cache_key, 3600)  # 重新设置过期时间
