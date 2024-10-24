from syntellix_api.libs.exception import BaseHTTPException


class AlreadyInitError(BaseHTTPException):
    error_code = "already_setup"
    description = "系统已初始化，请刷新页面或返回首页"
    code = 403


class NotInitError(BaseHTTPException):
    error_code = "not_setup"
    description = "系统未初始化，请先进行初始化"
    code = 401


class NotInitValidateError(BaseHTTPException):
    error_code = "not_init_validated"
    description = "初始化验证未完成，请先进行初始化验证"
    code = 401


class InitValidateFailedError(BaseHTTPException):
    error_code = "init_validate_failed"
    description = "初始化验证失败，请检查密码并重试"
    code = 401


class AccountNotLinkTenantError(BaseHTTPException):
    error_code = "account_not_link_tenant"
    description = "账户未关联租户"
    code = 403


class AlreadyActivateError(BaseHTTPException):
    error_code = "already_activate"
    description = "激活码无效或账户已激活，请重新检查"
    code = 403


class AccountNameFormatError(BaseHTTPException):
    error_code = "account_name_format_error"
    description = "账户名必须为1到30个字符"
    code = 403


class CurrentPasswordIncorrectError(BaseHTTPException):
    error_code = "current_password_incorrect"
    description = "当前密码不正确"
    code = 403


class RepeatPasswordNotMatchError(BaseHTTPException):
    error_code = "repeat_password_not_match"
    description = "两次输入的密码不匹配"
    code = 403


class KnowledgeBaseNameDuplicateError(BaseHTTPException):
    error_code = "knowledge_base_name_duplicate"
    description = "知识库名称已存在"
    code = 403


class NoFileUploadedError(BaseHTTPException):
    error_code = "no_file_uploaded"
    description = "请上传文件"
    code = 400


class TooManyFilesError(BaseHTTPException):
    error_code = "too_many_files"
    description = "每次最多只能上传5个文件"
    code = 400


class FileTooLargeError(BaseHTTPException):
    error_code = "file_too_large"
    description = "文件大小超出限制. {message}"
    code = 413


class UnsupportedFileTypeError(BaseHTTPException):
    error_code = "unsupported_file_type"
    description = "文件类型不支持"
    code = 415


class AgentNameDuplicateError(BaseHTTPException):
    error_code = "agent_name_duplicate"
    description = "智能体名称已存在"
    code = 400


class KonwledgeBaseIdEmptyError(BaseHTTPException):
    error_code = "knowledge_base_id_empty"
    description = "知识库ID不能为空"
    code = 400


class AgentNotFoundError(BaseHTTPException):
    error_code = "agent_not_found"
    description = "智能体不存在"
    code = 400
