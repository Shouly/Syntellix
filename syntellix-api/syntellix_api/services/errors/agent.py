from syntellix_api.services.errors.base import BaseServiceError


class AgentNameDuplicateError(BaseServiceError):
    pass

class KonwledgeBaseIdEmptyError(BaseServiceError):
    pass

class AgentNotFoundError(BaseServiceError):
    pass


