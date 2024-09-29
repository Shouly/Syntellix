from datetime import datetime

from flask import request
from flask_login import current_user
from flask_restful import Resource, marshal_with, reqparse
from syntellix_api.controllers.api_errors import (
    AgentNotFoundError as api_agent_not_found_error,
)
from syntellix_api.controllers.console import api
from syntellix_api.libs.login import login_required
from syntellix_api.models.chat_model import ConversationMessageType
from syntellix_api.response.chat_response import (
    agent_chat_details_fields,
    conversation_fields,
    conversation_message_fields,
    recent_chat_status_fields,
)
from syntellix_api.services.agent_service import AgentService
from syntellix_api.services.chat_service import ChatService
from syntellix_api.services.errors.agent import AgentNotFoundError
from werkzeug.exceptions import Forbidden, NotFound


class ConversationApi(Resource):
    @login_required
    @marshal_with(conversation_fields)
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("agent_id", type=int, required=True)
        parser.add_argument("name", type=str, required=False)
        args = parser.parse_args()

        name = args["name"]
        if name is None:
            name = f"未命名会话 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"

        agent = AgentService.get_agent_by_id(
            args["agent_id"], current_user.current_tenant_id
        )
        if not agent:
            raise api_agent_not_found_error()

        if agent.created_by != current_user.id:
            raise Forbidden()

        conversation = ChatService.create_conversation(
            user_id=current_user.id, agent_id=args["agent_id"], name=name
        )
        return conversation, 201

    @login_required
    def delete(self):
        parser = reqparse.RequestParser()
        parser.add_argument("conversation_id", type=int, required=True)
        args = parser.parse_args()
        ChatService.delete_conversation(conversation_id=args["conversation_id"])
        return "", 204

    @login_required
    @marshal_with(conversation_fields)
    def put(self):
        parser = reqparse.RequestParser()
        parser.add_argument("conversation_id", type=int, required=True)
        parser.add_argument("new_name", type=str, required=True)
        args = parser.parse_args()

        conversation = ChatService.rename_conversation(
            conversation_id=args["conversation_id"], new_name=args["new_name"]
        )

        return conversation, 200


class ConversationMessageApi(Resource):
    @login_required
    @marshal_with(conversation_message_fields)
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("conversation_id", type=int, required=True)
        parser.add_argument("agent_id", type=int, required=True)
        parser.add_argument("message", type=str, required=True)
        parser.add_argument(
            "message_type", type=str, required=True, choices=("user", "agent")
        )
        parser.add_argument("citation", type=dict)
        parser.add_argument("pre_message_id", type=int)
        parser.add_argument("next_message_id", type=int)
        args = parser.parse_args()

        message = ChatService.save_conversation_message(
            conversation_id=args["conversation_id"],
            user_id=current_user.id,
            agent_id=args["agent_id"],
            message=args["message"],
            message_type=ConversationMessageType(args["message_type"]),
            citation=args["citation"],
            pre_message_id=args["pre_message_id"],
            next_message_id=args["next_message_id"],
        )
        return message, 201

    @login_required
    @marshal_with(conversation_message_fields)
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument("conversation_id", type=int, required=True)
        parser.add_argument("page", type=int, default=1)
        parser.add_argument("per_page", type=int, default=7)
        args = parser.parse_args()

        messages = ChatService.get_conversation_messages(
            conversation_id=args["conversation_id"],
            page=args["page"],
            per_page=args["per_page"],
        )
        return messages, 200


class AgentChatDetailsApi(Resource):
    @login_required
    @marshal_with(agent_chat_details_fields)
    def get(self, agent_id=None):
        if agent_id is None:
            # 获取最近的 agent_id
            agent_id = ChatService.get_latest_agent(user_id=current_user.id)
            if agent_id is None:
                return {
                    "has_recent_conversation": False,
                    "agent_id": None,
                    "latest_conversation": None,
                    "agent_info": None,
                    "latest_conversation_messages": [],
                    "pinned_conversations": [],
                    "conversation_history": [],
                }, 200

        agent = AgentService.get_agent_base_info_by_id(
            agent_id=agent_id,
            tenant_id=current_user.current_tenant_id,
        )

        latest_conversation = ChatService.get_latest_conversation(
            user_id=current_user.id,
            agent_id=agent_id,
        )

        latest_conversation_messages = []
        if latest_conversation:
            latest_conversation_messages = ChatService.get_conversation_messages(
                conversation_id=latest_conversation.id,
            )

        pinned_conversations = ChatService.get_pinned_conversations(
            agent_id=agent_id,
            user_id=current_user.id,
        )

        conversation_history = ChatService.get_conversation_history(
            agent_id=agent_id,
            user_id=current_user.id,
        )

        return {
            "has_recent_conversation": True,
            "agent_id": agent_id,
            "latest_conversation": latest_conversation,
            "agent_info": agent,
            "latest_conversation_messages": latest_conversation_messages,
            "pinned_conversations": pinned_conversations,
            "conversation_history": conversation_history,
        }, 200


api.add_resource(
    AgentChatDetailsApi, "/agent-chat-details", "/agent-chat-details/<int:agent_id>"
)
api.add_resource(ConversationApi, "/conversations")
api.add_resource(ConversationMessageApi, "/conversation-messages")
