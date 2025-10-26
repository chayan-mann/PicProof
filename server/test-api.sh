
# PicProof API Test Script
# This script tests basic endpoints to verify the backend is working

BASE_URL="http://localhost:8000/api"
TOKEN=""

echo "🧪 Testing PicProof API"
echo "======================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo -e "${BLUE}Test 1: Health Check${NC}"
HEALTH_RESPONSE=$(curl -s ${BASE_URL%/api}/health)
echo "Response: $HEALTH_RESPONSE"
echo ""

# Test 2: Register User
echo -e "${BLUE}Test 2: Register New User${NC}"
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser_'$(date +%s)'",
    "email": "test'$(date +%s)'@example.com",
    "password": "password123",
    "name": "Test User"
  }')

# Extract token from response
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -n "$TOKEN" ]; then
  echo -e "${GREEN}✓ Registration successful${NC}"
  echo "Token: ${TOKEN:0:20}..."
else
  echo -e "${RED}✗ Registration failed${NC}"
  echo "Response: $REGISTER_RESPONSE"
fi
echo ""

# Test 3: Get Current User
echo -e "${BLUE}Test 3: Get Current User${NC}"
if [ -n "$TOKEN" ]; then
  ME_RESPONSE=$(curl -s -X GET $BASE_URL/auth/me \
    -H "Authorization: Bearer $TOKEN")
  echo "Response: $ME_RESPONSE"
  echo -e "${GREEN}✓ Get user successful${NC}"
else
  echo -e "${RED}✗ Skipped (no token)${NC}"
fi
echo ""

# Test 4: Create Post
echo -e "${BLUE}Test 4: Create Post${NC}"
if [ -n "$TOKEN" ]; then
  POST_RESPONSE=$(curl -s -X POST $BASE_URL/posts \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "content": "This is a test post from API testing script!",
      "visibility": "public"
    }')
  
  POST_ID=$(echo $POST_RESPONSE | grep -o '"_id":"[^"]*' | sed 's/"_id":"//')
  
  if [ -n "$POST_ID" ]; then
    echo -e "${GREEN}✓ Post created successfully${NC}"
    echo "Post ID: $POST_ID"
  else
    echo -e "${RED}✗ Post creation failed${NC}"
    echo "Response: $POST_RESPONSE"
  fi
else
  echo -e "${RED}✗ Skipped (no token)${NC}"
fi
echo ""

# Test 5: Get Feed
echo -e "${BLUE}Test 5: Get Feed${NC}"
if [ -n "$TOKEN" ]; then
  FEED_RESPONSE=$(curl -s -X GET "$BASE_URL/posts/feed?page=1&limit=5" \
    -H "Authorization: Bearer $TOKEN")
  echo "Response: $FEED_RESPONSE"
  echo -e "${GREEN}✓ Feed retrieved${NC}"
else
  echo -e "${RED}✗ Skipped (no token)${NC}"
fi
echo ""

# Test 6: Search Users
echo -e "${BLUE}Test 6: Search Users${NC}"
SEARCH_RESPONSE=$(curl -s -X GET "$BASE_URL/users/search?q=test")
echo "Response: $SEARCH_RESPONSE"
echo -e "${GREEN}✓ Search completed${NC}"
echo ""

echo "======================="
echo -e "${GREEN}✓ Testing Complete!${NC}"
echo ""
echo "Saved token for future use:"
echo "export PICPROOF_TOKEN=\"$TOKEN\""
