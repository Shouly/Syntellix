import datetime
import logging
from typing import Optional

from redis import Redis
from rq import Queue
from syntellix_api.configs import syntellix_config
from syntellix_api.extensions.ext_database import db
from syntellix_api.models.account_model import Account, TenantAccountRole
from syntellix_api.models.dataset_model import (
    Document,
    DocumentParserTypeEnum,
    DocumentParseStatusEnum,
    KnowledgeBase,
    KnowledgeBasePermission,
    KnowledgeBasePermissionEnum,
    UploadFile,
)
from syntellix_api.services.errors.account import NoPermissionError
from syntellix_api.services.errors.dataset import DatasetNameDuplicateError
from syntellix_api.services.errors.file import FileNotExistsError
from syntellix_api.tasks.document_chunck_task import process_document_chunk

logger = logging.getLogger(__name__)


class KonwledgeBaseService:

    @staticmethod
    def get_knowledge_bases(
        page, per_page, tenant_id=None, user=None, search=None, tag_ids=None
    ):
        query = KnowledgeBase.query.filter(
            KnowledgeBase.tenant_id == tenant_id
        ).order_by(KnowledgeBase.created_at.desc())

        if user:
            # get permitted dataset ids
            dataset_permission = KnowledgeBasePermission.query.filter_by(
                account_id=user.id, tenant_id=tenant_id
            ).all()
            permitted_dataset_ids = (
                {dp.dataset_id for dp in dataset_permission}
                if dataset_permission
                else None
            )

            if user.current_role == TenantAccountRole.DATASET_OPERATOR:
                # only show datasets that the user has permission to access
                if permitted_dataset_ids:
                    query = query.filter(KnowledgeBase.id.in_(permitted_dataset_ids))
                else:
                    return [], 0
            else:
                # show all datasets that the user has permission to access
                if permitted_dataset_ids:
                    query = query.filter(
                        db.or_(
                            KnowledgeBase.permission
                            == KnowledgeBasePermissionEnum.ALL_TEAM,
                            db.and_(
                                KnowledgeBase.permission
                                == KnowledgeBasePermissionEnum.ONLY_ME,
                                KnowledgeBase.created_by == user.id,
                            ),
                            db.and_(
                                KnowledgeBase.permission
                                == KnowledgeBasePermissionEnum.PARTIAL_TEAM,
                                KnowledgeBase.id.in_(permitted_dataset_ids),
                            ),
                        )
                    )
                else:
                    query = query.filter(
                        db.or_(
                            KnowledgeBase.permission
                            == KnowledgeBasePermissionEnum.ALL_TEAM,
                            db.and_(
                                KnowledgeBase.permission
                                == KnowledgeBasePermissionEnum.ONLY_ME,
                                KnowledgeBase.created_by == user.id,
                            ),
                        )
                    )
        else:
            # if no user, only show datasets that are shared with all team members
            query = query.filter(
                KnowledgeBase.permission == KnowledgeBasePermissionEnum.ALL_TEAM
            )

        if search:
            query = query.filter(KnowledgeBase.name.ilike(f"%{search}%"))

        # if tag_ids:
        #     target_ids = TagService.get_target_ids_by_tag_ids(
        #         "knowledge", tenant_id, tag_ids
        #     )
        #     if target_ids:
        #         query = query.filter(Dataset.id.in_(target_ids))
        #     else:
        #         return [], 0

        datasets = query.paginate(
            page=page, per_page=per_page, max_per_page=100, error_out=False
        )

        return datasets.items, datasets.total

    @staticmethod
    def get_knowledge_bases_by_ids(ids, tenant_id):
        knowledge_bases = KnowledgeBase.query.filter(
            KnowledgeBase.id.in_(ids), KnowledgeBase.tenant_id == tenant_id
        ).paginate(page=1, per_page=len(ids), max_per_page=len(ids), error_out=False)
        return knowledge_bases.items, knowledge_bases.total

    @staticmethod
    def create_empty_knowledge_base(
        tenant_id: str,
        name: str,
        account: Account,
        permission: Optional[str] = None,
    ):
        # check if dataset name already exists
        if KnowledgeBase.query.filter_by(name=name, tenant_id=tenant_id).first():
            raise DatasetNameDuplicateError(
                f"Kownledge Base with name {name} already exists."
            )

        knowledge_base = KnowledgeBase(name=name)

        knowledge_base.created_by = account.id
        knowledge_base.updated_by = account.id
        knowledge_base.tenant_id = tenant_id
        knowledge_base.permission = (
            permission if permission else KnowledgeBasePermissionEnum.ONLY_ME
        )

        db.session.add(knowledge_base)
        db.session.commit()

        return knowledge_base

    @staticmethod
    def get_knowledge_base(knowledge_base_id):
        return KnowledgeBase.query.filter_by(id=knowledge_base_id).first()

    @staticmethod
    def delete_knowledge_base(knowledge_base_id, user):
        knowledge_base = KonwledgeBaseService.get_knowledge_base(knowledge_base_id)

        if knowledge_base is None:
            return False

        KonwledgeBaseService.check_knowledge_base_permission(knowledge_base, user)

        db.session.delete(knowledge_base)
        db.session.commit()
        return True

    @staticmethod
    def check_knowledge_base_permission(knowledge_base, user):
        if knowledge_base.tenant_id != user.current_tenant_id:
            logging.debug(
                f"User {user.id} does not have permission to access knowledge base {knowledge_base.id}"
            )
            raise NoPermissionError(
                "You do not have permission to access this knowledge base."
            )
        if (
            knowledge_base.permission == KnowledgeBasePermissionEnum.ONLY_ME
            and knowledge_base.created_by != user.id
        ):
            logging.debug(
                f"User {user.id} does not have permission to access knowledge base {knowledge_base.id}"
            )
            raise NoPermissionError(
                "You do not have permission to access this dataset."
            )
        if knowledge_base.permission == "partial_members":
            user_permission = KnowledgeBasePermission.query.filter_by(
                knowledge_base_id=knowledge_base.id, account_id=user.id
            ).first()
            if (
                not user_permission
                and knowledge_base.tenant_id != user.current_tenant_id
                and knowledge_base.created_by != user.id
            ):
                logging.debug(
                    f"User {user.id} does not have permission to access knowledge base {knowledge_base.id}"
                )
                raise NoPermissionError(
                    "You do not have permission to access this knowledge base."
                )

    @staticmethod
    def check_knowledge_base_operator_permission(
        user: Account = None, knowledge_base: KnowledgeBase = None
    ):
        if knowledge_base.permission == KnowledgeBasePermissionEnum.ONLY_ME:
            if knowledge_base.created_by != user.id:
                raise NoPermissionError(
                    "You do not have permission to access this knowledge base."
                )

        elif knowledge_base.permission == KnowledgeBasePermissionEnum.PARTIAL_TEAM:
            if not any(
                dp.knowledge_base_id == knowledge_base.id
                for dp in KnowledgeBasePermission.query.filter_by(
                    account_id=user.id
                ).all()
            ):
                raise NoPermissionError(
                    "You do not have permission to access this knowledge base."
                )


