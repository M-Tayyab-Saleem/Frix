import json
import urllib.request
import urllib.error

keys_to_test = [
    "AIzaSyC0a8_4R5kaMvEFCUVU5fxzC51Rg1dTUGw",
    "AIzaSyBMBzex9leCNAKczjqKyOj4cagvgTn2B_U"
]

model = "gemini-2.0-flash"

print("--- TESTING MULTIPLE GEMINI API KEYS ---")

for idx, api_key in enumerate(keys_to_test, 1):
    print(f"\n[{idx}] Testing Key: {api_key[:10]}...{api_key[-6:]}")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": "Hello"}
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
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            res_json = json.loads(res_body)
            print("  [SUCCESS] Key is fully working.")
            text = res_json.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            print(f"  Response text: \"{text.strip()}\"")
    except urllib.error.HTTPError as e:
        print(f"  [FAILED] HTTP Status: {e.code}")
        error_body = e.read().decode("utf-8")
        try:
            err_json = json.loads(error_body)
            msg = err_json.get("error", {}).get("message", "")
            status = err_json.get("error", {}).get("status", "")
            print(f"  Error Status: {status}")
            print(f"  Error Message: {msg.splitlines()[0] if msg else 'None'}")
        except Exception:
            print(f"  Raw Error: {error_body}")
    except Exception as e:
        print(f"  [SYSTEM ERROR]: {e}")
