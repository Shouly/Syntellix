from flask_restful import fields

knowledge_base_fields = {
    "id": fields.Integer,
    "name": fields.String,
    "avatar": fields.String,
    "description": fields.String,
    "permission": fields.String(attribute=lambda x: x.permission.value),
    "data_source_type": fields.String(attribute=lambda x: x.data_source_type.value),
    "created_by": fields.Integer,
    "created_at": fields.DateTime,
}

knowledge_base_detail_fields = {
    "id": fields.Integer,
    "name": fields.String,
    "description": fields.String,
    "permission": fields.String(attribute=lambda x: x.permission.value),
    "data_source_type": fields.String(attribute=lambda x: x.data_source_type.value),
    "status": fields.Integer,
    "created_by": fields.Integer,
    "created_at": fields.DateTime,
    "updated_by": fields.Integer,
    "updated_at": fields.DateTime,
    "app_count": fields.Integer,
    "document_count": fields.Integer,
    # "tags": fields.List(fields.Nested(tag_fields)),
}

knowledge_base_query_detail_fields = {
    "id": fields.Integer,
    "content": fields.String,
    "source": fields.String,
    "source_app_id": fields.Integer,
    "created_by_role": fields.String,
    "created_by": fields.Integer,
    "created_at": fields.DateTime,
}
