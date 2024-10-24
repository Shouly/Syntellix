import datetime
import enum

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

    @staticmethod
    def gen_collection_name_by_id(knowledge_base_id: int) -> str:
        return f"Vector_index_{knowledge_base_id}_Node"

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
    __tablename__ = "t_sys_knowledge_base_permission"
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


class UploadFile(db.Model):
    __tablename__ = "t_sys_upload_file"
    __table_args__ = (db.Index("idx_upload_file_tenant_id", "tenant_id"),)

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    tenant_id = db.Column(db.Integer, nullable=False)
    storage_type = db.Column(db.String(255), nullable=False)
    key = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    size = db.Column(db.Integer, nullable=False)
    extension = db.Column(db.String(255), nullable=False)
    mime_type = db.Column(db.String(255), nullable=True)
    created_by_role = db.Column(
        db.String(255), nullable=False, server_default="account"
    )
    created_by = db.Column(db.Integer, nullable=False)
    created_at = db.Column(
        db.DateTime, nullable=False, server_default=db.func.current_timestamp()
    )
    used = db.Column(TINYINT(1), nullable=False, server_default="0")
    used_by = db.Column(db.Integer, nullable=True)
    used_at = db.Column(db.DateTime, nullable=True)
    hash = db.Column(db.String(255), nullable=True)
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
    )


class DocumentParserTypeEnum(str, enum.Enum):
    PRESENTATION = "presentation"
    LAWS = "laws"
    MANUAL = "manual"
    PAPER = "paper"
    RESUME = "resume"
    BOOK = "book"
    QA = "qa"
    TABLE = "table"
    NAIVE = "naive"
    PICTURE = "picture"
    ONE = "one"
    AUDIO = "audio"
    EMAIL = "email"
    KG = "knowledge_graph"


class DocumentParseStatusEnum(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class DocumentStatusEnum(str, enum.Enum):
    VALID = 0
    ARCHIVED = 1
    DELETED = 2


class Document(db.Model):
    __tablename__ = "t_sys_document"
    __table_args__ = (db.Index("idx_document_knowledge_base_id", "knowledge_base_id"),)

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    tenant_id = db.Column(db.Integer, nullable=False)
    knowledge_base_id = db.Column(db.Integer, nullable=False)
    upload_file_id = db.Column(db.Integer, nullable=False)
    parser_type = db.Column(
        db.Enum(DocumentParserTypeEnum),
        nullable=False,
        default=DocumentParserTypeEnum.NAIVE,
    )
    parser_config = db.Column(
        db.JSON, nullable=False, default={"pages": [[1, 1000000]]}
    )
    source_type = db.Column(
        db.String(128),
        nullable=False,
        default="local",
    )
    extension = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    size = db.Column(db.Integer, default=0)
    token_num = db.Column(db.Integer, default=0)
    chunk_num = db.Column(db.Integer, default=0)
    progress = db.Column(db.Float, default=0)
    progress_msg = db.Column(db.Text, nullable=True, default="")
    process_begin_at = db.Column(db.DateTime, nullable=True)
    process_duation = db.Column(db.Float, default=0)
    parse_status = db.Column(
        db.Enum(DocumentParseStatusEnum),
        nullable=False,
        default=DocumentParseStatusEnum.PENDING,
    )
    status = db.Column(
        TINYINT(1),
        nullable=False,
        default=DocumentStatusEnum.VALID.value,
    )
    created_at = db.Column(
        db.DateTime, nullable=False, server_default=db.func.current_timestamp()
    )
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
    )

    def update_parse_status(
        self,
        status: DocumentParseStatusEnum,
        progress: float = None,
        progress_msg: str = None,
    ):
        self.parse_status = status.value
        self.updated_at = datetime.datetime.now()

        if progress is not None:
            self.progress = progress

        if progress_msg is not None:
            self.progress_msg = progress_msg

        db.session.commit()
