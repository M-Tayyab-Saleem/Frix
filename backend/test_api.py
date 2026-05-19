import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

print("API KEY:", os.getenv("OPENAI_API_KEY"))
print("BASE URL:", os.getenv("OPENAI_BASE_URL"))
print("MODEL NAME:", os.getenv("MODEL_NAME"))

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_BASE_URL")
)

try:
    response = client.chat.completions.create(
        model=os.getenv("MODEL_NAME", "gemini-2.0-flash"),
        messages=[{"role": "user", "content": "Hello, are you working?"}]
    )
    print("Success:", response.choices[0].message.content)
except Exception as e:
    print("Error:", e)
