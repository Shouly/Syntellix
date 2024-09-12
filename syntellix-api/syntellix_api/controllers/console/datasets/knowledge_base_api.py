from flask import request
from flask_login import current_user
from flask_restful import Resource, marshal, reqparse
from syntellix_api.controllers.console import api
from syntellix_api.libs.login import login_required
from syntellix_api.models.dataset_model import KnowledgeBasePermissionEnum
from syntellix_api.response.knowledge_base_response import knowledge_base_detail_fields
from syntellix_api.services.dataset_service import (
    KnowledgeBasePermissionService,
    KonwledgeBaseService,
)
from syntellix_api.services.errors.account import NoPermissionError
from syntellix_api.services.errors.dataset import (
    DatasetInUseError,
    DatasetNameDuplicateError,
)
from syntellix_api.controllers.api_errors import KnowledgeBaseNameDuplicateError
from werkzeug.exceptions import Forbidden, NotFound


def _validate_name(name):
    if not name or len(name) < 1 or len(name) > 40:
        raise ValueError("Name must be between 1 to 40 characters.")
    return name


def _validate_description_length(description):
    if len(description) > 400:
        raise ValueError("Description cannot exceed 400 characters.")
    return description


class KnowledgeBaseListApi(Resource):

    @login_required
    def get(self):

        page = request.args.get("page", default=1, type=int)
        limit = request.args.get("limit", default=20, type=int)
        ids = request.args.getlist("ids")
        search = request.args.get("keyword", default=None, type=str)
        tag_ids = request.args.getlist("tag_ids")

        if ids:
            knowledge_bases, total = KonwledgeBaseService.get_knowledge_bases_by_ids(
                ids, current_user.current_tenant_id
            )
        else:
            knowledge_bases, total = KonwledgeBaseService.get_knowledge_bases(
                page,
                limit,
                current_user.current_tenant_id,
                current_user,
                search,
                tag_ids,
            )

        data = marshal(knowledge_bases, knowledge_base_detail_fields)

        for item in data:
            if item.get("permission") == "partial_members":
                part_users_list = KnowledgeBasePermissionService.get_knowledge_base_partial_member_list(
                    item["id"]
                )
                item.update({"partial_member_list": part_users_list})
            else:
                item.update({"partial_member_list": []})

        response = {
            "data": data,
            "has_more": len(knowledge_bases) == limit,
            "limit": limit,
            "total": total,
            "page": page,
        }

        return response, 200

    @login_required
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument(
            "name",
            nullable=False,
            required=True,
            help="type is required. Name must be between 1 to 40 characters.",
            type=_validate_name,
        )

        args = parser.parse_args()

        # The role of the current user in the ta table must be admin, owner, or editor, or dataset_operator
        if not current_user.is_dataset_editor:
            raise Forbidden()

        try:
            knowledge_base = KonwledgeBaseService.create_empty_knowledge_base(
                tenant_id=current_user.current_tenant_id,
                name=args["name"],
                account=current_user,
                permission=KnowledgeBasePermissionEnum.ONLY_ME,
            )
        except DatasetNameDuplicateError:
            raise KnowledgeBaseNameDuplicateError()

        return marshal(knowledge_base, knowledge_base_detail_fields), 201


class KnowledgeBaseApi(Resource):

    @login_required
    def get(self, knowledge_base_id):
        knowledge_base = KonwledgeBaseService.get_knowledge_base(knowledge_base_id)
        if knowledge_base is None:
            raise NotFound("Knowledge base not found.")
        try:
            KonwledgeBaseService.check_knowledge_base_permission(
                knowledge_base, current_user
            )
        except NoPermissionError as e:
            raise Forbidden(str(e))

        data = marshal(knowledge_base, knowledge_base_detail_fields)

        if data.get("permission") == KnowledgeBasePermissionEnum.PARTIAL_TEAM:
            part_users_list = (
                KnowledgeBasePermissionService.get_knowledge_base_partial_member_list(
                    knowledge_base_id
                )
            )
            data.update({"partial_member_list": part_users_list})

        return data, 200

    @login_required
    def delete(self, knowledge_base_id):

        # The role of the current user in the ta table must be admin, owner, or editor
        if not current_user.is_editor or current_user.is_dataset_operator:
            raise Forbidden()

        try:
            if KonwledgeBaseService.delete_knowledge_base(
                knowledge_base_id, current_user
            ):
                KnowledgeBasePermissionService.clear_partial_member_list(
                    knowledge_base_id
                )
                return {"result": "success"}, 204
            else:
                raise NotFound("Knowledge base not found.")

        except DatasetInUseError:
            raise DatasetInUseError()


class KnowledgeBasePermissionUserListApi(Resource):
    @login_required
    def get(self, knowledge_base_id):
        knowledge_base = KonwledgeBaseService.get_knowledge_base(knowledge_base_id)
        if knowledge_base is None:
            raise NotFound("Knowledge base not found.")
        try:
            KonwledgeBaseService.check_knowledge_base_permission(
                knowledge_base, current_user
            )
        except NoPermissionError as e:
            raise Forbidden(str(e))

        partial_members_list = (
            KnowledgeBasePermissionService.get_knowledge_base_partial_member_list(
                knowledge_base_id
            )
        )

        return {
            "data": partial_members_list,
        }, 200


api.add_resource(KnowledgeBaseListApi, "/knowledge-bases")
api.add_resource(KnowledgeBaseApi, "/knowledge-bases/<uuid:knowledge_base_id>")
api.add_resource(
    KnowledgeBasePermissionUserListApi,
    "/knowledge-bases/<uuid:knowledge_base_id>/permission-part-users",
)
