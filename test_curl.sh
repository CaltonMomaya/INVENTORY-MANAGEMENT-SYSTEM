#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

BASE_URL="http://localhost:5000"

echo -e "${BLUE}${NC}"
echo -e "${BLUE}   Inventory Management System Test${NC}"
echo -e "${BLUE}${NC}"

# Login
echo -e "\n${YELLOW}1. Logging in...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kanban.com","password":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('access_token', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗ Login failed${NC}"
    echo "$LOGIN_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ Login successful${NC}"
echo -e "Token: ${TOKEN:0:50}...\n"

# Test Categories
echo -e "${YELLOW}2. Testing GET /api/categories${NC}"
RESPONSE=$(curl -s -X GET $BASE_URL/api/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

if echo "$RESPONSE" | python3 -c "import sys, json; json.load(sys.stdin)" 2>/dev/null; then
    echo "$RESPONSE" | python3 -m json.tool
    echo -e "${GREEN}✓ Categories endpoint working${NC}\n"
else
    echo -e "${RED}✗ Failed: $RESPONSE${NC}\n"
fi

# Test Products
echo -e "${YELLOW}3. Testing GET /api/products${NC}"
RESPONSE=$(curl -s -X GET $BASE_URL/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

if echo "$RESPONSE" | python3 -c "import sys, json; json.load(sys.stdin)" 2>/dev/null; then
    PRODUCT_COUNT=$(echo "$RESPONSE" | python3 -c "import sys, json; print(len(json.load(sys.stdin).get('products', [])))")
    echo -e "${GREEN}✓ Found $PRODUCT_COUNT products${NC}\n"
else
    echo -e "${RED}✗ Failed: $RESPONSE${NC}\n"
fi

# Test Dashboard
echo -e "${YELLOW}4. Testing GET /api/transactions/dashboard${NC}"
RESPONSE=$(curl -s -X GET $BASE_URL/api/transactions/dashboard \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

if echo "$RESPONSE" | python3 -c "import sys, json; json.load(sys.stdin)" 2>/dev/null; then
    echo "$RESPONSE" | python3 -m json.tool
    echo -e "${GREEN}✓ Dashboard endpoint working${NC}\n"
else
    echo -e "${RED}✗ Failed: $RESPONSE${NC}\n"
fi

# Test Create Product
echo -e "${YELLOW}5. Testing POST /api/products (Create product)${NC}"
RESPONSE=$(curl -s -X POST $BASE_URL/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "sku": "TEST001",
    "description": "Test product",
    "quantity": 100,
    "price": 99.99,
    "cost": 75.50,
    "reorder_level": 20,
    "category_id": 1,
    "supplier_id": 1
  }')

if echo "$RESPONSE" | python3 -c "import sys, json; json.load(sys.stdin)" 2>/dev/null; then
    echo "$RESPONSE" | python3 -m json.tool
    echo -e "${GREEN}✓ Product created successfully${NC}\n"
else
    echo -e "${RED}✗ Failed: $RESPONSE${NC}\n"
fi

# Test Add Stock
echo -e "${YELLOW}6. Testing POST /api/transactions/in (Add stock)${NC}"
RESPONSE=$(curl -s -X POST $BASE_URL/api/transactions/in \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "quantity": 50,
    "reference": "PO-001",
    "notes": "New stock"
  }')

if echo "$RESPONSE" | python3 -c "import sys, json; json.load(sys.stdin)" 2>/dev/null; then
    echo "$RESPONSE" | python3 -m json.tool
    echo -e "${GREEN}✓ Stock added successfully${NC}\n"
else
    echo -e "${RED}✗ Failed: $RESPONSE${NC}\n"
fi

echo -e "${BLUE}${NC}"
echo -e "${GREEN}All tests completed! ${NC}"
echo -e "${BLUE}${NC}"
