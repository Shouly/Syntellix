from flask_restful import fields

document_fields = {
    "id": fields.Integer,
    "tenant_id": fields.Integer,
    "knowledge_base_id": fields.Integer,
    "upload_file_id": fields.Integer,
    "parser_type": fields.String(attribute=lambda x: x.parser_type.value),
    "parser_config": fields.Raw,
    "source_type": fields.String,
    "extension": fields.String,
    "name": fields.String,
    "location": fields.String,
    "size": fields.Integer,
    "token_num": fields.Integer,
    "chunk_num": fields.Integer,
    "progress": fields.Float,
    "progress_msg": fields.String,
    "process_begin_at": fields.DateTime,
    "process_duation": fields.Float,
    "parse_status": fields.String(attribute=lambda x: x.parse_status.value),
    "status": fields.Integer,
    "created_at": fields.DateTime,
    "updated_at": fields.DateTime,
}