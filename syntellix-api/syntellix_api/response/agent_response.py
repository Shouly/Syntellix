from flask_restful import fields
from syntellix_api.response.knowledge_base_response import (
    knowledge_base_base_info_fields,
)

agent_fields = {
    "id": fields.Integer,
    "tenant_id": fields.Integer,
    "name": fields.String,
    "description": fields.String,
    "avatar": fields.String,
    "greeting_message": fields.String,
    "show_citation": fields.Boolean,
    "empty_response": fields.String,
    "advanced_config": fields.Raw,
    "knowledge_base_ids": fields.List(fields.Integer),
    "created_at": fields.DateTime,
    "updated_at": fields.DateTime,
}

agent_list_fields = {
    "items": fields.List(fields.Nested(agent_fields)),
    "total": fields.Integer,
    "page": fields.Integer,
    "page_size": fields.Integer,
    "total_pages": fields.Integer,
    "has_next": fields.Boolean,
    "has_prev": fields.Boolean,
}

agent_base_info_fields = {
    "id": fields.Integer,
    "name": fields.String,
    "description": fields.String,
    "avatar": fields.String,
    "knowledge_bases": fields.List(fields.Nested(knowledge_base_base_info_fields)),
}
