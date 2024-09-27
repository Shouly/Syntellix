from flask import request
from flask_login import current_user
from flask_restful import Resource, marshal_with
from syntellix_api.configs import syntellix_config
from syntellix_api.controllers.api_errors import (
    FileTooLargeError,
    NoFileUploadedError,
    TooManyFilesError,
    UnsupportedFileTypeError,
)
from syntellix_api.controllers.console import api
from syntellix_api.libs.login import login_required
from syntellix_api.response.file_response import file_fields, upload_config_fields
from syntellix_api.services.file_service import (
    UNSTRUCTURED_ALLOWED_EXTENSIONS,
    FileService,
)


class FileApi(Resource):

    @login_required
    @marshal_with(upload_config_fields)
    def get(self):
        file_size_limit = syntellix_config.UPLOAD_FILE_SIZE_LIMIT
        batch_count_limit = syntellix_config.UPLOAD_FILE_BATCH_LIMIT
        image_file_size_limit = syntellix_config.UPLOAD_IMAGE_FILE_SIZE_LIMIT
        return {
            "file_size_limit": file_size_limit,
            "batch_count_limit": batch_count_limit,
            "image_file_size_limit": image_file_size_limit,
        }, 200

    @login_required
    @marshal_with(file_fields)
    def post(self):
        # get file from request
        file = request.files["file"]

        # check file
        if "file" not in request.files:
            raise NoFileUploadedError()

        if len(request.files) > 1:
            raise TooManyFilesError()
        try:
            upload_file = FileService.upload_file(file, current_user)
        except FileTooLargeError as file_too_large_error:
            raise FileTooLargeError(file_too_large_error.description)
        except UnsupportedFileTypeError:
            raise UnsupportedFileTypeError()

        return upload_file, 201

    @login_required
    def delete(self, file_id):
        FileService.delete_file(file_id)
        return {"message": "File deleted successfully"}, 200


# class FilePreviewApi(Resource):
#     @login_required
#     def get(self, file_id):
#         file_id = str(file_id)
#         text = FileService.get_file_preview(file_id)
#         return {"content": text}


class FileSupportTypeApi(Resource):
    @login_required
    def get(self):
        allowed_extensions = UNSTRUCTURED_ALLOWED_EXTENSIONS
        return {"allowed_extensions": allowed_extensions}


api.add_resource(FileApi, "/files/upload", "/files/<int:file_id>")
api.add_resource(FileSupportTypeApi, "/files/support-type")
