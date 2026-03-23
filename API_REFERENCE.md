# 📚 API Reference

## Base URL
```
http://localhost:3000
```

---

## Health & Status

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## Discovery

### Full Discovery Pipeline ⭐
```http
POST /api/discover
Content-Type: application/json

{
  "skills": ["React", "Python", "Machine Learning"],
  "interests": ["AI/ML", "FinTech", "Web3"],
  "availability_days": 30
}
```

**Parameters:**
- `skills` (array, optional): Your technical skills
- `interests` (array, optional): Problem domains you care about
- `availability_days` (number, default: 30): How many days available

**Response Success:**
```json
{
  "success": true,
  "data": {
    "hackathons_found": 45,
    "solutions_analyzed": 28,
    "matches": 12,
    "recommendations": [
      {
        "rank": 1,
        "hackathon": {
          "name": "TechCrunch Disrupt Hackathon",
          "url": "https://...",
          "deadline": "2024-03-31",
          "prize_pool": "$100,000",
          "theme": "AI/Tech Innovation"
        },
        "recommendation_reason": "Matches 3/3 interests and 4/5 skills",
        "suggested_tech_stack": ["React", "Python", "TensorFlow"],
        "similar_winning_solutions": [
          {
            "title": "Previous Winner Title",
            "technologies": ["React", "Python"],
            "github_url": "https://github.com/..."
          }
        ],
        "next_action": "Review winning solutions, prepare draft, fill submission form"
      }
    ]
  }
}
```

---

## Hackathons

### Get Hackathons by Platform
```http
GET /api/hackathons/:platform
```

**URL Parameters:**
- `platform`: `hackerearth`, `devpost`, or `mlh`

**Query Parameters:**
- (none)

**Response:**
```json
{
  "success": true,
  "source": "cached",
  "count": 15,
  "data": [
    {
      "id": "hackerearth-url-hash",
      "name": "AI Innovators Challenge",
      "platform": "hackerearth",
      "url": "https://www.hackerearth.com/challenges/...",
      "deadline": "2024-02-28",
      "prize_pool": "$25,000",
      "description": "Build innovative AI solutions...",
      "theme": "Artificial Intelligence",
      "difficulty": "intermediate"
    }
  ]
}
```

**Status Codes:**
- `200`: Success (data retrieved or cached)
- `500`: Error during scraping

---

### Get Upcoming Hackathons
```http
GET /api/hackathons/upcoming?days=30
```

**Query Parameters:**
- `days` (number, default: 30): Days until deadline to include

**Response:**
```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "id": "...",
      "name": "...",
      "deadline": "2024-02-15",
      ...
    }
  ]
}
```

**Sorting:** By deadline (ascending)

---

## Solutions

### Find Solutions by Theme
```http
GET /api/solutions/:theme
```

**URL Parameters:**
- `theme`: AI, blockchain, climate, fintech, web, etc.

**Response:**
```json
{
  "success": true,
  "source": "scraped",
  "count": 12,
  "data": [
    {
      "id": "theme-title-timestamp",
      "title": "Winning Project Name",
      "theme": "AI",
      "author": "Team Name",
      "team": "Alice, Bob, Charlie",
      "prize": "1st Place - $10,000",
      "description": "This project uses machine learning to...",
      "technologies": ["Python", "TensorFlow", "React"],
      "github_url": "https://github.com/team/project",
      "demo_url": "https://demo.example.com",
      "votes": 250,
      "rating": 4.8,
      "year": "2024"
    }
  ]
}
```

---

## Users

### Create or Update User
```http
POST /api/users
Content-Type: application/json

{
  "id": "user-123",
  "name": "John Doe",
  "email": "john@example.com",
  "skills": ["React", "TypeScript", "Node.js"],
  "interests": ["AI/ML", "Web3", "FinTech"]
}
```

**Parameters:**
- `id` (string, required): Unique user identifier
- `name` (string, required): User's name
- `email` (string, optional): Email address
- `skills` (array, required): List of skills
- `interests` (array, required): Problem domain interests

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "name": "John Doe",
    "email": "john@example.com",
    "skills": ["React", "TypeScript", "Node.js"],
    "interests": ["AI/ML", "Web3", "FinTech"],
    "created_at": "2024-01-01T12:00:00.000Z"
  }
}
```

---

## Submissions

### Create Submission
```http
POST /api/submissions
Content-Type: application/json

