import enum
import json

from syntellix_api.extensions.ext_database import db
from flask_login import UserMixin


class AccountStatus(str, enum.Enum):
    PENDING = "pending"
    UNINITIALIZED = "uninitialized"
    ACTIVE = "active"
    BANNED = "banned"
    CLOSED = "closed"


class Account(UserMixin, db.Model):
    __tablename__ = "t_sys_account"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=True)
    password_salt = db.Column(db.String(255), nullable=True)
    avatar = db.Column(db.String(255))
    status = db.Column(db.String(16), nullable=False, server_default="active")
    last_login_at = db.Column(db.DateTime, nullable=True)
    last_login_ip = db.Column(db.String(255), nullable=True)
    initialized_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(
        db.DateTime, nullable=False, server_default=db.func.current_timestamp()
    )
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
    )

    @property
    def is_password_set(self):
        return self.password is not None

    @property
    def current_tenant(self):
        return self._current_tenant

    @current_tenant.setter
    def current_tenant(self, value: "Tenant"):
        tenant = value
        ta = TenantAccountJoin.query.filter_by(
            tenant_id=tenant.id, account_id=self.id
        ).first()
        if ta:
            tenant.current_role = ta.role
        else:
            tenant = None
        self._current_tenant = tenant

    @property
    def current_tenant_id(self):
        return self._current_tenant.id

    @current_tenant_id.setter
    def current_tenant_id(self, value: str):
        try:
            tenant_account_join = (
                db.session.query(Tenant, TenantAccountJoin)
                .filter(Tenant.id == value)
                .filter(TenantAccountJoin.tenant_id == Tenant.id)
                .filter(TenantAccountJoin.account_id == self.id)
                .one_or_none()
            )

            if tenant_account_join:
                tenant, ta = tenant_account_join
                tenant.current_role = ta.role
            else:
                tenant = None
        except:
            tenant = None

        self._current_tenant = tenant

    @property
    def current_role(self):
        return self._current_tenant.current_role

    def get_status(self) -> AccountStatus:
        status_str = self.status
        return AccountStatus(status_str)

    # check current_user.current_tenant.current_role in ['admin', 'owner']
    @property
    def is_admin_or_owner(self):
        return TenantAccountRole.is_privileged_role(self._current_tenant.current_role)

    @property
    def is_editor(self):
        return TenantAccountRole.is_editing_role(self._current_tenant.current_role)

    @property
    def is_dataset_editor(self):
        return TenantAccountRole.is_dataset_edit_role(self._current_tenant.current_role)

    @property
    def is_dataset_operator(self):
        return self._current_tenant.current_role == TenantAccountRole.DATASET_OPERATOR


class TenantStatus(str, enum.Enum):
    NORMAL = "normal"
    ARCHIVE = "archive"


class TenantAccountRole(str, enum.Enum):
    OWNER = "owner"
    ADMIN = "admin"
    EDITOR = "editor"
    NORMAL = "normal"
    DATASET_OPERATOR = "dataset_operator"

    @staticmethod
    def is_valid_role(role: str) -> bool:
        return role and role in {
            TenantAccountRole.OWNER,
            TenantAccountRole.ADMIN,
            TenantAccountRole.EDITOR,
            TenantAccountRole.NORMAL,
            TenantAccountRole.DATASET_OPERATOR,
        }

    @staticmethod
    def is_privileged_role(role: str) -> bool:
        return role and role in {TenantAccountRole.OWNER, TenantAccountRole.ADMIN}

    @staticmethod
    def is_non_owner_role(role: str) -> bool:
        return role and role in {
            TenantAccountRole.ADMIN,
            TenantAccountRole.EDITOR,
            TenantAccountRole.NORMAL,
            TenantAccountRole.DATASET_OPERATOR,
        }

    @staticmethod
    def is_editing_role(role: str) -> bool:
        return role and role in {
            TenantAccountRole.OWNER,
            TenantAccountRole.ADMIN,
            TenantAccountRole.EDITOR,
        }

    @staticmethod
    def is_dataset_edit_role(role: str) -> bool:
        return role and role in {
            TenantAccountRole.OWNER,
            TenantAccountRole.ADMIN,
            TenantAccountRole.EDITOR,
            TenantAccountRole.DATASET_OPERATOR,
        }


class Tenant(db.Model):
    __tablename__ = "t_sys_tenant"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False, unique=True)
    status = db.Column(db.String(16), nullable=False, server_default="normal")
    custom_config = db.Column(db.Text)
    created_at = db.Column(
        db.DateTime, nullable=False, server_default=db.func.current_timestamp()
    )
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
    )

    def get_accounts(self) -> list[Account]:
        return (
            db.session.query(Account)
            .filter(
                Account.id == TenantAccountJoin.account_id,
                TenantAccountJoin.tenant_id == self.id,
            )
            .all()
        )

    @property
    def custom_config_dict(self) -> dict:
        return json.loads(self.custom_config) if self.custom_config else {}

    @custom_config_dict.setter
    def custom_config_dict(self, value: dict):
        self.custom_config = json.dumps(value)


class TenantAccountJoinRole(enum.Enum):
    OWNER = "owner"
    ADMIN = "admin"
    NORMAL = "normal"
    DATASET_OPERATOR = "dataset_operator"


class TenantAccountJoin(db.Model):
    __tablename__ = "t_sys_tenant_account"
    __table_args__ = (
        db.Index("idx_tenant_id", "tenant_id"),
        db.Index("idx_account_id", "account_id"),
        db.UniqueConstraint("tenant_id", "account_id", name="uq_tenant_id_account_id"),
    )

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    tenant_id = db.Column(db.Integer, nullable=False)
    account_id = db.Column(db.Integer, nullable=False)
    current = db.Column(db.Boolean, nullable=False, server_default="0")
    role = db.Column(db.String(16), nullable=False, server_default="normal")
    invited_by = db.Column(db.Integer, nullable=True)
    created_at = db.Column(
        db.DateTime, nullable=False, server_default=db.func.current_timestamp()
    )
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
    )
