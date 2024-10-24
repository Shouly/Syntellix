from collections.abc import Generator
from typing import Union

from syntellix_api.extensions.storage.aliyun_storage import AliyunStorage
from syntellix_api.extensions.storage.local_storage import LocalStorage
from syntellix_api.extensions.storage.minio_storage import MinioStorage
from flask import Flask


class Storage:
    def __init__(self):
        self.storage_runner = None

    def init_app(self, app: Flask):
        storage_type = app.config.get("STORAGE_TYPE")
        if storage_type == "aliyun-oss":
            self.storage_runner = AliyunStorage(app=app)
        elif storage_type == "minio":
            self.storage_runner = MinioStorage(app=app)
        else:
            self.storage_runner = LocalStorage(app=app)

    def save(self, filename, data):
        self.storage_runner.save(filename, data)

    def load(self, filename: str, stream: bool = False) -> Union[bytes, Generator]:
        if stream:
            return self.load_stream(filename)
        else:
            return self.load_once(filename)

    def load_once(self, filename: str) -> bytes:
        return self.storage_runner.load_once(filename)

    def load_stream(self, filename: str) -> Generator:
        return self.storage_runner.load_stream(filename)

    def download(self, filename, target_filepath):
        self.storage_runner.download(filename, target_filepath)

    def exists(self, filename):
        return self.storage_runner.exists(filename)

    def delete(self, filename):
        return self.storage_runner.delete(filename)

    def get_url(self, filename):
        return self.storage_runner.get_url(filename)

    def load_text(self, filename: str, encoding: str = None) -> str:
        return self.storage_runner.load_text(filename, encoding)


storage = Storage()


def init_app(app: Flask):
    storage.init_app(app)
