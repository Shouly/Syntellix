from sentence_transformers import SentenceTransformer
from syntellix_api.configs import syntellix_config
import torch

class EmbeddingModel:
    def __init__(self, model_name: str):
        # Initialize the model in the main process
        self.model_name = model_name
        self.model = None

    def initialize_model(self):
        # Initialize the model when needed
        if self.model is None:
            self.model = SentenceTransformer(self.model_name)

    def encode(self, sentences: list[str], normalize_embeddings: bool = True):
        self.initialize_model()
        return self.model.encode(
            sentences,
            normalize_embeddings=normalize_embeddings,
            show_progress_bar=True,
        )

# Set the number of threads for OpenMP
torch.set_num_threads(1)

if __name__ == "__main__":
    model = EmbeddingModel(model_name=syntellix_config.EMBEDDING_MODEL_NAME)
    print(model.encode("ssss"))
