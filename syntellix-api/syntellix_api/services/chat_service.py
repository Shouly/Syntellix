import json
from typing import Generator

from syntellix_api.extensions.ext_database import db
from syntellix_api.llm.llm_factory import LLMFactory
from syntellix_api.models.chat_model import (
    Conversation,
    ConversationMessage,
    ConversationMessageType,
)


class ChatService:

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

        if page > 1 and len(messages) < per_page:
            additional_messages = (
                ConversationMessage.query.filter_by(conversation_id=conversation_id)
                .order_by(ConversationMessage.created_at.desc())
                .offset(0)
                .limit(per_page - len(messages))
                .all()
            )
            additional_messages.reverse()
            messages = additional_messages + messages

        return conversation, messages

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
        conversation_id: int, user_id: int, agent_id: int, message: str
    ) -> Generator[str, None, None]:
        conversation = Conversation.query.get(conversation_id)
        if not conversation:
            yield json.dumps({"error": "Conversation not found"})
            return

        # 保存用户消息
        user_message = ConversationMessage(
            conversation_id=conversation_id,
            user_id=user_id,
            agent_id=agent_id,
            message=message,
            message_type=ConversationMessageType.USER,
        )
        db.session.add(user_message)
        db.session.commit()

        llm = LLMFactory.get_deepseek_model()

        # 获取历史对话
        history = ChatService.get_conversation_histories(conversation_id)

        full_response = ""
        system_message = ""  # 如果有系统消息，在这里设置

        # 使用 chat_streamly 方法进行流式输出
        for chunk in llm.chat_streamly(
            system_message, history + [{"role": "user", "content": message}], {}
        ):
            if isinstance(chunk, str):
                full_response += chunk
                yield json.dumps({"chunk": chunk})
            elif isinstance(chunk, int):
                # 这是总token数，可以选择是否发送给客户端
                yield json.dumps({"total_tokens": chunk})

        # 保存完整的 AI 响应
        ai_message = ConversationMessage(
            conversation_id=conversation_id,
            user_id=user_id,
            agent_id=agent_id,
            message=full_response,
            message_type=ConversationMessageType.AGENT,
        )
        db.session.add(ai_message)
        db.session.commit()

        yield json.dumps({"done": True})

    @staticmethod
    def get_conversation_histories(conversation_id: int):
        # 获取对话历史
        messages = (
            ConversationMessage.query.filter_by(conversation_id=conversation_id)
            .order_by(ConversationMessage.created_at)
            .all()
        )
        history = []
        for msg in messages:
            role = (
                "user"
                if msg.message_type == ConversationMessageType.USER
                else "assistant"
            )
            history.append({"role": role, "content": msg.message})
        return history
