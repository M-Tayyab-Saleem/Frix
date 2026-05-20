import os
import json
from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field

load_dotenv()

# We check if there's a Groq key in environment or if we should ask the user
api_key = os.getenv("OPENAI_API_KEY")
base_url = os.getenv("OPENAI_BASE_URL")

print("--- GROQ COMPATIBILITY TEST ---")
print(f"API KEY: {api_key[:10]}...{api_key[-6:] if api_key else ''}")
print(f"BASE URL: {base_url}")

if "groq" not in (base_url or "").lower():
    print("\n⚠️ WARNING: Your OPENAI_BASE_URL does not point to Groq!")
    print("Please set these variables in your backend/.env:")
    print("OPENAI_API_KEY=gsk_YOUR_GROQ_KEY")
    print("OPENAI_BASE_URL=https://api.groq.com/openai/v1")
    print("MODEL_NAME=llama-3.3-70b-versatile")
    print("SMALL_MODEL_NAME=llama-3.1-8b-instant")
    exit(1)

# Define a test schema similar to our ServiceIntent
class TestServiceIntent(BaseModel):
    service_type: str = Field(description="The normalized name of the service type")
    location: str = Field(description="The sector or area mentioned")
    confidence: float = Field(description="Confidence score between 0.0 and 1.0")

client = OpenAI(
    api_key=api_key,
    base_url=base_url
)

model = os.getenv("MODEL_NAME", "llama-3.3-70b-versatile")
print(f"\nTesting Structured Outputs on model: {model}...")

try:
    # Try calling the model with Pydantic structured output
    response = client.beta.chat.completions.parse(
        model=model,
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "I need a plumber in sector G-13"}
        ],
        response_format=TestServiceIntent
    )
    
    print("\n🟢 SUCCESS! Groq successfully handled Structured Outputs!")
    print("Structured Result:")
    parsed_res = response.choices[0].message.parsed
    print(f"  Service Type: {parsed_res.service_type}")
    print(f"  Location:     {parsed_res.location}")
    print(f"  Confidence:   {parsed_res.confidence}")
    
except Exception as e:
    print("\n🔴 FAILED! Groq failed to handle Structured Outputs.")
    print("Error details:")
    print(e)
    print("\n💡 Tip: Make sure you are using a model that supports structured JSON schemas, like 'llama-3.3-70b-versatile'.")