class KnowledgeBasePermissionService:

    @classmethod
    def get_knowledge_base_partial_member_list(cls, knowledge_base_id):
        user_list_query = (
            db.session.query(
                KnowledgeBasePermission.account_id,
            )
            .filter(KnowledgeBasePermission.knowledge_base_id == knowledge_base_id)
            .all()
        )

        user_list = []
        for user in user_list_query:
            user_list.append(user.account_id)

        return user_list

    @classmethod
    def update_partial_member_list(cls, tenant_id, knowledge_base_id, user_list):
        try:
            db.session.query(KnowledgeBasePermission).filter(
                KnowledgeBasePermission.knowledge_base_id == knowledge_base_id
            ).delete()
            permissions = []
            for user in user_list:
                permission = KnowledgeBasePermission(
                    tenant_id=tenant_id,
                    knowledge_base_id=knowledge_base_id,
                    account_id=user["user_id"],
                )
                permissions.append(permission)

            db.session.add_all(permissions)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise e

    @classmethod
    def check_permission(
        cls, user, knowledge_base, requested_permission, requested_partial_member_list
    ):
        if not user.is_dataset_editor:
            raise NoPermissionError(
                "User does not have permission to edit this knowledge base."
            )

        if (
            user.is_dataset_operator
            and knowledge_base.permission != requested_permission
        ):
            raise NoPermissionError(
                "Knowledge base operators cannot change the knowledge base permissions."
            )

        if user.is_dataset_operator and requested_permission == "partial_members":
            if not requested_partial_member_list:
                raise ValueError(
                    "Partial member list is required when setting to partial members."
                )

            local_member_list = cls.get_knowledge_base_partial_member_list(
                knowledge_base.id
            )
            request_member_list = [
                user["user_id"] for user in requested_partial_member_list
            ]
            if set(local_member_list) != set(request_member_list):
                raise ValueError(
                    "Knowledge base operators cannot change the knowledge base permissions."
                )

    @classmethod
    def clear_partial_member_list(cls, knowledge_base_id):
        try:
            db.session.query(KnowledgeBasePermission).filter(
                KnowledgeBasePermission.knowledge_base_id == knowledge_base_id
            ).delete()
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise e


