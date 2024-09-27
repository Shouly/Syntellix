from sqlalchemy.dialects.mysql import JSON
from syntellix_api.extensions.ext_database import db


class Agent(db.Model):
    __tablename__ = "t_sys_agent"
    __table_args__ = (
        db.Index("idx_agent_tenant_id", "tenant_id"),
    )

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    tenant_id = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String(255), nullable=False)
    avatar = db.Column(db.String(255), nullable=True)
    description = db.Column(db.Text, nullable=True)
    greeting_message = db.Column(db.Text, nullable=True)
    show_citation = db.Column(db.Boolean, nullable=False, default=True)
    empty_response = db.Column(db.Text, nullable=True)
    advanced_config = db.Column(JSON, nullable=True)
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


class AgentKnowledgeBase(db.Model):
    __tablename__ = "t_sys_agent_knowledge_base"
    __table_args__ = (
        db.Index("idx_agent_id", "agent_id"),
        db.Index("idx_knowledge_base_id", "knowledge_base_id"),
    )

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    agent_id = db.Column(db.Integer, nullable=False)
    knowledge_base_id = db.Column(db.Integer, nullable=False)
    created_at = db.Column(
        db.DateTime, nullable=False, server_default=db.func.current_timestamp()
    )
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
    )
