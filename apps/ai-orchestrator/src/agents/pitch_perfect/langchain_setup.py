import os
from typing import Optional

from langchain_openai import ChatOpenAI


def get_llm(model: Optional[str] = None, temperature: float = 0.3) -> ChatOpenAI:
    """Return a LangChain ChatOpenAI configured for OpenRouter or OpenAI.

    Precedence:
    - If OPENROUTER_API_KEY exists, set OpenAI-compatible base to OpenRouter and use that key.
    - Else, use OPENAI_API_KEY with default OpenAI base.
    """
    api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("Set OPENROUTER_API_KEY or OPENAI_API_KEY in environment.")

    # Configure OpenRouter base if using its key
    if os.getenv("OPENROUTER_API_KEY"):
        os.environ.setdefault("OPENAI_API_BASE", "https://openrouter.ai/api/v1")

    selected_model = model or os.getenv("PITCHPERFECT_MODEL", "qwen/qwen3-30b-a3b-instruct-2507")

    llm = ChatOpenAI(
        model=selected_model,
        temperature=temperature,
        api_key=api_key,
    )
    return llm


