import requests
import time

API_URL = "http://localhost:8000/api/v1/defects"

# Get a defect ID to update
# For simplicity, we just assume ID 1 exists, but let's fetch to be safe
response = requests.get(f"{API_URL}/map")
if response.status_code == 200 and len(response.json()) > 0:
    defect_id = response.json()[0]['id']
else:
    defect_id = 1 # fallback

print(f"Testing 10 sequential PATCH requests on defect {defect_id}...")

for i in range(10):
    status = "fixed" if i % 2 == 0 else "detected"
    payload = {
        "status": status,
        "severity": "low"
    }
    
    resp = requests.patch(f"{API_URL}/{defect_id}", json=payload)
    if resp.status_code == 200:
        print(f"Request {i+1}/10 successful -> {status}")
    else:
        print(f"Request {i+1}/10 failed: {resp.status_code} {resp.text}")
    
    time.sleep(0.1)

print("Load test complete.")
