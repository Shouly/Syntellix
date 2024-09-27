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
from syntellix_api.response.agent_response import agent_fields
from syntellix_api.services.agent_service import AgentService
from syntellix_api.services.errors.agent import (
    AgentNameDuplicateError,
    KonwledgeBaseIdEmptyError,
)


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


api.add_resource(AgentApi, "/agents")
