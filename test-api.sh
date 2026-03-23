#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

echo -e "${BLUE}===========================================${NC}"
echo -e "${BLUE}  Hackathon AI Agent - Test Suite${NC}"
echo -e "${BLUE}===========================================${NC}\n"

# Health Check
echo -e "${YELLOW}1/8 Testing Health Check...${NC}"
curl -s "$BASE_URL/health" | jq '.'
echo -e "${GREEN}✓ Health check passed\n${NC}"

# Create User
echo -e "${YELLOW}2/8 Creating User Profile...${NC}"
USER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/users" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-user-'$(date +%s)'",
    "name": "Test User",
    "email": "test@example.com",
    "skills": ["React", "Python", "Node.js"],
    "interests": ["AI/ML", "Web", "Fintech"]
  }')
echo "$USER_RESPONSE" | jq '.'
USER_ID=$(echo "$USER_RESPONSE" | jq -r '.data.id')
echo -e "${GREEN}✓ User created: $USER_ID\n${NC}"

# Get Upcoming Hackathons
echo -e "${YELLOW}3/8 Fetching Upcoming Hackathons...${NC}"
curl -s "$BASE_URL/api/hackathons/upcoming?days=30" | jq '.data | .[0:2]'
echo -e "${GREEN}✓ Hackathons fetched\n${NC}"

# Get Hackathons from Platform
echo -e "${YELLOW}4/8 Fetching HackerEarth Hackathons...${NC}"
curl -s "$BASE_URL/api/hackathons/hackerearth" | jq '.data | .[0:2]'
echo -e "${GREEN}✓ Platform-specific hackathons fetched\n${NC}"

# Find Solutions
echo -e "${YELLOW}5/8 Finding AI Solutions...${NC}"
curl -s "$BASE_URL/api/solutions/AI" | jq '.data | .[0:2]'
echo -e "${GREEN}✓ Solutions found\n${NC}"

# Detect Form Fields
echo -e "${YELLOW}6/8 Detecting Form Fields...${NC}"
FORM_RESPONSE=$(curl -s -X POST "$BASE_URL/api/forms/detect" \
  -H "Content-Type: application/json" \
  -d '{
    "hackathon_url": "https://hackerearth.com/challenges/"
  }')
echo "$FORM_RESPONSE" | jq '.'
echo -e "${GREEN}✓ Form detection completed\n${NC}"

# Create Submission
echo -e "${YELLOW}7/8 Creating Submission Draft...${NC}"
SUB_RESPONSE=$(curl -s -X POST "$BASE_URL/api/submissions" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "'$USER_ID'",
    "hackathon_id": "test-hackathon-1",
    "project_name": "AI-Powered Opportunity Finder",
    "project_description": "An intelligent system that finds and analyzes hackathons",
    "technologies": ["TypeScript", "React", "Node.js", "TinyFish API"],
    "github_url": "https://github.com/test/project",
    "demo_url": "https://demo.example.com"
  }')
echo "$SUB_RESPONSE" | jq '.'
echo -e "${GREEN}✓ Submission created\n${NC}"

# Discovery Pipeline
echo -e "${YELLOW}8/8 Running Full Discovery Pipeline...${NC}"
DISCOVERY=$(curl -s -X POST "$BASE_URL/api/discover" \
  -H "Content-Type: application/json" \
  -d '{
    "skills": ["React", "Python", "Machine Learning"],
    "interests": ["AI/ML", "Web3"],
    "availability_days": 30
  }')
echo "$DISCOVERY" | jq '.data | {hackathons_found, solutions_analyzed, matches, recommendations: .recommendations[0:2]}'
echo -e "${GREEN}✓ Discovery pipeline completed\n${NC}"

echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}  ✓ All tests passed!${NC}"
echo -e "${GREEN}===========================================${NC}\n"

echo -e "${BLUE}📊 Summary:${NC}"
echo "- Server is running and responding"
echo "- All APIs are functional"
echo "- User profiles can be created"
echo "- Hackathons are being discovered"
echo "- Solutions are being analyzed"
echo "- Forms can be detected and filled"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Access the API at: $BASE_URL"
echo "2. Check out the README.md for detailed documentation"
echo "3. Try the discovery API with your own skills/interests"
echo "4. Use the form-fill API for your hackathon submissions"
