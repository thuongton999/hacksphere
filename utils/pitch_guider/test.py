import os
from openai import OpenAI

# Prefer OPENROUTER_API_KEY; fallback to OPENAI_API_KEY
api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY")
if not api_key:
    raise RuntimeError("Missing OPENROUTER_API_KEY or OPENAI_API_KEY in environment.")

client = OpenAI(
    base_url=os.getenv("OPENAI_API_BASE", os.getenv("OPENAI_BASE_URL", "https://openrouter.ai/api/v1")),
    api_key=api_key,
)

completion = client.chat.completions.create(
    extra_headers={
        "HTTP-Referer": os.getenv("OPENROUTER_HTTP_REFERER", "http://localhost"),
        "X-Title": os.getenv("OPENROUTER_X_TITLE", "LocalTest"),
    },
    model=os.getenv("OPENROUTER_MODEL", "qwen/qwen3-30b-a3b-instruct-2507"),
    messages=[
        {"role": "user", "content": "What is the meaning of life?"}
    ],
)
print(completion.choices[0].message.content)