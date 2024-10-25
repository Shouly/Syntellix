from syntellix_api.llm.llm_factory import LLMFactory

MAX_DOC_TOKENS = 96000  # DeepSeek上下文窗口128k，预留32k用于输出和其他内容
MAX_OUTPUT_TOKENS = 4096  # DeepSeek最大输出长度

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
Please write your response in Chinese (Simplified Chinese).
Answer only with the succinct context and nothing else.
"""


def truncate_text(text: str, max_tokens: int = MAX_DOC_TOKENS) -> str:
    """
    智能截断文本，保持开头和结尾的内容，去除中间部分

    Args:
        text: 需要截断的文本
        max_tokens: 最大允许的token数量，默认96k
    """
    # 估算token数量
    # 英文字符约0.3个token，中文字符约0.6个token
    en_chars = sum(1 for c in text if ord(c) < 128)  # ASCII字符数
    zh_chars = len(text) - en_chars  # 非ASCII字符数（假设为中文）

    estimated_tokens = en_chars * 0.3 + zh_chars * 0.6

    if estimated_tokens <= max_tokens:
        return text

    # 计算需要保留的字符数
    # 反向计算：要保留的token数 = max_tokens * 0.45（前后各45%）
    # 假设中英文字符比例在截取后保持不变
    total_chars = len(text)
    en_ratio = en_chars / total_chars
    zh_ratio = zh_chars / total_chars

    # 计算每个token对应的平均字符数
    chars_per_token = 1 / (en_ratio * 0.3 + zh_ratio * 0.6)
    keep_chars = int(max_tokens * 0.45 * chars_per_token)  # 前后各保留45%

    return f"{text[:keep_chars]}\n[...省略中间内容...]\n{text[-keep_chars:]}"


def clean_text(text: str) -> str:
    """
    清理文本中的特殊字符
    """
    # 替换连续的空格字符（包括 \u00a0）为单个普通空格
    import re

    text = re.sub(r"[\s\u00a0]+", " ", text)
    # 清理其他可能导致问题的不可见字符
    text = "".join(char for char in text if char.isprintable() or char in ["\n", "\t"])
    return text.strip()


def situate_context(doc: str, chunk: str) -> str:
    """
    在文档上下文中定位特定文本块的位置
    """
    # 清理输入文本
    doc = clean_text(doc)
    chunk = clean_text(chunk)

    # 截断过长的文档
    truncated_doc = truncate_text(doc)
    model = LLMFactory.get_deepseek_model()
    response, _ = model.chat(
        system=None,
        history=[
            model.user_message(
                CONTEXTUAL_RAG_PROMPT.format(
                    doc_content=truncated_doc, chunk_content=chunk
                )
            )
        ],
        gen_conf={
            "max_tokens": MAX_OUTPUT_TOKENS,
            "temperature": 0.7,
        },
    )
    print(f"Context generated for chunk: {response}")
    return response
