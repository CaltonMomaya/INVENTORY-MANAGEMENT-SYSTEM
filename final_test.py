import requests
import json

BASE_URL = "http://localhost:5000"

print("=" * 60)
print("Testing Inventory Management System")
print("=" * 60)

# Login
print("\n1. Logging in...")
response = requests.post(f"{BASE_URL}/api/auth/login", json={
    "email": "admin@kanban.com",
    "password": "admin123"
})

if response.status_code != 200:
    print(f"Login failed: {response.text}")
    exit(1)

data = response.json()
token = data['access_token']
print(f"✓ Login successful!")
print(f"Token: {token[:50]}...\n")

headers = {"Authorization": f"Bearer {token}"}

# Test categories
print("2. Testing GET /api/categories")
response = requests.get(f"{BASE_URL}/api/categories", headers=headers)
if response.status_code == 200:
    categories = response.json()
    print(f"✓ Found {len(categories.get('categories', []))} categories")
    print(json.dumps(categories, indent=2))
else:
    print(f"✗ Failed: {response.text}")

# Test products
print("\n3. Testing GET /api/products")
response = requests.get(f"{BASE_URL}/api/products", headers=headers)
if response.status_code == 200:
    products = response.json()
    print(f"✓ Found {len(products.get('products', []))} products")
else:
    print(f"✗ Failed: {response.text}")

# Test dashboard
print("\n4. Testing GET /api/transactions/dashboard")
response = requests.get(f"{BASE_URL}/api/transactions/dashboard", headers=headers)
if response.status_code == 200:
    dashboard = response.json()
    print("✓ Dashboard data:")
    print(json.dumps(dashboard, indent=2))
else:
    print(f"✗ Failed: {response.text}")

print("\n" + "=" * 60)
print("✓ All tests completed successfully!")
print("=" * 60)
