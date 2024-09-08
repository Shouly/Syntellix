from syntellix_api.services.errors.base import BaseServiceError


class DatasetNameDuplicateError(BaseServiceError):
    pass


class DatasetInUseError(BaseServiceError):
    pass
