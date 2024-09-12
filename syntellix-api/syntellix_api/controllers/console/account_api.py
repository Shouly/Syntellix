from flask_login import current_user
from flask_restful import Resource, marshal_with, reqparse
from syntellix_api.controllers.api_errors import (
    AccountNameFormatError,
    CurrentPasswordIncorrectError,
    RepeatPasswordNotMatchError,
)
from syntellix_api.controllers.console import api
from syntellix_api.libs.login import login_required
from syntellix_api.response.account_response import account_fields
from syntellix_api.services.account_service import AccountService
from syntellix_api.services.errors.account import (
    CurrentPasswordIncorrectError as ServiceCurrentPasswordIncorrectError,
)


class AccountProfileApi(Resource):
    @login_required
    @marshal_with(account_fields)
    def get(self):
        return current_user


class AccountNameApi(Resource):
    @login_required
    @marshal_with(account_fields)
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("name", type=str, required=True, location="json")
        args = parser.parse_args()

        # Validate account name length
        if len(args["name"]) < 1 or len(args["name"]) > 30:
            raise AccountNameFormatError()

        updated_account = AccountService.update_account(current_user, name=args["name"])

        return updated_account


class AccountAvatarApi(Resource):
    @login_required
    @marshal_with(account_fields)
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("avatar", type=str, required=True, location="json")
        args = parser.parse_args()

        updated_account = AccountService.update_account(
            current_user, avatar=args["avatar"]
        )

        return updated_account


class AccountPasswordApi(Resource):
    @login_required
    @marshal_with(account_fields)
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("password", type=str, required=False, location="json")
        parser.add_argument("new_password", type=str, required=True, location="json")
        parser.add_argument(
            "repeat_new_password", type=str, required=True, location="json"
        )
        args = parser.parse_args()

        if args["new_password"] != args["repeat_new_password"]:
            raise RepeatPasswordNotMatchError()

        try:
            AccountService.update_account_password(
                current_user, args["password"], args["new_password"]
            )
        except ServiceCurrentPasswordIncorrectError:
            raise CurrentPasswordIncorrectError()

        return {"result": "success"}


# Register API resources
api.add_resource(AccountProfileApi, "/account/profile")
api.add_resource(AccountNameApi, "/account/name")
api.add_resource(AccountAvatarApi, "/account/avatar")
api.add_resource(AccountPasswordApi, "/account/password")
