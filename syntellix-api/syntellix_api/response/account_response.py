from flask_restful import fields

simple_account_fields = {
    "id": fields.Integer,
    "name": fields.String,
    "email": fields.String,
}

account_fields = {
    "id": fields.Integer,
    "name": fields.String,
    "avatar": fields.String,
    "email": fields.String,
    "is_password_set": fields.Boolean,
    "status": fields.String,
    "last_login_at": fields.DateTime,
    "last_login_ip": fields.String,
    "created_at": fields.DateTime,
    "updated_at": fields.DateTime,
}

account_with_role_fields = {
    "id": fields.Integer,
    "name": fields.String,
    "avatar": fields.String,
    "email": fields.String,
    "last_login_at": fields.DateTime,
    "created_at": fields.DateTime,
    "role": fields.String,
    "status": fields.String,
}

account_with_role_list_fields = {
    "accounts": fields.List(fields.Nested(account_with_role_fields))
}
