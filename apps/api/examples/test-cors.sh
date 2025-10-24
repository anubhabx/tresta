#!/bin/bash

# CORS Test Script for Tresta API
# Tests that public widget endpoints allow cross-origin requests
# and protected endpoints remain restricted

echo "🧪 Testing Tresta API CORS Configuration"
echo "=========================================="
echo ""

API_URL="${API_URL:-http://localhost:8000}"
WIDGET_ID="${WIDGET_ID:-test-widget-id}"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Public Widget Endpoint (should allow any origin)
echo "Test 1: Public Widget Endpoint CORS"
echo "-----------------------------------"
echo "Testing: GET $API_URL/api/widgets/$WIDGET_ID/public"
echo "Expected: Access-Control-Allow-Origin: *"
echo ""

RESPONSE=$(curl -s -i -H "Origin: https://external-site.com" \
  "$API_URL/api/widgets/$WIDGET_ID/public" 2>&1)

if echo "$RESPONSE" | grep -q "Access-Control-Allow-Origin: \*"; then
  echo -e "${GREEN}✓ PASS${NC} - Public widget endpoint allows any origin"
else
  echo -e "${RED}✗ FAIL${NC} - Public widget endpoint does not allow cross-origin requests"
  echo "Response headers:"
  echo "$RESPONSE" | grep -i "access-control"
fi
echo ""

# Test 2: Preflight Request for Public Widget
echo "Test 2: Public Widget Preflight (OPTIONS)"
echo "-----------------------------------------"
echo "Testing: OPTIONS $API_URL/api/widgets/$WIDGET_ID/public"
echo "Expected: Access-Control-Allow-Origin: *"
echo ""

PREFLIGHT=$(curl -s -i -X OPTIONS \
  -H "Origin: https://external-site.com" \
  -H "Access-Control-Request-Method: GET" \
  "$API_URL/api/widgets/$WIDGET_ID/public" 2>&1)

if echo "$PREFLIGHT" | grep -q "Access-Control-Allow-Origin: \*"; then
  echo -e "${GREEN}✓ PASS${NC} - Preflight request successful"

  # Check for max-age header
  if echo "$PREFLIGHT" | grep -q "Access-Control-Max-Age"; then
    MAX_AGE=$(echo "$PREFLIGHT" | grep -i "Access-Control-Max-Age" | cut -d: -f2 | tr -d '[:space:]')
    echo -e "${GREEN}✓ PASS${NC} - Preflight cache enabled (max-age: $MAX_AGE seconds)"
  fi
else
  echo -e "${RED}✗ FAIL${NC} - Preflight request blocked"
  echo "Response headers:"
  echo "$PREFLIGHT" | grep -i "access-control"
fi
echo ""

# Test 3: Protected Widget Management Endpoint (should restrict origin)
echo "Test 3: Protected Widget Management CORS"
echo "----------------------------------------"
echo "Testing: POST $API_URL/api/widgets"
echo "Expected: Origin restricted to FRONTEND_URL only"
echo ""

PROTECTED=$(curl -s -i -X OPTIONS \
  -H "Origin: https://malicious-site.com" \
  -H "Access-Control-Request-Method: POST" \
  "$API_URL/api/widgets" 2>&1)

if echo "$PROTECTED" | grep -q "Access-Control-Allow-Origin: https://malicious-site.com"; then
  echo -e "${RED}✗ FAIL${NC} - Protected endpoint allows unauthorized origin!"
  echo "⚠️  SECURITY ISSUE: Protected endpoint should not allow arbitrary origins"
elif echo "$PROTECTED" | grep -q "Access-Control-Allow-Origin"; then
  ALLOWED_ORIGIN=$(echo "$PROTECTED" | grep "Access-Control-Allow-Origin" | cut -d: -f2- | tr -d '[:space:]')
  echo -e "${GREEN}✓ PASS${NC} - Protected endpoint restricts origin to: $ALLOWED_ORIGIN"
else
  echo -e "${GREEN}✓ PASS${NC} - Protected endpoint blocks unauthorized origin (no CORS header)"
fi
echo ""

# Test 4: Public Project Endpoint
echo "Test 4: Public Project Endpoint CORS"
echo "------------------------------------"
echo "Testing: GET $API_URL/api/public/projects/test-slug"
echo "Expected: Access-Control-Allow-Origin: *"
echo ""

PUBLIC_PROJECT=$(curl -s -i -H "Origin: https://external-site.com" \
  "$API_URL/api/public/projects/test-slug" 2>&1)

if echo "$PUBLIC_PROJECT" | grep -q "Access-Control-Allow-Origin: \*"; then
  echo -e "${GREEN}✓ PASS${NC} - Public project endpoint allows any origin"
else
  echo -e "${RED}✗ FAIL${NC} - Public project endpoint does not allow cross-origin requests"
  echo "Response headers:"
  echo "$PUBLIC_PROJECT" | grep -i "access-control"
fi
echo ""

# Test 5: Verify Credentials Not Allowed on Public Endpoints
echo "Test 5: Public Endpoints - Credentials Check"
echo "--------------------------------------------"
echo "Expected: Public endpoints should NOT allow credentials"
echo ""

if echo "$RESPONSE" | grep -q "Access-Control-Allow-Credentials: true"; then
  echo -e "${RED}✗ FAIL${NC} - Public endpoint allows credentials (security risk!)"
  echo "⚠️  SECURITY ISSUE: Public endpoints should not support credentials"
else
  echo -e "${GREEN}✓ PASS${NC} - Public endpoint correctly disallows credentials"
fi
echo ""

# Summary
echo "=========================================="
echo "📊 CORS Test Summary"
echo "=========================================="
echo ""
echo "Configuration Requirements:"
echo "  • Public widget endpoints: Allow ANY origin (*)"
echo "  • Protected endpoints: Restrict to FRONTEND_URL only"
echo "  • Public endpoints: No credentials support"
echo "  • Preflight caching: 24 hours (86400 seconds)"
echo ""
echo "To run this script:"
echo "  ./test-cors.sh"
echo ""
echo "To test with custom parameters:"
echo "  API_URL=http://localhost:8000 WIDGET_ID=clxyz123 ./test-cors.sh"
echo ""
echo "Note: Some tests may fail if:"
echo "  • API server is not running"
echo "  • Widget ID does not exist"
echo "  • Database is not initialized"
echo ""
echo "For a successful test, focus on the CORS headers presence,"
echo "not the HTTP status codes (404 is OK if data doesn't exist)."
