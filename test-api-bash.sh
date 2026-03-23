#!/usr/bin/env bash
# Hackathon Discovery API Test Script

BASE_URL="http://localhost:3000"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  HACKATHON DISCOVERY API TEST SUITE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 1: Health Check
echo "1️⃣  HEALTH CHECK"
echo "Endpoint: GET /health"
curl -s "$BASE_URL/health" | jq '.' || echo "❌ Failed to connect"
echo ""

# Test 2: Discovery - Python + AI
echo "2️⃣  DISCOVERY - Python Developer Interested in AI"
echo "Endpoint: POST /api/discover"
curl -s -X POST "$BASE_URL/api/discover" \
  -H "Content-Type: application/json" \
  -d '{
    "skills": ["python"],
    "interests": ["AI"],
    "availability_days": 5
  }' | jq '.data | {hackathons_found, matches, top_recommendation: .recommendations[0] | {name: .hackathon.name, prize: .hackathon.prize_pool, problem: .problem_context.problem_statement[0:100]}}' || echo "❌ Failed"
echo ""

# Test 3: Discovery - Multi-skill
echo "3️⃣  DISCOVERY - Full Stack Dev Interested in Web3"
echo "Endpoint: POST /api/discover"
curl -s -X POST "$BASE_URL/api/discover" \
  -H "Content-Type: application/json" \
  -d '{
    "skills": ["javascript", "python", "react"],
    "interests": ["Web3", "DeFi"],
    "availability_days": 10
  }' | jq '.data | {hackathons_found, matches, recommendations: (.recommendations | length)}' || echo "❌ Failed"
echo ""

# Test 4: Hackathons by Platform
echo "4️⃣  HACKATHONS BY PLATFORM - DevPost"
echo "Endpoint: GET /api/hackathons/devpost"
curl -s "$BASE_URL/api/hackathons/devpost" | jq '.data[0]' || echo "❌ Failed"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ API TEST COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
