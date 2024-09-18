import uuid
from typing import List, Optional

from pydantic import BaseModel, Field


class BaseNode(BaseModel):

    id_: str = Field(
        default_factory=lambda: str(uuid.uuid4()), description="Unique ID of the node."
    )
    content: str
    embedding: Optional[list[float]] = Field(
        default=None, description="Embedding of the node."
    )
    metadata: Optional[dict] = Field(default_factory=dict)

    def get_content(self) -> str:
        return self.content

    def get_metadata(self) -> dict:
        return self.metadata

    def set_content(self, value: str) -> None:
        self.content = value

    def set_metadata(self, value: dict) -> None:
        self.metadata = value

    def set_embedding(self, value: List[float]) -> None:
        self.embedding = value

    @property
    def node_id(self) -> str:
        return self.id_

    @node_id.setter
    def node_id(self, value: str) -> None:
        self.id_ = value

    def get_embedding(self) -> List[float]:
        if self.embedding is None:
            raise ValueError("embedding not set.")
        return self.embedding
