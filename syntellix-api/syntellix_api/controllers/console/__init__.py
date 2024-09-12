from flask import Blueprint
from syntellix_api.libs.external_api import ExternalApi

bp = Blueprint("console", __name__, url_prefix="/console/api")
api = ExternalApi(bp)

# Import other controllers
from . import sys_init_api
from . import login_api
from . import account_api