from flask import request
from flask_login import current_user
from flask_restful import Resource, marshal, reqparse
from syntellix_api.controllers.api_errors import KnowledgeBaseNameDuplicateError
from syntellix_api.controllers.console import api
from syntellix_api.libs.login import login_required
from syntellix_api.models.dataset_model import KnowledgeBasePermissionEnum
from syntellix_api.response.knowledge_base_response import knowledge_base_detail_fields
from syntellix_api.services.dataset_service import (
    KnowledgeBasePermissionService,
    KonwledgeBaseService,
    DocumentService,
)
from syntellix_api.services.errors.account import NoPermissionError
from syntellix_api.services.errors.dataset import (
    DatasetInUseError,
    DatasetNameDuplicateError,
)
from werkzeug.exceptions import Forbidden, NotFound


class DatasetDocumentListApi(Resource):
    # @login_required
    # def get(self, dataset_id):
    #     dataset_id = str(dataset_id)
    #     page = request.args.get("page", default=1, type=int)
    #     limit = request.args.get("limit", default=20, type=int)
    #     search = request.args.get("keyword", default=None, type=str)
    #     sort = request.args.get("sort", default="-created_at", type=str)
    #     # "yes", "true", "t", "y", "1" convert to True, while others convert to False.
    #     try:
    #         fetch = string_to_bool(request.args.get("fetch", default="false"))
    #     except (ArgumentTypeError, ValueError, Exception) as e:
    #         fetch = False
    #     dataset = DatasetService.get_dataset(dataset_id)
    #     if not dataset:
    #         raise NotFound("Dataset not found.")

    #     try:
    #         DatasetService.check_dataset_permission(dataset, current_user)
    #     except services.errors.account.NoPermissionError as e:
    #         raise Forbidden(str(e))

    #     query = Document.query.filter_by(dataset_id=str(dataset_id), tenant_id=current_user.current_tenant_id)

    #     if search:
    #         search = f"%{search}%"
    #         query = query.filter(Document.name.like(search))

    #     if sort.startswith("-"):
    #         sort_logic = desc
    #         sort = sort[1:]
    #     else:
    #         sort_logic = asc

    #     if sort == "hit_count":
    #         sub_query = (
    #             db.select(DocumentSegment.document_id, db.func.sum(DocumentSegment.hit_count).label("total_hit_count"))
    #             .group_by(DocumentSegment.document_id)
    #             .subquery()
    #         )

    #         query = query.outerjoin(sub_query, sub_query.c.document_id == Document.id).order_by(
    #             sort_logic(db.func.coalesce(sub_query.c.total_hit_count, 0)),
    #             sort_logic(Document.position),
    #         )
    #     elif sort == "created_at":
    #         query = query.order_by(
    #             sort_logic(Document.created_at),
    #             sort_logic(Document.position),
    #         )
    #     else:
    #         query = query.order_by(
    #             desc(Document.created_at),
    #             desc(Document.position),
    #         )

    #     paginated_documents = query.paginate(page=page, per_page=limit, max_per_page=100, error_out=False)
    #     documents = paginated_documents.items
    #     if fetch:
    #         for document in documents:
    #             completed_segments = DocumentSegment.query.filter(
    #                 DocumentSegment.completed_at.isnot(None),
    #                 DocumentSegment.document_id == str(document.id),
    #                 DocumentSegment.status != "re_segment",
    #             ).count()
    #             total_segments = DocumentSegment.query.filter(
    #                 DocumentSegment.document_id == str(document.id), DocumentSegment.status != "re_segment"
    #             ).count()
    #             document.completed_segments = completed_segments
    #             document.total_segments = total_segments
    #         data = marshal(documents, document_with_segments_fields)
    #     else:
    #         data = marshal(documents, document_fields)
    #     response = {
    #         "data": data,
    #         "has_more": len(documents) == limit,
    #         "limit": limit,
    #         "total": paginated_documents.total,
    #         "page": page,
    #     }

    #     return response

    # documents_and_batch_fields = {"documents": fields.List(fields.Nested(document_fields)), "batch": fields.String}

    @login_required
    # @marshal_with(documents_and_batch_fields)
    def post(self, konwledge_base_id):

        konwledge_base = KonwledgeBaseService.get_knowledge_base(konwledge_base_id)

        if not konwledge_base:
            raise NotFound("Knowledge base not found.")

        # The role of the current user in the ta table must be admin, owner, or editor
        if not current_user.is_dataset_editor:
            raise Forbidden()

        try:
            KonwledgeBaseService.check_knowledge_base_permission(
                konwledge_base, current_user
            )
        except NoPermissionError as e:
            raise Forbidden(str(e))

        parser = reqparse.RequestParser()
        parser.add_argument(
            "data_source", type=dict, required=True, nullable=True, location="json"
        )
        parser.add_argument("file_ids", type=list, required=True, location="json")
        parser.add_argument("parser_type", type=str, required=True, location="json")
        parser.add_argument("parser_config", type=dict, required=False, location="json")
        args = parser.parse_args()

        try:
            documents, batch = DocumentService.save_documents(
                konwledge_base, args, current_user
            )
        except ProviderTokenNotInitError as ex:
            raise ProviderNotInitializeError(ex.description)
        except QuotaExceededError:
            raise ProviderQuotaExceededError()
        except ModelCurrentlyNotSupportError:
            raise ProviderModelCurrentlyNotSupportError()

        return {"documents": documents, "batch": batch}


api.add_resource(DatasetDocumentListApi, "/datasets/<int:dataset_id>/documents")