class DocumentService:

    @staticmethod
    def save_documents(knowledge_base, args, user):
        documents = []
        data_source_type = args["data_source"]["type"]

        if data_source_type == "upload_file":
            file_ids = args["file_ids"]

            # 批量查询 UploadFile
            files = UploadFile.query.filter(
                UploadFile.tenant_id == knowledge_base.tenant_id,
                UploadFile.id.in_(file_ids),
            ).all()

            if len(files) != len(file_ids):
                raise FileNotExistsError()

            # 创建一个集合来存储所有文件的唯一标识
            file_identifiers = {
                (file.name, file.extension, file.size) for file in files
            }

            # 批量查询可能存在的 Document
            existing_documents = Document.query.filter(
                Document.knowledge_base_id == knowledge_base.id,
                Document.tenant_id == user.current_tenant_id,
                Document.source_type == "upload_file",
                Document.status == 0,
                db.tuple_(Document.name, Document.extension, Document.size).in_(
                    file_identifiers
                ),
            ).all()

            # 创建一个字典来快速查找已存在的 Document
            existing_doc_map = {
                (doc.name, doc.extension, doc.size): doc for doc in existing_documents
            }

            for file in files:
                file_key = (file.name, file.extension, file.size)
                if file_key in existing_doc_map:
                    doc = existing_doc_map[file_key]
                    doc.updated_at = datetime.datetime.now()
                    doc.parser_type = DocumentParserTypeEnum(args["parser_type"])
                    doc.parser_config = args["parser_config"]
                    doc.location = file.key
                    doc.upload_file_id = file.id
                    doc.parse_status = DocumentParseStatusEnum.PENDING
                    documents.append(doc)
                else:
                    new_doc = Document(
                        knowledge_base_id=knowledge_base.id,
                        tenant_id=user.current_tenant_id,
                        upload_file_id=file.id,
                        source_type="upload_file",
                        status=0,
                        name=file.name,
                        extension=file.extension,
                        size=file.size,
                        parser_type=DocumentParserTypeEnum(args["parser_type"]),
                        parser_config=args["parser_config"],
                        location=file.key,
                        parse_status=DocumentParseStatusEnum.PENDING,
                    )
                    db.session.add(new_doc)  # 直接添加到 session
                    documents.append(new_doc)

        try:
            db.session.commit()
            logger.info(f"Committed {len(documents)} documents to the database.")
        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to commit documents: {str(e)}")
            raise

        # 确保所有文档都有 ID
        documents_with_id = []
        for document in documents:
            if document.id is None:
                logger.error(f"Document still has no ID after commit: {document}")
                continue
            documents_with_id.append(document)

        # 初始化 RQ 队列
        queue = Queue(connection=Redis.from_url(syntellix_config.RQ_REDIS_URL))

        # 为每个文档发送 RQ 任务
        for document in documents_with_id:
            try:
                job = queue.enqueue(process_document_chunk, document.id)
                logger.info(
                    f"RQ task sent for document {document.id}. Job ID: {job.id}"
                )
            except Exception as e:
                logger.error(
                    f"Failed to send RQ task for document {document.id}: {str(e)}"
                )

        logger.info(f"All tasks sent. Returning {len(documents_with_id)} documents.")
        return documents_with_id, len(documents_with_id)

    @staticmethod
    def get_documents_progress(knowledge_base_id, file_ids):
        documents = Document.query.filter(
            Document.knowledge_base_id == knowledge_base_id,
            Document.upload_file_id.in_(file_ids),
        ).all()

        progress_data = []
        for doc in documents:
            progress_data.append(
                {
                    "id": doc.id,
                    "name": doc.name,
                    "progress": doc.progress,
                    "message": doc.progress_msg,
                    "process_begin_at": (
                        doc.process_begin_at.isoformat()
                        if doc.process_begin_at
                        else None
                    ),
                    "process_duation": doc.process_duation,
                    "parse_status": doc.parse_status,
                    "parser_type": doc.parser_type,
                    "parser_config": doc.parser_config,
                }
            )

        return progress_data
