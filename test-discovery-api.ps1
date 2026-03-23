# Hackathon Discovery API Test Script
# Tests all endpoints with sample requests

$BASE_URL = "http://localhost:3000"
$HEADERS = @{
    "Content-Type" = "application/json"
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  HACKATHON DISCOVERY API TEST SUITE" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "1️⃣  HEALTH CHECK" -ForegroundColor Yellow
Write-Host "Endpoint: GET /health" -ForegroundColor Gray
# Test 1: Health Check
Write-Host "1️⃣  HEALTH CHECK" -ForegroundColor Yellow
Write-Host "Endpoint: GET /health" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/health" -Method GET
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Status: OK" -ForegroundColor Green
    Write-Host "   Response: $($data | ConvertTo-Json -Compress)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

# Test 2: Discovery - Python + AI
Write-Host "`n2️⃣  DISCOVERY - Python Developer Interested in AI" -ForegroundColor Yellow
Write-Host "Endpoint: POST /api/discover" -ForegroundColor Gray
$body = @{
    skills = @("python")
    interests = @("AI")
    availability_days = 5
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/discover" -Method POST -Headers $HEADERS -Body $body -ErrorAction Stop
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Found $($data.data.hackathons_found) hackathons" -ForegroundColor Green
    Write-Host "   Matched: $($data.data.matches) opportunities" -ForegroundColor Green
    Write-Host "`n   📌 TOP RECOMMENDATION:" -ForegroundColor Cyan
    $rec = $data.data.recommendations[0]
    Write-Host "   Name: $($rec.hackathon.name)" -ForegroundColor White
    Write-Host "   Prize: $($rec.hackathon.prize_pool)" -ForegroundColor White
    Write-Host "   Theme: $($rec.hackathon.theme)" -ForegroundColor White
    Write-Host "   Problem: $($rec.problem_context.problem_statement.Substring(0, 100))..." -ForegroundColor White
    Write-Host "   Impact: $($rec.problem_context.real_world_impact)" -ForegroundColor Green
    Write-Host "   Market: $($rec.problem_context.estimated_potential)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

# Test 3: Discovery - ML Engineer + Web3
Write-Host "`n3️⃣  DISCOVERY - ML Engineer Interested in Web3" -ForegroundColor Yellow
Write-Host "Endpoint: POST /api/discover" -ForegroundColor Gray
$body = @{
    skills = @("machine-learning", "javascript")
    interests = @("Web3", "DeFi")
    availability_days = 10
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/discover" -Method POST -Headers $HEADERS -Body $body -ErrorAction Stop
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Found $($data.data.hackathons_found) hackathons" -ForegroundColor Green
    Write-Host "   Matched: $($data.data.matches) opportunities" -ForegroundColor Green
    Write-Host "   Recommendations: $($data.data.recommendations.count)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

# Test 4: Hackathons by Platform
Write-Host "`n4️⃣  HACKATHONS BY PLATFORM - DevPost" -ForegroundColor Yellow
Write-Host "Endpoint: GET /api/hackathons/devpost" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/hackathons/devpost" -Method GET -ErrorAction Stop
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Found $($data.count) hackathons" -ForegroundColor Green
    Write-Host "   Source: $($data.source)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

# Test 5: Upcoming Hackathons
Write-Host "`n5️⃣  UPCOMING HACKATHONS" -ForegroundColor Yellow
Write-Host "Endpoint: GET /api/hackathons/upcoming" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/hackathons/upcoming" -Method GET -ErrorAction Stop
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Found $($data.count) upcoming events" -ForegroundColor Green
    $data.data | ForEach-Object {
        Write-Host "   • $($_.name) - $($_.prize_pool) prize" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ API TEST COMPLETE" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

Write-Host "📖 API Documentation:" -ForegroundColor Yellow
Write-Host "   • Full Discovery: POST /api/discover" -ForegroundColor Gray
Write-Host "   • By Platform: GET /api/hackathons/{platform}" -ForegroundColor Gray
Write-Host "   • Solutions: GET /api/solutions/{theme}" -ForegroundColor Gray
Write-Host "   • Users: POST /api/users" -ForegroundColor Gray
Write-Host "   • Submissions: POST /api/submissions" -ForegroundColor Gray
