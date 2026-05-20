import os
import json
import urllib.request
import urllib.error
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
model = os.getenv("MODEL_NAME", "gemini-2.0-flash")

print("--- DIRECT NATIVE GEMINI API TEST ---")
print(f"Using API Key: {api_key[:10]}...{api_key[-6:] if api_key else ''}")
print(f"Targeting Model: {model}")

if not api_key:
    print("Error: No API key found in your environment variables.")
    exit(1)

# Native Gemini REST API endpoint
url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

payload = {
    "contents": [
        {
            "parts": [
                {"text": "Hello! Please reply with 'Gemini is working successfully.' to confirm connection."}
            ]
        }
    ]
}

data = json.dumps(payload).encode("utf-8")
req = urllib.request.Request(
    url,
    data=data,
    headers={"Content-Type": "application/json"}
)

try:
    print("\nSending direct HTTP POST request to Google Gemini API...")
    with urllib.request.urlopen(req) as response:
        res_body = response.read().decode("utf-8")
        res_json = json.loads(res_body)
        print("\n[SUCCESS] Response received from Google!")
        print("Response Content:")
        print(json.dumps(res_json, indent=2))
except urllib.error.HTTPError as e:
    print(f"\n[HTTP ERROR] Status Code: {e.code}")
    error_body = e.read().decode("utf-8")
    try:
        err_json = json.loads(error_body)
        print("Error Details from Google's Servers:")
        print(json.dumps(err_json, indent=2))
    except Exception:
        print("Raw Error Body:", error_body)
except Exception as e:
    print("\n[SYSTEM ERROR] Could not complete request:", e)
