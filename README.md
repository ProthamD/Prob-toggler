# AI Agent - TinyFish Powered

> AI-powered autonomous agent for discovering, analyzing, and automating hackathon participation

An intelligent system that uses **TinyFish Web Agent APIs** to autonomously:
- 🔍 **Discover** hackathons and opportunities across multiple platforms
- 🧠 **Analyze** winning solutions to extract patterns and insights
- 📝 **Automate** submission form filling with your project details
- 📡 **Monitor** new opportunities in real-time
- 💡 **Recommend** ideal hackathons based on your skills & interests

---

## 🎯 What Makes This Different?

Instead of manually searching for hackathons, this agent:

1. **Crawls multiple platforms** simultaneously (HackerEarth, DevPost, MLH)
2. **Enriches data** with historical winning solutions
3. **Matches opportunities** to your specific skills & interests
4. **Auto-fills submission forms** ready for review
5. **Ranks recommendations** by relevance score

---

## 📋 Prerequisites

- **Node.js 18+** and npm
- **TinyFish API Key** (get at [agent.tinyfish.ai/api-keys](https://agent.tinyfish.ai/api-keys))
- Your API key: `sk-tinyfish-oS4d3nXx-Eco83zakoFA1_1Ogdp4LJds`

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd /path/to/tinyFishHackathon
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
```

Edit `.env` and add your TinyFish API key:
```env
TINYFISH_API_KEY=sk-tinyfish-oS4d3nXx-Eco83zakoFA1_1Ogdp4LJds
TINYFISH_API_BASE=https://agent.tinyfish.ai/v1
PORT=3000
NODE_ENV=development
```

### 3. Run the Server

```bash
npm run server
```

Server starts at `http://localhost:3000`

---

## 🛠️ Available Commands

```bash
# Start API server
npm run server

# Run discovery pipeline (CLI)
npm run agent

# Scrape hackathons from all platforms
npm run scrape:hackathons

# Find solutions for a specific theme
npm run scrape:solutions

# Start background monitoring
npm run monitor

# Build TypeScript
npm run build

# Start built application
npm start
```

---

## 📡 API Endpoints

### Discovery Pipeline
```bash
POST /api/discover
Content-Type: application/json

{
  "skills": ["React", "Python", "Machine Learning"],
  "interests": ["AI/ML", "FinTech", "Web3"],
  "availability_days": 30
}
```

**Response:** Top 10 hackathon recommendations ranked by relevance

---

### Get Hackathons by Platform
```bash
GET /api/hackathons/:platform

# Platforms: hackerearth, devpost, mlh
GET /api/hackathons/hackerearth
```

---

### Get Upcoming Hackathons
```bash
GET /api/hackathons/upcoming?days=30
```

---

### Find Solutions
```bash
GET /api/solutions/:theme

# Examples:
GET /api/solutions/AI
GET /api/solutions/blockchain
GET /api/solutions/climate
```

---

### User Management
```bash
POST /api/users
Content-Type: application/json

{
  "id": "user-123",
  "name": "John Doe",
  "email": "john@example.com",
  "skills": ["React", "Node.js"],
  "interests": ["Web", "AI"]
}
```

---

### Create Submission Draft
```bash
POST /api/submissions
Content-Type: application/json

{
  "user_id": "user-123",
  "hackathon_id": "hackerearth-123",
  "project_name": "My AI Project",
  "project_description": "A machine learning project...",
  "technologies": ["Python", "TensorFlow", "React"],
  "github_url": "https://github.com/user/project",
  "demo_url": "https://demo.example.com"
}
```

---

### Auto-Fill Submission Form
```bash
POST /api/forms/fill
Content-Type: application/json

{
  "hackathon_url": "https://hackerearth.com/challenge/submission",
  "project_name": "My Project",
  "project_description": "Project description...",
  "team_members": [
    { "name": "John", "email": "john@example.com", "role": "Lead" }
  ],
  "technologies": ["React", "Node.js"],
  "github_url": "https://github.com/user/project",
  "demo_url": "https://demo.example.com"
}
```

---

## 🤖 Programmatic Usage

### Use as Node Library

```typescript
import { HackathonOrchestratorAgent } from './agents/orchestrator';
import { scrapeAllHackathons } from './agents/hackathon-scraper';
import { findWinningSolutions } from './agents/solution-finder';
import { autoFillSubmissionForm } from './agents/form-automation';

// Create orchestrator
const orchestrator = new HackathonOrchestratorAgent();

// Discover opportunities
const results = await orchestrator.discoverAndPrepareOpportunities({
  skills: ['React', 'TypeScript'],
  interests: ['AI', 'Web3'],
  availability_days: 30
});

console.log(results.recommendations);
```

### Direct Agent Usage

```typescript
// Scrape hackathons
const hackathons = await scrapeAllHackathons();

// Find solutions for a theme
const solutions = await findWinningSolutions('Machine Learning', '2024');

// Get solution patterns
const patterns = await analyzeSolutionPatterns(solutions);
console.log(patterns.common_techs); // Top 10 technologies

// Auto-fill a form
const result = await autoFillSubmissionForm({
  hackathon_url: 'https://...',
  project_name: 'My Project',
  project_description: '...',
  team_members: [{ name: 'John', email: 'john@example.com' }],
  technologies: ['React', 'Node.js'],
  github_url: 'https://github.com/...'
});
```

---

## 🎯 Problem Context - Beyond Prize Money

Each hackathon recommendation includes **real-world problem context** to help you understand the genuine impact:

### What's Included in Each Recommendation:

```json
{
  "hackathon": {
    "name": "AI Innovation Challenge",
    "prize_pool": "$50,000",
    "theme": "AI/ML"
  },
  "problem_context": {
    "problem_statement": "Healthcare systems struggle with diagnosis delays and medical errors. AI-powered diagnostic tools can reduce diagnosis time from weeks to minutes with 95%+ accuracy.",
    "real_world_impact": "Can save millions of lives annually by enabling early disease detection",
    "problem_domain": "Healthcare & Medical AI",
    "estimated_potential": "Global healthcare AI market: $67.4B by 2027",
    "key_challenges": [
      "Processing multi-modal medical data (images, text, time-series)",
      "Ensuring model explainability for medical professionals",
      "Achieving 99.9% reliability for life-critical decisions",
      "Handling privacy-sensitive patient information"
    ],
    "example_applications": [
      "Radiology report automation",
      "Predictive patient risk scoring",
      "Drug discovery acceleration"
    ]
  }
}
```

### Example Problems Solved in Mock Data:

| Hackathon | Problem | Impact | Market |
|-----------|---------|--------|--------|
| **AI Innovation** | Healthcare diagnosis delays | Save millions of lives | $67.4B by 2027 |
| **Web3 Hackathon** | 1.7B unbanked people | 80% drop in remittance fees | $759B remittances/year |
| **Spring League** | 250M out-of-school children | 40% better learning | $250B+ EdTech market |

### Why This Matters

Instead of chasing prize money, developers see:
- ✅ **Real problems** that affect millions of people
- ✅ **Market size** showing commercial viability
- ✅ **Technical depth** understanding the challenge complexity
- ✅ **Concrete solutions** what has worked before
- ✅ **Impact metrics** how their work creates value

---

## 🔧 TinyFish Integration Details

This agent uses all three TinyFish endpoints strategically:

### 1. **Streaming (`/run-sse`)** - Real-time Progress
Used for:
- Hackathon discovery (real-time progress tracking)
- Form field detection
- Multi-step workflows

**Advantage:** See progress, handle long-running tasks, cancel if needed

```typescript
import { runAutomationStreaming } from './core/tinyfish-client';

for await (const event of runAutomationStreaming({
  url: 'https://...',
  goal: 'Extract hackathons...'
})) {
  if (event.type === 'PROGRESS') {
    console.log(`Progress: ${event.purpose}`);
  }
}
```

### 2. **Synchronous (`/run`)** - Simple & Fast
Used for:
- Quick data extraction
- Form auto-fill
- Simple navigation

**Advantage:** Simpler code, good for quick operations (< 30 seconds)

```typescript
import { runAutomationSync } from './core/tinyfish-client';

const result = await runAutomationSync({
  url: 'https://...',
  goal: 'Extract product info...'
});
```

### 3. **Async (`/run-async` + polling)** - Background Jobs
Used for:
- Continuous opportunity monitoring
- Batch processing multiple hackathons
- Background updates

**Advantage:** Non-blocking, efficient for many tasks

```typescript
import { startAutomationAsync, pollUntilComplete } from './core/tinyfish-client';

const response = await startAutomationAsync({
  url: 'https://...',
  goal: '...'
});

// Check status later
const status = await pollUntilComplete(response.run_id);
```

---

## 📊 Data Models

### Hackathon Record
```typescript
{
  id: "platform-url",
  name: "Hackathon Name",
  platform: "hackerearth",
  url: "https://...",
  deadline: "2024-12-31",
  prize_pool: "$50,000",
  description: "...",
  theme: "AI/ML",
  difficulty: "intermediate"
}
```

### Solution Record
```typescript
{
  id: "theme-title-timestamp",
  title: "Project Name",
  theme: "AI/ML",
  author: "Team Name",
  prize: "1st Place",
  description: "...",
  technologies: ["React", "Python", "TensorFlow"],
  github_url: "https://github.com/...",
  demo_url: "https://...",
  votes: 250,
  rating: 4.8,
  year: "2024"
}
```

### User Record
```typescript
{
  id: "user-123",
  name: "John Doe",
  email: "john@example.com",
  skills: ["React", "Python"],
  interests: ["AI", "Web3"],
  created_at: "2024-01-01T..."
}
```

---

## 🎓 Example Use Cases

### 1. Find Hackathons for Your Skills
```bash
curl -X POST http://localhost:3000/api/discover \
  -H "Content-Type: application/json" \
  -d '{
    "skills": ["React", "Node.js", "Python"],
    "interests": ["AI", "FinTech"],
    "availability_days": 30
  }'
```

### 2. Auto-Fill a Submission Form
```bash
curl -X POST http://localhost:3000/api/forms/fill \
  -H "Content-Type: application/json" \
  -d '{
    "hackathon_url": "https://hackerearth.com/challenge/submit",
    "project_name": "AI Chat Bot",
    "project_description": "An AI-powered chatbot using GPT...",
    "team_members": [{"name": "Alice", "email": "alice@example.com"}],
    "technologies": ["Python", "FastAPI", "React"],
    "github_url": "https://github.com/user/chatbot"
  }'
```

### 3. Analyze Winning Solutions
```bash
curl http://localhost:3000/api/solutions/AI
# Returns top winning AI hackathon projects with tech stack analysis
```

---

## 📚 Project Structure

```
src/
├── core/
│   ├── types.ts                 # Core types & logger
│   └── tinyfish-client.ts       # TinyFish API wrapper (all 3 endpoints)
├── agents/
│   ├── orchestrator.ts          # Main orchestration agent
│   ├── hackathon-scraper.ts     # Discover hackathons
│   ├── solution-finder.ts       # Analyze solutions
│   ├── form-automation.ts       # Auto-fill forms
│   └── opportunity-monitor.ts   # Background monitoring
├── api/
│   ├── server.ts                # Express server entry
│   └── routes.ts                # API endpoints
├── db/
│   └── database.ts              # Data persistence (file-based)
├── queue/
│   └── job-queue.ts             # Background job manager
└── index.ts                     # Main entry point
```

---

## 🔐 Security Notes

- **Never commit your `.env` file** with API keys
- Use environment variables for sensitive data
- The agent uses stealth browser profiles for anti-detection (optional)
- All TinyFish API calls use HTTPS

---

## 🚦 Monitoring & Debugging

### Enable Debug Logging
```bash
LOG_LEVEL=debug npm run server
```

### Check Async Task Status
```bash
# Tasks stored in ~/.hackathon-agent/data.json

# API endpoint to check task
GET /api/tasks/:run_id
```

### Monitor Background Jobs
```bash
npm run monitor
```

---

## 🎯 Next Steps

1. **Set up your profile**: Create a user profile with your skills & interests
2. **Discover opportunities**: Run the discovery pipeline
3. **Review recommendations**: Check top-ranked hackathons
4. **Auto-fill form**: Fill submission form for selected hackathon
5. **Submit**: Review & submit through the platform

---

## 🐛 Troubleshooting

### Error: `TINYFISH_API_KEY not set`
```bash
# Make sure .env file exists and has the key
cat .env
```

### Error: `Cannot find module`
```bash
# Rebuild TypeScript
npm run build

# Or use tsx for development
npm run server  # Uses tsx watch
```

### Slow scraping
```bash
# Reduce concurrency or increase timeout
# Edit src/agents/orchestrator.ts
```

---

## 📖 Documentation

For TinyFish API documentation:
- https://docs.tinyfish.ai
- https://docs.tinyfish.ai/api-reference/automation
- API streaming: https://docs.tinyfish.ai/api-reference/automation/run-browser-automation-with-sse-streaming

---

## 🤝 Contributing

Ideas for improvements:
- [ ] WebSocket support for real-time updates
- [ ] PostgreSQL migration for production
- [ ] Advanced filtering & ML-based ranking
- [ ] Custom LLM integration for recommendations
- [ ] Dashboard UI (React/Vue)
- [ ] Webhook support for external triggers
- [ ] Advanced caching strategy

---

## 📄 License

MIT - Use freely for hackathons and learning!

---

## 🎉 Ready to Build?

```bash
npm run server
# Visit http://localhost:3000/health
# Test with curl or Postman
```


