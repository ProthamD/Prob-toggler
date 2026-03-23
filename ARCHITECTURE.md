# 🏗️ Architecture & Design Guide

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     YOUR APPLICATION                            │
│                  (Browser / Mobile / CLI)                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────────────┐
         │   Express API Server (Port 3000)     │
         │   ├─ /api/discover                    │
         │   ├─ /api/hackathons                  │
         │   ├─ /api/solutions                   │
         │   ├─ /api/users                       │
         │   ├─ /api/submissions                 │
         │   └─ /api/forms/fill                  │
         └────────┬────────────────────────────┬─┘
                  │                            │
                  ▼                            ▼
        ┌─────────────────────┐    ┌──────────────────────┐
        │ HackathonOrchestrator│    │  Data Persistence   │
        │ Agent               │    │  (~/.hackathon-agent│
        │ - Coordinates all   │    │   /data.json)       │
        │   sub-agents        │    │                       │
        │ - Matches skills    │    └──────────────────────┘
        │ - Ranks results     │
        └────────┬────────────┘
                 │
    ┌────────────┼────────────┬──────────────┬──────────────┐
    │            │            │              │              │
    ▼            ▼            ▼              ▼              ▼
┌────────┐ ┌────────┐ ┌──────────┐ ┌──────────────┐ ┌───────────┐
│Hackathon│Solution │Form       │ Opportunity   │ Search    │
│Scraper  │ Finder  │Automation │ Monitor       │ Utilities │
│Agent    │ Agent   │ Agent     │ Agent         │           │
└────────┘ └────────┘ └──────────┘ └──────────────┘ └───────────┘
    │            │            │              │
    └────────────┼────────────┼──────────────┘
                 │
        ┌────────▼──────────┐
        │  TinyFish Client  │
        │ (Streaming/Sync/  │
        │  Async APIs)      │
        └────────┬──────────┘
                 │
                 ▼
    ┌────────────────────────────────┐
    │   TinyFish Web Agent Platform  │
    │   (agent.tinyfish.ai)          │
    │                                │
    │  ├─ /run (Sync)                │
    │  ├─ /run-sse (Streaming)       │
    │  └─ /run-async (Background)    │
    └────────┬───────────────────────┘
             │
             ▼
    ┌────────────────────────────────┐
    │    Real Browser (Headless)     │
    │                                │
    │  • JavaScript Execution        │
    │  • Dynamic Rendering           │
    │  • Form Interaction            │
    │  • Authentication Handling     │
    └────────┬───────────────────────┘
             │
             ▼
    ┌────────────────────────────────┐
    │      Target Websites           │
    │                                │
    │  • HackerEarth                │
    │  • DevPost                     │
    │  • MLH                          │
    │  • GitHub                      │
    │  • Medium                      │
    └────────────────────────────────┘
```

---

## Data Flow: Complete Discovery Pipeline

### User Input → Recommendations

```
1️⃣  USER PROFILE
    {
      skills: ["React", "Python"],
      interests: ["AI", "FinTech"],
      availability_days: 30
    }
          │
          ▼
2️⃣  ORCHESTRATOR COORDINATES
    ├─ Fetch Hackathons (Multiple Platforms)
    ├─ Fetch Winning Solutions (Theme-based)
    ├─ Analyze Solution Patterns (Tech Stack)
    └─ Match User to Opportunities
          │
          ▼
3️⃣  PARALLEL AGENT EXECUTION
    
    Hackathon Scraper        Solution Finder        Pattern Analyzer
    (Streaming API)          (Sync API)             (Local Analysis)
    
    Platform 1:              Theme 1: AI            Common Techs:
    5 hackathons             10 solutions           - React: 70%
                                                    - Python: 85%
    Platform 2:              Theme 2: FinTech       - TensorFlow: 45%
    8 hackathons             8 solutions
                                                    Avg Team Size: 3-4
    Platform 3:              Theme 3: Web3
    3 hackathons              15 solutions
          │
          ▼
4️⃣  MATCHING ENGINE
    Score = (Skill Match × 10) + (Interest Match × 15)
            + (Deadline Proximity × 20)
    
    Hackathon A: 125 points ✅
    Hackathon B: 95 points
    Hackathon C: 45 points
          │
          ▼
5️⃣  RANKED RECOMMENDATIONS
    [
      {
        rank: 1,
        hackathon: { name, URL, deadline, prize },
        reason: "Matches 2/3 interests, 3/4 skills",
        similar_solutions: [{...}, {...}],
        suggested_tech_stack: ["React", "Python"]
      },
      ...
    ]
