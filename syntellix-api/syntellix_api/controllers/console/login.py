from typing import cast

import flask_login
import services
from controllers.console import api
from flask import request
from flask_restful import Resource, reqparse
from libs.helper import email, get_remote_ip
from libs.password import valid_password
from models.account import Account
from services.account_service import AccountService, TenantService


class LoginApi(Resource):
    """Resource for user login."""

    def post(self):
        """Authenticate user and login."""
        parser = reqparse.RequestParser()
        parser.add_argument("email", type=email, required=True, location="json")
        parser.add_argument(
            "password", type=valid_password, required=True, location="json"
        )
        parser.add_argument(
            "remember_me", type=bool, required=False, default=False, location="json"
        )
        args = parser.parse_args()

        try:
            account = AccountService.authenticate(args["email"], args["password"])
        except services.errors.account.AccountLoginError as e:
            return {"code": "unauthorized", "message": str(e)}, 401

        tenants = TenantService.get_join_tenants(account)
        if len(tenants) == 0:
            return {
                "result": "fail",
                "data": "workspace not found, please contact system admin to invite you to join in a workspace",
            }

        token = AccountService.login(account, ip_address=get_remote_ip(request))

        return {"result": "success", "data": token}


class LogoutApi(Resource):
    def get(self):
        account = cast(Account, flask_login.current_user)
        token = request.headers.get("Authorization", "").split(" ")[1]
        AccountService.logout(account=account, token=token)
        flask_login.logout_user()
        return {"result": "success"}


api.add_resource(LoginApi, "/login")
api.add_resource(LogoutApi, "/logout")
