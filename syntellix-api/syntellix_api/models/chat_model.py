import enum

from sqlalchemy.dialects.mysql import JSON, LONGTEXT
from syntellix_api.extensions.ext_database import db


class ConversationMessageType(str, enum.Enum):
    USER = "user"
    AGENT = "agent"


class Conversation(db.Model):
    __tablename__ = "t_sys_conversation"
    __table_args__ = (
        db.Index("idx_user_id", "user_id"),
        db.Index("idx_agent_id", "agent_id"),
    )

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, nullable=False)
    agent_id = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String(255), nullable=False)
    is_pinned = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(
        db.DateTime, nullable=False, server_default=db.func.current_timestamp()
    )
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
    )


class ConversationMessage(db.Model):
    __tablename__ = "t_sys_conversation_message"
    __table_args__ = (
        db.Index("idx_conversation_id", "conversation_id"),
        db.Index("idx_user_id", "user_id"),
        db.Index("idx_agent_id", "agent_id"),
    )

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    agent_id = db.Column(db.Integer, nullable=False)
    conversation_id = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, nullable=False)
    message = db.Column(LONGTEXT, nullable=False)
    message_type = db.Column(
        db.Enum(ConversationMessageType),
        nullable=False,
        server_default=ConversationMessageType.USER.value,
    )
    pre_message_id = db.Column(db.Integer, nullable=True)
    citation = db.Column(JSON, nullable=True)
    created_at = db.Column(
        db.DateTime, nullable=False, server_default=db.func.current_timestamp()
    )
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "agent_id": self.agent_id,
            "conversation_id": self.conversation_id,
            "user_id": self.user_id,
            "message": self.message,
            "message_type": self.message_type.value,
            "pre_message_id": self.pre_message_id,
            "citation": self.citation,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
