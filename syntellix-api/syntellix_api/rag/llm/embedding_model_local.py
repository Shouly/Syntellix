from sentence_transformers import SentenceTransformer
from syntellix_api.configs import syntellix_config


class EmbeddingModel:
    def __init__(self, model_name: str):
        self.model = SentenceTransformer(model_name)

    def encode(self, sentences: list[str], normalize_embeddings: bool = True):
        return self.model.encode(
            sentences,
            normalize_embeddings=normalize_embeddings,
            show_progress_bar=True,
        )


if __name__ == "__main__":
    model = EmbeddingModel(model_name=syntellix_config.EMBEDDING_MODEL_NAME)
    print(model.encode("ssss"))
