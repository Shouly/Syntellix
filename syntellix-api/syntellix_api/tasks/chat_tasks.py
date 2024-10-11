from celery import shared_task
from syntellix_api.extensions.ext_database import db
from syntellix_api.models.chat_model import ConversationMessage


@shared_task
def save_message_task(conversation_id, user_id, agent_id, message, message_type):
    conversation_message = ConversationMessage(
        conversation_id=conversation_id,
        user_id=user_id,
        agent_id=agent_id,
        message=message,
        message_type=message_type,
    )
    db.session.add(conversation_message)
    db.session.commit()
