import json
from collections import defaultdict
from datetime import datetime
from typing import Generator, Union

from syntellix_api.extensions.ext_database import db
from syntellix_api.extensions.ext_redis import redis_client
from syntellix_api.models.chat_model import (
    Conversation,
    ConversationMessage,
    ConversationMessageType,
)
from syntellix_api.services.agent_service import AgentService
from syntellix_api.services.rag_service import RAGService


class ChatService:
    CONVERSATION_MESSAGES_CACHE_KEY = "chat:conversation:messages:{}"
    CACHE_MESSAGE_LIMIT = 20

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
    ):
        conversation_message = ConversationMessage(
            conversation_id=conversation_id,
            user_id=user_id,
            agent_id=agent_id,
            message=message,
            message_type=message_type,
            citation=citation,
            pre_message_id=pre_message_id,
        )

        db.session.add(conversation_message)
        db.session.commit()

        # 更新缓存
        ChatService.update_conversation_messages_cache(
            conversation_id,
            conversation_message.to_dict(),
        )

        return conversation_message

    @staticmethod
    def get_conversation_messages(
        conversation_id: int, page: int = 1, per_page: int = 10
    ):
        conversation = Conversation.query.get(conversation_id)
        if not conversation:
            return None

        cache_key = ChatService.CONVERSATION_MESSAGES_CACHE_KEY.format(conversation_id)
        cached_messages = redis_client.lrange(cache_key, 0, -1)

        if cached_messages and len(cached_messages) >= (page * per_page):
            # 如果缓存中的消息足够，直接从缓存中获取
            start = (page - 1) * per_page
            end = start + per_page
            paginated_messages = [json.loads(msg) for msg in cached_messages[start:end]]
            has_more = len(cached_messages) > end
            return conversation, paginated_messages, has_more

        # 缓存中的消息不足，需要查询数据库
        all_messages = ConversationMessage.query.filter_by(
            conversation_id=conversation_id
        ).all()

        # 构建消息树和有序消息列表
        message_tree = defaultdict(list)
        root_messages = []
        for message in all_messages:
            if message.pre_message_id is None:
                root_messages.append(message)
            else:
                message_tree[message.pre_message_id].append(message)

        ordered_messages = []

        def build_ordered_list(message):
            ordered_messages.append(message)
            for child in message_tree[message.id]:
                build_ordered_list(child)

        for root_message in root_messages:
            build_ordered_list(root_message)

        # 计算分页
        total_messages = len(ordered_messages)
        start = (page - 1) * per_page
        end = start + per_page
        paginated_messages = ordered_messages[start:end]

        has_more = total_messages > end

        # 只有当请求的是最新的消息时，才更新缓存
        if page == 1:
            ChatService.update_conversation_messages_cache(
                conversation_id, ordered_messages[-ChatService.CACHE_MESSAGE_LIMIT:]
            )

        return conversation, paginated_messages, has_more

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
        tenant_id: int,
        conversation_id: int,
        user_id: int,
        agent_id: int,
        user_message: str,
        pre_message_id: int,
    ) -> Generator[str, None, None]:
        # 初始化检查
        agent, conversation = ChatService._initialize_chat(
            tenant_id, agent_id, conversation_id
        )
        if not agent or not conversation:
            yield json.dumps({"error": "Agent or Conversation not found"})
            return

        # 保存用户消息并获取消息ID
        user_message_id = ChatService._save_user_message(
            conversation_id, user_id, agent_id, user_message, pre_message_id
        )

        # 发送状态更新，表明正在检文档
        yield json.dumps({"status": "retrieving_documents"})

        # 检索相关文档
        filtered_nodes, context_str = RAGService.retrieve_relevant_documents(
            tenant_id, agent_id, user_message
        )

        yield json.dumps({"status": "retrieving_documents_done"})

        if not filtered_nodes:
            response_message = agent.empty_response
            yield json.dumps({"chunk": response_message})
            ChatService._save_ai_response_and_update_cache(
                conversation_id,
                user_id,
                agent_id,
                response_message,
                user_message_id,
            )
            return

        # 发送状态更新，表明正在生成回答
        yield json.dumps({"status": "generating_answer"})

        # 获取对话历史
        conversation_history = ChatService.get_conversation_histories(conversation_id)

        # 生成响应
        full_response = ""
        for chunk in RAGService.call_llm(
            conversation_history, user_message, context_str
        ):
            full_response += chunk
            yield json.dumps({"chunk": chunk}, ensure_ascii=False)

        # 保存AI响应并更新对话历史
        ChatService._save_ai_response_and_update_cache(
            conversation_id,
            user_id,
            agent_id,
            full_response,
            user_message_id,
        )

    @staticmethod
    def _initialize_chat(tenant_id: int, agent_id: int, conversation_id: int):
        agent = AgentService.get_agent_by_id(agent_id, tenant_id)
        conversation = Conversation.query.get(conversation_id)
        return agent, conversation

    @staticmethod
    def _save_user_message(
        conversation_id: int,
        user_id: int,
        agent_id: int,
        message: str,
        pre_message_id: int = None,
    ) -> int:
        user_message = ConversationMessage(
            conversation_id=conversation_id,
            user_id=user_id,
            agent_id=agent_id,
            message=message,
            message_type=ConversationMessageType.USER,
            pre_message_id=pre_message_id,
        )
        db.session.add(user_message)
        db.session.commit()

        # 更新缓存
        ChatService.update_conversation_messages_cache(
            conversation_id,
            {
                'id': user_message.id,
                'user_id': user_id,
                'agent_id': agent_id,
                'message': message,
                'message_type': ConversationMessageType.USER.value,
                'created_at': user_message.created_at.isoformat(),
                'pre_message_id': pre_message_id
            }
        )

        return user_message.id

    @staticmethod
    def _save_ai_response_and_update_cache(
        conversation_id: int,
        user_id: int,
        agent_id: int,
        llm_response: str,
        user_message_id: int,
    ):
        # 保存 AI 响应消息
        conversation_message = ConversationMessage(
            conversation_id=conversation_id,
            user_id=user_id,
            agent_id=agent_id,
            message=llm_response,
            message_type=ConversationMessageType.AGENT,
            pre_message_id=user_message_id,
        )
        db.session.add(conversation_message)
        db.session.commit()

        # 更新缓存
        ChatService.update_conversation_messages_cache(
            conversation_id,
            {
                "id": conversation_message.id,
                "user_id": user_id,
                "agent_id": agent_id,
                "message": llm_response,
                "message_type": ConversationMessageType.AGENT.value,
                "created_at": conversation_message.created_at.isoformat(),
                "pre_message_id": user_message_id,
            },
        )

    @staticmethod
    def get_conversation_histories(conversation_id: int, max_messages: int = 10):
        try:
            cache_key = ChatService.CONVERSATION_MESSAGES_CACHE_KEY.format(
                conversation_id
            )
            cached_messages = redis_client.lrange(cache_key, 0, -1)

            if cached_messages:
                messages = [json.loads(msg) for msg in cached_messages][-max_messages:]
            else:
                _, messages, _ = ChatService.get_conversation_messages(
                    conversation_id, page=1, per_page=max_messages
                )

            history = []
            for msg in messages:
                if isinstance(msg, dict):
                    message_type = msg.get("message_type")
                    message_content = msg.get("message")
                else:
                    message_type = msg.message_type.value
                    message_content = msg.message

                role = (
                    "user"
                    if message_type == ConversationMessageType.USER.value
                    else "assistant"
                )
                history_item = {"role": role, "content": message_content}
                history.append(history_item)

            return history
        except Exception as e:
            # 记录错误并返回空列表
            print(f"Error in get_conversation_histories: {str(e)}")
            return []

    @staticmethod
    def update_conversation_messages_cache(conversation_id: int, messages: list):
        cache_key = ChatService.CONVERSATION_MESSAGES_CACHE_KEY.format(conversation_id)
        
        # 清除旧的缓存
        redis_client.delete(cache_key)
        
        # 添加新的消息到缓存
        for message in messages:
            redis_client.rpush(cache_key, json.dumps({
                'id': message.id,
                'user_id': message.user_id,
                'agent_id': message.agent_id,
                'message': message.message,
                'message_type': message.message_type.value,
                'created_at': message.created_at.isoformat(),
                'pre_message_id': message.pre_message_id
            }))
        
        # 设置缓存过期时间，例如1小时
        redis_client.expire(cache_key, 3600)