```

---

## Each Agent's Role

### 🔍 Hackathon Scraper Agent

**What it does:**
- Crawls HackerEarth, DevPost, MLH simultaneously
- Extracts: name, deadline, prize, difficulty, theme
- Handles pagination & lazy loading

**When used:**
- `/api/hackathons/:platform` (checks cache first)
- Discovery pipeline (fresh data)

**TinyFish Endpoint:**
- Streaming (`/run-sse`) - Multi-page crawling with progress

**Example Goal:**
```
Extract ALL active hackathons. For each provide:
- name, prize_pool, deadline, theme, difficulty
Return as JSON array.
Handle pagination by clicking "Load More" if available.
```

---

### 🧠 Solution Finder Agent

**What it does:**
- Searches for winning solutions on DevPost, GitHub
- Extracts: title, tech stack, team, prize, demo link
- Analyzes what makes solutions successful

**When used:**
- `/api/solutions/:theme` (searches & analyzes)
- Discovery pipeline (pattern analysis)

**TinyFish Endpoint:**
- Sync (`/run`) - Extract structured data quickly

**Example Goal:**
```
Find top 10 winning hackathon solutions for "AI/ML".
For each extract: title, technologies, GitHub URL, prize.
Identify common technology patterns.
Return as JSON with tech frequency analysis.
```

---

### 📝 Form Automation Agent

**What it does:**
- Detects submission form fields
- Fills forms with project details
- Handles multi-step forms

**When used:**
- `/api/forms/detect` - Find all fields
- `/api/forms/fill` - Auto-fill form
- `prepareSubmission()` - Full workflow

**TinyFish Endpoint:**
- Sync (`/run`) - Simple form interactions

**Example Goal:**
```
Fill hackathon submission form with:
- Project Name: "My AI Project"
- Description: "..."
- Technologies: ["Python", "React"]
- GitHub URL: "https://..."

Do NOT submit. Return confirmation of filled fields.
```

---

### 📡 Opportunity Monitor Agent

**What it does:**
- Continuously watches for new hackathons
- Checks deadline changes
- Detects high-prize events

**When used:**
- Background monitoring
- Real-time alerts
- Cron jobs

**TinyFish Endpoint:**
- Async (`/run-async`) - Long-running background task

**Example Goal:**
```
Monitor this hackathon platform for:
1. New hackathons posted today
2. Upcoming deadlines (next 7 days)
3. Events with prize > $10,000

Return new opportunities with metadata.
```

---

## API Integration: All 3 TinyFish Endpoints

### 1. **Streaming (`/run-sse`)**

**When to use:**
- Multi-step workflows
- Need real-time progress tracking
- Long-running tasks (1-5 minutes)
- Want to cancel mid-operation

**Flow:**
```typescript
for await (const event of runAutomationStreaming({
  url: 'https://...',
  goal: 'Extract hackathons...'
})) {
  if (event.type === 'PROGRESS') {
    console.log(`Step: ${event.purpose}`);
    // Track progress in UI
  }
  if (event.type === 'COMPLETE') {
    console.log(`Result:`, event.result);
  }
}
```

**Agents using this:**
- Hackathon Scraper (pagination progress)

---

### 2. **Synchronous (`/run`)**

**When to use:**
- Quick operations (< 30 seconds)
- Simple data extraction
- Form filling
- When you need immediate result

**Flow:**
```typescript
const result = await runAutomationSync({
  url: 'https://...',
  goal: 'Extract solutions for AI...'
});

if (result.status === 'COMPLETED') {
  console.log(result.result);
}
```

**Agents using this:**
- Solution Finder
- Form Detection
- Form Automation

---

### 3. **Asynchronous (`/run-async` + polling)**

**When to use:**
- Long tasks (5+ minutes)
- Background monitoring
- Batch processing
- Non-blocking workflows

**Flow:**
```typescript
// Start task
const { run_id } = await startAutomationAsync({...});

// Later... check status
const status = await pollUntilComplete(run_id);
console.log(status.result);
```

**Agents using this:**
- Opportunity Monitor (continuous background monitor)
- Batch scraping (multiple hackathons)

---

## Matching Algorithm

### Score Calculation

```typescript
function matchScore(user, hackathon, solutions) {
  let score = 0;
  
  // 1. Skill Match (max 50 points)
  for (const skill of user.skills) {
    if (hackathon.description.includes(skill)) {
      score += 10;
    }
  }
  
  // 2. Interest Match (max 50 points)
  for (const interest of user.interests) {
    if (hackathon.theme.includes(interest)) {
      score += 25;
    }
  }
  
  // 3. Deadline Proximity (max 40 points)
  const daysUntil = daysBetween(today, hackathon.deadline);
  if (daysUntil <= user.availability_days && daysUntil > 0) {
    score += 40;
  }
  
  // 4. Prize Level (max 20 points)
  if (hackathon.prize_pool > 50000) {
    score += 20;
  }
  
  // Total max: 160 points
  return score;
}
```

---

## Data Persistence

### Storage Strategy

```
~/.hackathon-agent/
└── data.json
    ├── hackathons: Map<id, HackathonRecord>
    ├── solutions: Map<id, SolutionRecord>
    ├── users: Map<id, UserRecord>
    ├── submissions: Map<id, SubmissionRecord>
    └── async_tasks: Map<run_id, TaskRecord>
