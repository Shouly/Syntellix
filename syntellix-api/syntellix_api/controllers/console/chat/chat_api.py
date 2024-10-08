import json

from flask import Response, stream_with_context
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
    conversation_with_messages_fields,
)
from syntellix_api.services.agent_service import AgentService
from syntellix_api.services.chat_service import ChatService
from werkzeug.exceptions import Forbidden


class ChatConversationApi(Resource):
    @login_required
    @marshal_with(conversation_fields)
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("agent_id", type=int, required=True)
        parser.add_argument("name", type=str, required=False)
        args = parser.parse_args()

        name = args["name"]
        if name is None:
            name = f"未命名会话"

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

        ChatService.save_conversation_message(
            conversation_id=conversation.id,
            user_id=current_user.id,
            agent_id=args["agent_id"],
            message=agent.greeting_message,
            message_type=ConversationMessageType.AGENT,
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


class ChatConversationStreamApi(Resource):

    @login_required
    def get(self, conversation_id):

        parser = reqparse.RequestParser()
        parser.add_argument("agent_id", type=int, required=True, location="args")
        parser.add_argument("message", type=str, required=True, location="args")
        args = parser.parse_args()

        tenant_id = current_user.current_tenant_id
        user_id = current_user.id

        def generate():
            try:
                for chunk in ChatService.chat_stream(
                    tenant_id=tenant_id,
                    conversation_id=conversation_id,
                    user_id=user_id,
                    agent_id=args["agent_id"],
                    message=args["message"],
                ):
                    yield f"data: {chunk}\n\n"
            except Exception as e:
                import traceback

                error_traceback = traceback.format_exc()
                print(f"Error occurred: {str(e)}")
                print(f"Traceback:\n{error_traceback}")
                error_message = json.dumps({"error": str(e)})
                yield f"data: {error_message}\n\n"
            finally:
                yield 'data: {"done": true}\n\n'

        return Response(
            stream_with_context(generate()),
            mimetype="text/event-stream",
            headers={
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
                "Connection": "keep-alive",
            },
        )


class ChatConversationMessageApi(Resource):

    @login_required
    @marshal_with(conversation_with_messages_fields)
    def get(self, conversation_id):
        parser = reqparse.RequestParser()
        parser.add_argument("page", type=int, location="args", default=1)
        parser.add_argument("per_page", type=int, location="args", default=7)
        args = parser.parse_args()

        result = ChatService.get_conversation_messages(
            conversation_id=conversation_id,
            page=args["page"],
            per_page=args["per_page"],
        )

        if result is None:
            return {"error": "Conversation not found"}, 404

        conversation, messages = result

        return {
            "conversation": {
                "id": conversation.id,
                "name": conversation.name,
                "user_id": conversation.user_id,
                "agent_id": conversation.agent_id,
                "created_at": conversation.created_at,
                "updated_at": conversation.updated_at,
            },
            "messages": [
                {
                    "id": msg.id,
                    "message": msg.message,
                    "message_type": msg.message_type.value,
                    "citation": msg.citation,
                    "pre_message_id": msg.pre_message_id,
                    "next_message_id": msg.next_message_id,
                    "created_at": msg.created_at,
                    "updated_at": msg.updated_at,
                }
                for msg in messages
            ],
        }, 200


class ChatAgentConversationApi(Resource):
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
                    "latest_conversation_id": None,
                    "agent_info": None,
                }, 200

        agent = AgentService.get_agent_base_info_by_id(
            agent_id=agent_id,
            tenant_id=current_user.current_tenant_id,
        )

        latest_conversation = ChatService.get_latest_conversation(
            user_id=current_user.id,
            agent_id=agent_id,
        )

        if latest_conversation is None:

            latest_conversation = ChatService.create_conversation(
                user_id=current_user.id,
                agent_id=agent_id,
                name=f"未命名会话",
            )
            ChatService.save_conversation_message(
                conversation_id=latest_conversation.id,
                user_id=current_user.id,
                agent_id=agent_id,
                message=agent.get("greeting_message", "Welcome!"),
                message_type=ConversationMessageType.AGENT,
            )

        return {
            "has_recent_conversation": True,
            "agent_id": agent_id,
            "latest_conversation_id": latest_conversation.id,
            "agent_info": agent,
        }, 200


class ChatAgentConversationHistoryApi(Resource):
    @login_required
    @marshal_with(conversation_fields)
    def get(self, agent_id):
        parser = reqparse.RequestParser()
        parser.add_argument("last_id", type=int, location="args")
        parser.add_argument("limit", type=int, location="args", default=10)
        args = parser.parse_args()

        conversations = ChatService.get_conversation_history(
            user_id=current_user.id,
            agent_id=agent_id,
            last_id=args["last_id"],
            limit=args["limit"],
        )

        return conversations, 200


class ChatAgentConversationPinnedApi(Resource):
    @login_required
    @marshal_with(conversation_fields)
    def get(self, agent_id):
        conversations = ChatService.get_all_pinned_conversations(
            user_id=current_user.id,
            agent_id=agent_id,
        )
        return conversations, 200


api.add_resource(ChatAgentConversationApi, "/chat/agent", "/chat/agent/<int:agent_id>")
api.add_resource(
    ChatConversationMessageApi, "/chat/conversation/<int:conversation_id>/messages"
)
api.add_resource(
    ChatConversationStreamApi, "/chat/conversation/<int:conversation_id>/stream"
)
api.add_resource(ChatConversationApi, "/chat/conversations")
api.add_resource(
    ChatAgentConversationHistoryApi, "/chat/agent/<int:agent_id>/conversation-history"
)
