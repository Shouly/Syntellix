from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData

MYSQL_INDEXES_NAMING_CONVENTION = {
    "ix": "idx_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s",
    "pk": "pk_%(table_name)s",
}

metadata = MetaData(naming_convention=MYSQL_INDEXES_NAMING_CONVENTION)
db = SQLAlchemy(metadata=metadata)


def init_app(app):
    db.init_app(app)
