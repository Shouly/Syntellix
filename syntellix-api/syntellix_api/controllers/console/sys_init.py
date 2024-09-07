from extensions.ext_redis import redis_client
from flask import request
from flask_restful import Resource, reqparse
from libs.helper import email, get_remote_ip, str_len
from libs.password import valid_password
from services.account_service import RegisterService, TenantService

from ..errors import AlreadyInitError
from . import api


class SysInitApi(Resource):

    def get(self):
        return {"sys_init_status": get_sys_init_status()}

    def post(self):

        if get_sys_init_status():
            raise AlreadyInitError()

        tenant_count = TenantService.get_tenant_count()
        if tenant_count > 0:
            raise AlreadyInitError()

        parser = reqparse.RequestParser()
        parser.add_argument("email", type=email, required=True, location="json")
        parser.add_argument("name", type=str_len(30), required=True, location="json")
        parser.add_argument(
            "password", type=valid_password, required=True, location="json"
        )
        args = parser.parse_args()

        # init
        RegisterService.init(
            email=args["email"],
            name=args["name"],
            password=args["password"],
            ip_address=get_remote_ip(request),
        )

        redis_client.set("sys_init_status", "True")

        return {"result": "success"}, 201


def get_sys_init_status():
    return redis_client.get("sys_init_status") == "True"


api.add_resource(SysInitApi, "/sys_init")
