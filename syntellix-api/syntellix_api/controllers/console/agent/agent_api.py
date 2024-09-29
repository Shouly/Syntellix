from flask_login import current_user
from flask_restful import Resource, marshal_with, reqparse
from syntellix_api.controllers.api_errors import (
    AgentNameDuplicateError as api_agent_name_duplicate_error,
)
from syntellix_api.controllers.api_errors import (
    KonwledgeBaseIdEmptyError as api_knowledge_base_id_empty_error,
)
from syntellix_api.controllers.console import api
from syntellix_api.libs.login import login_required
from syntellix_api.response.agent_response import (
    agent_base_info_fields,
    agent_fields,
    agent_list_fields,
)
from syntellix_api.services.agent_service import AgentService
from syntellix_api.services.errors.agent import (
    AgentNameDuplicateError,
    AgentNotBelongToUserError,
    AgentNotFoundError,
    KonwledgeBaseIdEmptyError,
)
from werkzeug.exceptions import Forbidden, NotFound


class AgentApi(Resource):

    @login_required
    def get(self):
        pass

    @login_required
    @marshal_with(agent_fields)
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("name", type=str, required=True, location="json")
        parser.add_argument("description", type=str, required=False, location="json")
        parser.add_argument("avatar", type=str, required=False, location="json")
        parser.add_argument(
            "greeting_message", type=str, required=False, location="json"
        )
        parser.add_argument("show_citation", type=bool, required=False, location="json")
        parser.add_argument("empty_response", type=str, required=False, location="json")
        parser.add_argument(
            "advanced_config", type=dict, required=False, location="json"
        )
        parser.add_argument(
            "knowledge_base_ids", type=list, required=True, location="json"
        )
        args = parser.parse_args()

        try:
            agent = AgentService.create_agent(
                tenant_id=current_user.current_tenant_id,
                user_id=current_user.id,
                **args
            )
        except AgentNameDuplicateError:
            raise api_agent_name_duplicate_error()
        except KonwledgeBaseIdEmptyError:
            raise api_knowledge_base_id_empty_error()

        return agent, 201


class AgentNameExistsApi(Resource):
    @login_required
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument("name", type=str, required=True, location="args")
        args = parser.parse_args()

        exists = AgentService.is_agent_name_exists(
            tenant_id=current_user.current_tenant_id, name=args["name"]
        )

        return {"exists": exists}, 200


class AgentListApi(Resource):
    @login_required
    @marshal_with(agent_list_fields)
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument("page", type=int, default=1, location="args")
        parser.add_argument("page_size", type=int, default=10, location="args")
        parser.add_argument("search", type=str, required=False, location="args")
        args = parser.parse_args()

        result = AgentService.get_agents(
            tenant_id=current_user.current_tenant_id,
            user_id=current_user.id,
            page=args["page"],
            page_size=args["page_size"],
            search=args.get("search"),
        )

        return result


class AgentOperationApi(Resource):
    @login_required
    def delete(self, agent_id):
        try:
            AgentService.delete_agent(
                tenant_id=current_user.current_tenant_id,
                user_id=current_user.id,
                agent_id=agent_id,
            )
        except AgentNotBelongToUserError:
            raise Forbidden()
        except AgentNotFoundError:
            raise NotFound()

        return {"result": "success"}, 204

    @login_required
    @marshal_with(agent_base_info_fields)
    def get(self, agent_id):
        agent = AgentService.get_agent_base_info_by_id(
            agent_id=agent_id, tenant_id=current_user.current_tenant_id
        )
        if not agent:
            raise NotFound()
        return agent, 200


api.add_resource(AgentListApi, "/agents/list")
api.add_resource(AgentNameExistsApi, "/agents/name-exists")
api.add_resource(AgentApi, "/agents")
api.add_resource(AgentOperationApi, "/agents/<int:agent_id>")
