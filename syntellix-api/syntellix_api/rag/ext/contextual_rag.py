from syntellix_api.llm.llm_factory import LLMFactory

CONTEXTUAL_RAG_PROMPT = """
Given the following whole document:

<document>
{doc_content}
</document>

Here is the chunk we want to situate within the whole document:
<chunk>
{chunk_content}
</chunk>

Please give a short succinct context to situate this chunk within the overall document for the purposes of improving search retrieval of the chunk.
Answer only with the succinct context and nothing else.
"""


def situate_context(doc: str, chunk: str) -> str:
    response, _ = LLMFactory.get_deepseek_model().chat(
        system=None,
        history=[CONTEXTUAL_RAG_PROMPT.format(doc_content=doc, chunk_content=chunk)],
        gen_conf={"max_tokens": 1024, "temperature": 1.0},
    )
    print(response)
    return response
