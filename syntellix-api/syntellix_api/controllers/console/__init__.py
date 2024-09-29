from flask import Blueprint
from syntellix_api.libs.external_api import ExternalApi

bp = Blueprint("console", __name__, url_prefix="/console/api")
api = ExternalApi(bp)

# Import other controllers
from . import account_api, login_api, sys_init_api
from .dataset import file_api, knowledge_base_api, knowledge_base_document_api
from .agent import agent_api
from .chat import chat_api