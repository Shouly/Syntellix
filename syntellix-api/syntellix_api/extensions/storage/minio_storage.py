"""MinIO storage implementation."""

from io import BytesIO
from typing import Generator

from flask import Flask
from minio import Minio
from minio.error import S3Error

from .base_storage import BaseStorage


class MinioStorage(BaseStorage):
    """MinIO storage implementation."""

    def __init__(self, app: Flask):
        super().__init__(app)

        try:
            self.client = Minio(
                endpoint=app.config["MINIO_ENDPOINT"],
                access_key=app.config["MINIO_ACCESS_KEY"],
                secret_key=app.config["MINIO_SECRET_KEY"],
                secure=app.config["MINIO_SECURE"],
            )
        except ValueError as e:
            app.logger.error(f"Error initializing MinIO client: {e}")
            raise

        self.bucket_name = app.config["MINIO_BUCKET_NAME"]

        # Ensure the bucket exists
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self):
        try:
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
                self.app.logger.info(
                    f"Bucket '{self.bucket_name}' created successfully"
                )
        except S3Error as e:
            self.app.logger.error(f"Error checking/creating bucket: {e}")
            raise

    def save(self, filename: str, data: bytes):
        try:
            self._ensure_bucket_exists()
            self.client.put_object(self.bucket_name, filename, BytesIO(data), len(data))
        except S3Error as e:
            self.app.logger.error(f"Error saving file to MinIO: {e}")
            raise

    def load_once(self, filename: str) -> bytes:
        try:
            response = self.client.get_object(self.bucket_name, filename)
            return response.read()
        except S3Error as e:
            self.app.logger.error(f"Error loading file from MinIO: {e}")
            raise

    def load_stream(self, filename: str) -> Generator:
        try:
            response = self.client.get_object(self.bucket_name, filename)
            for data in response.stream(32 * 1024):
                yield data
        except S3Error as e:
            self.app.logger.error(f"Error streaming file from MinIO: {e}")
            raise

    def download(self, filename: str, target_filepath: str):
        try:
            self.client.fget_object(self.bucket_name, filename, target_filepath)
        except S3Error as e:
            self.app.logger.error(f"Error downloading file from MinIO: {e}")
            raise

    def exists(self, filename: str) -> bool:
        try:
            self.client.stat_object(self.bucket_name, filename)
            return True
        except S3Error as e:
            if e.code == "NoSuchKey":
                return False
            self.app.logger.error(f"Error checking file existence in MinIO: {e}")
            raise

    def delete(self, filename: str):
        try:
            self.client.remove_object(self.bucket_name, filename)
        except S3Error as e:
            self.app.logger.error(f"Error deleting file from MinIO: {e}")
            raise
    
    def get_url(self, filename):
        return f"{self.app.config['MINIO_ENDPOINT']}/{self.bucket_name}/{filename}"
