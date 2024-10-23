import datetime
import json

from flask import request
from flask_login import current_user
from flask_restful import Resource, fields, marshal, marshal_with, reqparse
from sqlalchemy import asc, desc
from syntellix_api.controllers.console import api
from syntellix_api.libs.login import login_required
from syntellix_api.models.dataset_model import Document
from syntellix_api.response.document_response import document_fields
from syntellix_api.services.dataset_service import DocumentService, KonwledgeBaseService
from syntellix_api.services.errors.account import NoPermissionError
from werkzeug.exceptions import Forbidden, NotFound


class KnowledgeBaseDocumentListApi(Resource):
    @login_required
    def get(self, knowledge_base_id):
        page = request.args.get("page", default=1, type=int)
        limit = request.args.get("limit", default=20, type=int)
        search = request.args.get("keyword", default=None, type=str)

        knowledge_base = KonwledgeBaseService.get_knowledge_base(knowledge_base_id)
        if not knowledge_base:
            raise NotFound("Knowledge base not found.")

        try:
            KonwledgeBaseService.check_knowledge_base_permission(
                knowledge_base, current_user
            )
        except NoPermissionError as e:
            raise Forbidden(str(e))

        query = Document.query.filter_by(
            knowledge_base_id=knowledge_base_id,
            tenant_id=current_user.current_tenant_id,
        )

        if search:
            query = query.filter(Document.name.ilike(f"%{search}%"))

        query = query.order_by(
            desc(Document.created_at),
        )

        paginated_documents = query.paginate(
            page=page, per_page=limit, max_per_page=100, error_out=False
        )
        documents = paginated_documents.items
        data = marshal(documents, document_fields)
        response = {
            "data": data,
            "has_more": len(documents) == limit,
            "limit": limit,
            "total": paginated_documents.total,
            "page": page,
        }

        return response

    documents_and_batch_fields = {
        "documents": fields.List(fields.Nested(document_fields)),
        "batch": fields.String,
        "knowledge_base_id": fields.Integer,
    }

    @login_required
    @marshal_with(documents_and_batch_fields)
    def post(self, knowledge_base_id=None):
        parser = reqparse.RequestParser()
        parser.add_argument(
            "data_source", type=dict, required=True, nullable=True, location="json"
        )
        parser.add_argument("file_ids", type=list, required=True, location="json")
        parser.add_argument("parser_type", type=str, required=True, location="json")
        parser.add_argument("parser_config", type=dict, required=False, location="json")
        parser.add_argument(
            "knowledge_base_name", type=str, required=False, location="json"
        )
        args = parser.parse_args()

        if knowledge_base_id is None:
            # Create a new knowledge base
            kb_name = (
                args.get("knowledge_base_name")
                or f"知识库 {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
            )
            knowledge_base = KonwledgeBaseService.create_empty_knowledge_base(
                tenant_id=current_user.current_tenant_id,
                name=kb_name,
                account=current_user,
            )
            knowledge_base_id = knowledge_base.id
        else:
            knowledge_base = KonwledgeBaseService.get_knowledge_base(knowledge_base_id)

        if not knowledge_base:
            raise NotFound("Knowledge base not found.")

        # The role of the current user in the ta table must be admin, owner, or editor
        if not current_user.is_dataset_editor:
            raise Forbidden()

        try:
            KonwledgeBaseService.check_knowledge_base_permission(
                knowledge_base, current_user
            )
        except NoPermissionError as e:
            raise Forbidden(str(e))

        documents, batch = DocumentService.save_documents(
            knowledge_base, args, current_user
        )

        return {"documents": documents, "batch": batch, "knowledge_base_id": knowledge_base_id}


class KnowledgeBaseDocumentProgressApi(Resource):
    @login_required
    def get(self, knowledge_base_id):
        parser = reqparse.RequestParser()
        parser.add_argument("file_ids", type=str, required=True, location="args")
        args = parser.parse_args()

        file_ids = json.loads(args["file_ids"])

        knowledge_base = KonwledgeBaseService.get_knowledge_base(knowledge_base_id)
        if not knowledge_base:
            raise NotFound("Knowledge base not found.")

        documents = DocumentService.get_documents_progress(knowledge_base_id, file_ids)

        if not documents:
            raise NotFound("No documents found for the given file IDs.")

        return {"knowledge_base_id": knowledge_base_id, "documents": documents}, 200


api.add_resource(
    KnowledgeBaseDocumentListApi,
    "/knowledge-bases/documents",
    "/knowledge-bases/<int:knowledge_base_id>/documents",
)
api.add_resource(
    KnowledgeBaseDocumentProgressApi,
    "/knowledge-bases/<int:knowledge_base_id>/documents/progress",
)