{
  "user_id": "user-123",
  "hackathon_id": "hackerearth-123",
  "project_name": "AI Chat Assistant",
  "project_description": "An intelligent chatbot powered by GPT-4 and fine-tuned on domain data",
  "technologies": ["Python", "FastAPI", "React", "PostgreSQL"],
  "github_url": "https://github.com/user/ai-chatbot",
  "demo_url": "https://ai-chatbot.example.com"
}
```

**Parameters:**
- `user_id` (string, required): User's ID
- `hackathon_id` (string, required): Hackathon ID
- `project_name` (string, required): Project title
- `project_description` (string, required): Project overview
- `technologies` (array, required): Tech stack
- `github_url` (string, optional): GitHub repository
- `demo_url` (string, optional): Live demo URL

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "sub-1704110400000",
    "user_id": "user-123",
    "hackathon_id": "hackerearth-123",
    "status": "draft",
    "project_name": "AI Chat Assistant",
    "project_description": "...",
    "technologies": ["Python", "FastAPI", "React", "PostgreSQL"],
    "github_url": "https://github.com/user/ai-chatbot",
    "demo_url": "https://ai-chatbot.example.com",
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z"
  }
}
```

---

### Get User Submissions
```http
GET /api/submissions/:userId
```

**URL Parameters:**
- `userId`: User's ID

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "sub-1704110400000",
      "user_id": "user-123",
      "hackathon_id": "hackerearth-123",
      "status": "draft",
      "project_name": "AI Chat Assistant",
      ...
    }
  ]
}
```

**Sorting:** By created_at (descending, newest first)

---

## Forms

### Detect Form Fields
```http
POST /api/forms/detect
Content-Type: application/json

{
  "hackathon_url": "https://hackerearth.com/challenges/..."
}
```

**Parameters:**
- `hackathon_url` (string, required): URL of hackathon submission page

**Response:**
```json
{
  "success": true,
  "data": [
    "project_name",
    "project_description",
    "team_members",
    "technologies",
    "github_url",
    "demo_url",
    "video_url"
  ]
}
```

**Detects:** Input fields, textareas, selects, file uploads, and more

---

### Auto-Fill Submission Form
```http
POST /api/forms/fill
Content-Type: application/json

{
  "hackathon_url": "https://hackerearth.com/challenges/...",
  "project_name": "AI Chat Assistant",
  "project_description": "An intelligent chatbot powered by GPT-4",
  "team_members": [
    {
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "role": "Lead"
    },
    {
      "name": "Bob Smith",
      "email": "bob@example.com",
      "role": "Backend"
    }
  ],
  "technologies": ["Python", "FastAPI", "React", "PostgreSQL"],
  "github_url": "https://github.com/team/ai-chatbot",
  "demo_url": "https://ai-chatbot.example.com",
  "video_url": "https://youtube.com/watch?v=..."
}
```

**Parameters:**
- `hackathon_url` (string, required): Submission page URL
- `project_name` (string, required): Project name
- `project_description` (string, required): Project description
- `team_members` (array, required): Array of team members
  - `name` (string): Member name
  - `email` (string): Member email
  - `role` (string, optional): Role in team
- `technologies` (array, required): Technology stack
- `github_url` (string, optional): GitHub link
- `demo_url` (string, optional): Demo link
- `video_url` (string, optional): Video link

**Response Success:**
```json
{
  "success": true,
  "form_fields_filled": 7,
  "status": "filled",
  "data": {
    "success": true,
    "form_fields_filled": 7,
    "fields_found": [
      "project_name",
      "project_description",
      "team",
      "technologies",
      "github_url",
      "demo_url"
    ],
    "status": "form_filled_successfully"
  }
}
```

**Response Error:**
```json
{
  "success": false,
  "error": "Could not find form fields at this URL",
  "form_fields_filled": 0,
  "status": "error"
}
```

**Note:** Does NOT submit the form, only fills it

---

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "statusCode": 400
}
```

### Common Status Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request (missing/invalid parameters) |
| 404 | Not found |
| 500 | Server error |
| 408 | Timeout (form/page too slow) |

### Common Errors

**Missing API Key:**
```json
{
  "success": false,
  "error": "TINYFISH_API_KEY environment variable is not set"
}
```

