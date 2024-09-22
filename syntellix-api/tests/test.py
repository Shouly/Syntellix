from sentence_transformers import SentenceTransformer
from syntellix_api.rag.llm.embedding_model import DefaultEmbedding

model = DefaultEmbedding(key="test", model_name="moka-ai/m3e-base")
print(model.encode(["hello world"]))
