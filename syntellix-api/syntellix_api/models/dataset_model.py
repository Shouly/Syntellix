import enum
import json

from sqlalchemy import func
from sqlalchemy.dialects.mysql import JSON, TINYINT
from syntellix_api.configs import syntellix_config
from syntellix_api.extensions.ext_database import db
from syntellix_api.extensions.ext_storage import storage

from .account_model import Account


class KnowledgeBasePermissionEnum(str, enum.Enum):
    ONLY_ME = "only_me"
    ALL_TEAM = "all_team_members"
    PARTIAL_TEAM = "partial_members"


class KnowledgeBaseDataSourceType(str, enum.Enum):
    UPLOAD_FILE = "upload_file"
    WECHAT_FILE = "wechat_file"
    DINGTALK_FILE = "dingtalk_file"
    FEISHU_FILE = "feishu_file"


class KnowledgeBaseStatus(str, enum.Enum):
    VALID = 0
    WASTED = 1


class KnowledgeBase(db.Model):
    __tablename__ = "t_sys_knowledge_base"
    __table_args__ = (
        db.Index("idx_knowledge_base_tenant_id", "tenant_id"),
        db.Index("idx_knowledge_base_status", "status"),
    )

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    tenant_id = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String(255), nullable=False)
    avatar = db.Column(db.String(255), nullable=True)
    description = db.Column(db.Text, nullable=True)
    permission = db.Column(
        db.Enum(KnowledgeBasePermissionEnum),
        nullable=False,
        server_default=KnowledgeBasePermissionEnum.ONLY_ME.value,
    )
    data_source_type = db.Column(
        db.Enum(KnowledgeBaseDataSourceType),
        nullable=False,
        server_default=KnowledgeBaseDataSourceType.UPLOAD_FILE.value,
    )
    status = db.Column(
        TINYINT(1),
        nullable=False,
        default=KnowledgeBaseStatus.VALID.value,
    )
    created_by = db.Column(db.Integer, nullable=False)
    created_at = db.Column(
        db.DateTime, nullable=False, server_default=db.func.current_timestamp()
    )
    updated_by = db.Column(db.Integer, nullable=True)
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
    )

    @property
    def created_by_account(self):
        return db.session.get(Account, self.created_by)

    # @property
    # def app_count(self):
    #     return (
    #         db.session.query(func.count(AppDatasetJoin.id))
    #         .filter(
    #             AppDatasetJoin.dataset_id == self.id, App.id == AppDatasetJoin.app_id
    #         )
    #         .scalar()
    #     )

    # @property
    # def document_count(self):
    #     return (
    #         db.session.query(func.count(Document.id))
    #         .filter(Document.dataset_id == self.id)
    #         .scalar()
    #     )

    # @property
    # def available_document_count(self):
    #     return (
    #         db.session.query(func.count(Document.id))
    #         .filter(
    #             Document.dataset_id == self.id,
    #             Document.indexing_status == "completed",
    #             Document.enabled == True,
    #             Document.archived == False,
    #         )
    #         .scalar()
    #     )

    # @property
    # def available_segment_count(self):
    #     return (
    #         db.session.query(func.count(DocumentSegment.id))
    #         .filter(
    #             DocumentSegment.dataset_id == self.id,
    #             DocumentSegment.status == "completed",
    #             DocumentSegment.enabled == True,
    #         )
    #         .scalar()
    #     )

    # @property
    # def word_count(self):
    #     return (
    #         Document.query.with_entities(func.coalesce(func.sum(Document.word_count)))
    #         .filter(Document.dataset_id == self.id)
    #         .scalar()
    #     )

    # @property
    # def doc_form(self):
    #     document = (
    #         db.session.query(Document).filter(Document.dataset_id == self.id).first()
    #     )
    #     if document:
    #         return document.doc_form
    #     return None

    # # @property
    # def tags(self):
    #     tags = (
    #         db.session.query(Tag)
    #         .join(TagBinding, Tag.id == TagBinding.tag_id)
    #         .filter(
    #             TagBinding.target_id == self.id,
    #             TagBinding.tenant_id == self.tenant_id,
    #             Tag.tenant_id == self.tenant_id,
    #             Tag.type == "knowledge",
    #         )
    #         .all()
    #     )

    #     return tags if tags else []


class KnowledgeBasePermission(db.Model):
    __tablename__ = "t_sys_knowledge_base_permissions"
    __table_args__ = (
        db.Index(
            "idx_knowledge_base_permissions_knowledge_base_id", "knowledge_base_id"
        ),
        db.Index("idx_knowledge_base_permissions_account_id", "account_id"),
        db.Index("idx_knowledge_base_permissions_tenant_id", "tenant_id"),
    )

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    knowledge_base_id = db.Column(db.Integer, nullable=False)
    account_id = db.Column(db.Integer, nullable=False)
    tenant_id = db.Column(db.Integer, nullable=False)
    has_permission = db.Column(TINYINT(1), nullable=False, server_default="0")
    created_at = db.Column(
        db.DateTime, nullable=False, server_default=db.func.current_timestamp()
    )
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
    )