**Invalid URL:**
```json
{
  "success": false,
  "error": "Failed to navigate to URL: Invalid URL format"
}
```

**Timeout:**
```json
{
  "success": false,
  "error": "Page took too long to load",
  "statusCode": 408
}
```

---

## Rate Limiting

**Current Limits:**
- No hard limits enforced (for development)
- Recommended: Add delays between requests to same domain
- TinyFish handles bot detection automatically

**For Production:**
- Implement token-based rate limiting
- Queue long-running jobs
- Cache results aggressively

---

## Pagination

**Current:** Results limited to:
- Hackathons: ~50 per platform
- Solutions: Top 50 by rating
- Upcoming: Next 30 days

**Future:** Add `offset` and `limit` parameters

---

## Sorting

**Hackathons:** By deadline (ascending)  
**Solutions:** By rating/votes (descending)  
**Submissions:** By creation date (descending)

---

## Data Types

### HackathonRecord
```typescript
{
  id: string;                    // Platform-URL hash
  name: string;                  // Hackathon name
  platform: string;              // hackerearth|devpost|mlh
  url: string;                   // Unique hackathon URL
  deadline: string | null;       // ISO 8601 date
  prize_pool: string | null;     // e.g. "$50,000"
  description: string | null;    // Brief description
  theme: string | null;          // AI/ML, Web3, etc.
  difficulty: string | null;     // beginner|intermediate|advanced
}
```

### SolutionRecord
```typescript
{
  id: string;                    // UUID
  title: string;                 // Project name
  theme: string;                 // Topic/category
  author: string | null;         // Original author
  team: string | null;           // Team name
  prize: string | null;          // Prize won
  description: string | null;    // Project summary
  technologies: string[];        // Tech stack
  github_url: string | null;     // Repository link
  demo_url: string | null;       // Live demo
  votes: number | null;          // Other users' votes
  rating: number | null;         // Star rating 0-5
  year: string | null;           // Competition year
}
```

### UserRecord
```typescript
{
  id: string;                    // User identifier
  name: string;                  // Full name
  email: string | null;          // Email address
  skills: string[];              // Technical skills
  interests: string[];           // Problem interests
  created_at: string;            // Creation timestamp
}
```

### SubmissionRecord
```typescript
{
  id: string;                    // Submission ID
  user_id: string;               // User who created it
  hackathon_id: string;          // Hackathon submitted to
  status: string;                // draft|submitted|winner
  project_name: string | null;   // Project title
  project_description: string;   // Project details
  technologies: string[];        // Tech stack
  github_url: string | null;     // Code repository
  demo_url: string | null;       // Live demo
  created_at: string;            // Creation timestamp
  updated_at: string;            // Last update timestamp
}
```

---

## Example Workflows

### Workflow 1: Discover & Submit
```bash
# 1. Create user profile
curl -X POST http://localhost:3000/api/users ...

# 2. Run discovery
curl -X POST http://localhost:3000/api/discover ...

# 3. Create submission draft
curl -X POST http://localhost:3000/api/submissions ...

# 4. Auto-fill form
curl -X POST http://localhost:3000/api/forms/fill ...

# 5. Manually submit on platform
```

### Workflow 2: Find & Analyze
```bash
# 1. Find solutions for theme
curl http://localhost:3000/api/solutions/AI

# 2. Get upcoming hackathons
curl http://localhost:3000/api/hackathons/upcoming

# 3. Combine insights for strategy
```

---

## Testing

Use provided `test-api.sh`:
```bash
bash test-api.sh
```

Or use cURL/Postman with examples above.

---

## Changelog

### v0.1.0 (Current)
- ✅ API Core Endpoints
- ✅ TinyFish Integration (all 3 endpoints)
- ✅ Multi-platform Hackathon Discovery
- ✅ Solution Analysis
- ✅ Form Automation
- 🔄 In Development: WebSocket support
- 📋 Planned: Advanced filtering, ML ranking

---

## Support

- 📖 Full docs: [README.md](README.md)
- 🏗️ Architecture: [ARCHITECTURE.md](ARCHITECTURE.md)
- ⚡ Quick start: [SETUP.md](SETUP.md)
- 🔗 TinyFish: [docs.tinyfish.ai](https://docs.tinyfish.ai)
