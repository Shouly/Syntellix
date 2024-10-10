import numpy as np
from FlagEmbedding import FlagReranker
from syntellix_api.configs import syntellix_config
from syntellix_api.rag.utils.parser_utils import num_tokens_from_string, truncate


def sigmoid(x):
    return 1 / (1 + np.exp(-x))


class RerankModel:
    def __init__(self, model_name: str):
        self.model_name = model_name
        self.model = None

    def initialize_model(self):
        if self.model is None:
            self.model = FlagReranker(self.model_name)

    def similarity(self, query: str, texts: list):
        self.initialize_model()
        pairs = [(query, truncate(t, 2048)) for t in texts]
        token_count = 0
        for _, t in pairs:
            token_count += num_tokens_from_string(t)
        batch_size = 4096
        res = []
        for i in range(0, len(pairs), batch_size):
            scores = self.model.compute_score(
                pairs[i : i + batch_size], max_length=2048
            )
            scores = sigmoid(np.array(scores)).tolist()
            if isinstance(scores, float):
                res.append(scores)
            else:
                res.extend(scores)
        return np.array(res), token_count

    def similarity_batch(self, query: str, texts: list):
        self.initialize_model()
        pairs = [(query, t) for t in texts]
        return self.model.compute_score(pairs, normalize=True)


if __name__ == "__main__":
    model = RerankModel(model_name=syntellix_config.RERANK_MODEL_NAME)
    print(model.similarity("ssss", ["ssss", "sssss"]))