```

**Why JSON + Map?**
- ✅ Easy to inspect & debug
- ✅ No external DB dependencies
- ✅ Automatic persistence
- ✅ Works offline
- ⚠️ For production, migrate to PostgreSQL

---

## Configuration & Customization

### Environment Variables

```env
# TinyFish Configuration
TINYFISH_API_KEY=sk-tinyfish-...     # Required
TINYFISH_API_BASE=https://...         # Optional

# Server
PORT=3000
NODE_ENV=development

# Data
DATABASE_URL=sqlite:./data.db        # For future migration

# Scraping
HACKATHON_PLATFORMS=hackerearth,devpost,mlh
MONITOR_INTERVAL_MINUTES=30
MAX_CONCURRENT_AGENTS=3
```

### Customizing Agents

Edit scoring logic:
```typescript
// src/agents/orchestrator.ts - matchOpportunitiesToUser()
// Adjust weights to match your criteria
```

Add new platforms:
```typescript
// src/agents/hackathon-scraper.ts - urls map
urls['new-platform'] = 'https://...';
```

---

## Performance Considerations

### Caching Strategy

```
First Request:
  GET /api/hackathons/hackerearth
  → Scrape from web (30-60 seconds)
  → Cache in ~/.hackathon-agent/data.json
  ✅ Cached for next requests

Subsequent Requests:
  GET /api/hackathons/hackerearth  
  → Serve from cache (< 100ms)
  ✅ Instant response

Background Refresh:
  Monitor process runs every 30 minutes
  → Updates cache with new opportunities
```

### Rate Limiting

TinyFish built-in:
- ✅ Handles anti-bot detection
- ✅ Automatic proxy rotation (optional)
- ✅ Wait times between requests

Your app:
```typescript
// Add delay between platform requests
await new Promise(resolve => setTimeout(resolve, 2000)); 
```

---

## Error Handling

### TinyFish Errors

```typescript
try {
  const result = await runAutomationSync({...});
} catch (error) {
  if (error.code === 'STREAM_INIT_FAILED') {
    // API connection issue
  } else if (error.code === 'TIMEOUT') {
    // Page takes too long to load
    // Try with proxy_config.enabled = true
  }
}
```

### Agent Errors

```typescript
try {
  const solutions = await findWinningSolutions('AI');
} catch (error) {
  logger.error(error); // Falls back gracefully
  return []; // Returns empty array
}
```

---

## Security

✅ **What's Secure:**
- API key stored in `.env` (not in code)
- No server-side cookies/sessions stored
- All data local to your machine
- HTTPS only for TinyFish API

⚠️ **What to Watch:**
- Don't commit `.env` file
- Rotate API keys periodically
- Use VPN for enhanced privacy
- Rate limit your own API

---

## Deployment

### Local Development
```bash
npm run dev
# or
npm run server
```

### Production (Docker Ready)
```bash
npm run build
npm start
```

Future: Add `Dockerfile` for containerization

---

## Extending the System

### Add New Data Source

1. Create new agent in `/src/agents/new-source.ts`
2. Use TinyFish to scrape
3. Map to existing data models
4. Add API endpoint in `/src/api/routes.ts`

### Add Filtering

```typescript
// In /src/agents/orchestrator.ts
function advancedFilter(hackathons, criteria) {
  return hackathons
    .filter(h => h.prize_pool > criteria.minPrize)
    .filter(h => h.difficulty === criteria.difficulty)
    ...
}
```

### Add ML-based Ranking

```typescript
// Use solution patterns for better matching
import * as ml from 'your-ml-library';

const score = ml.predict({
  user_skills: user.skills,
  hackathon_tech: solutions[0].technologies,
  past_performance: userHistory
});
```

---

## Testing

```bash
# Test API endpoints
bash test-api.sh

# Test individual agents
npm run scrape:hackathons
npm run scrape:solutions
npm run monitor
```

---

## Next Steps

1. **Customize** the matching algorithm for your needs
2. **Extend** with additional data sources
3. **Migrate** to PostgreSQL for production
4. **Add** ML-based recommendations
5. **Build** a frontend dashboard
6. **Deploy** to cloud (AWS, GCP, etc.)

---

## Questions?

- 📚 See [README.md](./README.md) for full documentation
- ⚡ See [SETUP.md](./SETUP.md) for quick start
- 🔗 Visit [TinyFish Docs](https://docs.tinyfish.ai)

