from flask_restful import fields
from syntellix_api.response.agent_response import agent_base_info_fields

conversation_fields = {
    "id": fields.Integer,
    "user_id": fields.Integer,
    "agent_id": fields.Integer,
    "name": fields.String,
    "created_at": fields.DateTime,
    "updated_at": fields.DateTime,
}

conversation_message_fields = {
    "id": fields.Integer,
    "conversation_id": fields.Integer,
    "user_id": fields.Integer,
    "agent_id": fields.Integer,
    "message": fields.String,
    "message_type": fields.String,
    "citation": fields.Raw,
    "pre_message_id": fields.Integer,
    "next_message_id": fields.Integer,
    "created_at": fields.DateTime,
    "updated_at": fields.DateTime,
}

conversation_with_messages_fields = {
    "conversation": fields.Nested({
        "id": fields.Integer,
        "name": fields.String,
        "user_id": fields.Integer,
        "agent_id": fields.Integer,
        "created_at": fields.DateTime,
        "updated_at": fields.DateTime,
    }),
    "messages": fields.List(fields.Nested({
        "id": fields.Integer,
        "message": fields.String,
        "message_type": fields.String,
        "citation": fields.Raw,
        "pre_message_id": fields.Integer,
        "next_message_id": fields.Integer,
        "created_at": fields.DateTime,
        "updated_at": fields.DateTime,
    })),
}

agent_chat_details_fields = {
    "has_recent_conversation": fields.Boolean,
    "agent_id": fields.Integer,
    "latest_conversation_id": fields.Integer,
    "agent_info": fields.Nested(agent_base_info_fields),
}