from flask_restful import fields

upload_config_fields = {
    "file_size_limit": fields.Integer,
    "batch_count_limit": fields.Integer,
    "image_file_size_limit": fields.Integer,
}

file_fields = {
    "id": fields.Integer,
    "name": fields.String,
    "size": fields.Integer,
    "extension": fields.String,
    "mime_type": fields.String,
    "created_by": fields.Integer,
    "created_at": fields.DateTime,
}
