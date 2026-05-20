import json
import urllib.request
import urllib.error

url = "http://localhost:8000/orchestrate"
payload = {
    "user_prompt": "I need a plumber to fix a leaking pipe in sector G-13 as soon as possible",
    "user_location": {
        "sector": "G-13",
        "city": "Islamabad"
    }
}

data = json.dumps(payload).encode("utf-8")
req = urllib.request.Request(
    url,
    data=data,
    headers={"Content-Type": "application/json"}
)

print("--- TESTING LIVE ORCHESTRATOR ENDPOINT ---")
try:
    print("Sending POST request to http://localhost:8000/orchestrate...")
    with urllib.request.urlopen(req) as response:
        res_body = response.read().decode("utf-8")
        res_json = json.loads(res_body)
        print("\n🟢 SUCCESS! Orchestrator endpoint returned HTTP 200.")
        print("\nWorkflow summary:")
        print(f"  Trade Detected: {res_json['intent']['service_type']}")
        print(f"  Sector:         {res_json['intent']['location']}")
        print(f"  Recommended:    {res_json['recommended']['name']} (Distance: {res_json['recommended']['distance_km']}km, Rating: {res_json['recommended']['rating']} stars)")
        print(f"  Booking ID:     {res_json['booking']['confirmation_id']}")
        print(f"  Reminder Time:  {res_json['followup']['reminder_at']}")
        print("\nTrace Steps:")
        for step in res_json['trace']['steps']:
            print(f"  - [{step['agent']}]: {step['summary']}")
except urllib.error.HTTPError as e:
    print(f"\n🔴 FAILED! HTTP Status: {e.code}")
    error_body = e.read().decode("utf-8")
    try:
        err_json = json.loads(error_body)
        print("Error details:")
        print(json.dumps(err_json, indent=2))
    except Exception:
        print("Raw Error Body:", error_body)
except Exception as e:
    print(f"\n🔴 SYSTEM ERROR: {e}")
