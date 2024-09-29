from syntellix_api.extensions.ext_database import db
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

        return messages

    @staticmethod
    def get_pinned_conversations(
        agent_id: int, user_id: int, page: int = 1, per_page: int = 10
    ):
        offset = (page - 1) * per_page

        pinned_conversations = (
            Conversation.query.filter_by(
                user_id=user_id, agent_id=agent_id, pinned=True
            )
            .order_by(Conversation.updated_at.desc())
            .offset(offset)
            .limit(per_page)
            .all()
        )

        return pinned_conversations

    @staticmethod
    def get_conversation_history(
        agent_id: int, user_id: int, page: int = 1, per_page: int = 10
    ):
        offset = (page - 1) * per_page

        conversations = (
            Conversation.query.filter_by(user_id=user_id, agent_id=agent_id)
            .order_by(Conversation.updated_at.desc())
            .offset(offset)
            .limit(per_page)
            .all()
        )

        return conversations
