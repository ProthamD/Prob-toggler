import express, { Request, Response } from 'express';
import { Logger } from '../core/types.js';
import { HackathonOrchestratorAgent } from '../agents/orchestrator.js';
import {
  scrapeAllHackathons,
  filterHackathons,
} from '../agents/hackathon-scraper.js';
import {
  findWinningSolutions,
  analyzeSolutionPatterns,
} from '../agents/solution-finder.js';
import {
  autoFillSubmissionForm,
  detectFormFields,
} from '../agents/form-automation.js';
import {
  getUpcomingHackathons,
  getHackathonsByPlatform,
  getSolutionsByTheme,
  createUser,
  createSubmission,
  saveHackathons,
  getUserSubmissions,
} from '../db/database.js';

const app = express();
app.use(express.json());

const orchestrator = new HackathonOrchestratorAgent();

// ============ Health Check ============

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============ Diagnostic Endpoint ============

app.get('/api/config', (req: Request, res: Response) => {
  res.json({
    mock_mode: process.env.MOCK_MODE,
    node_env: process.env.NODE_ENV,
    tinyfish_api_base: process.env.TINYFISH_API_BASE,
    scraping_enabled: process.env.MOCK_MODE !== 'true' && process.env.NODE_ENV !== 'development',
  });
});

// ============ Discovery Endpoints ============

/**
 * GET /api/discover
 * Full discovery pipeline with user matching
 */
app.post('/api/discover', async (req: Request, res: Response) => {
  try {
    const { skills, interests, availability_days } = req.body;

    Logger.info({ skills, interests }, 'Discovery request');

    const result = await orchestrator.discoverAndPrepareOpportunities({
      skills: skills || [],
      interests: interests || [],
      availability_days: availability_days || 30,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    Logger.error(error);
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * GET /api/hackathons/upcoming
 * Get upcoming hackathons — MUST be before /:platform to avoid Express shadowing
 */
app.get('/api/hackathons/upcoming', (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const upcoming = getUpcomingHackathons(days);

    res.json({
      success: true,
      count: upcoming.length,
      data: upcoming,
    });
  } catch (error) {
    Logger.error(error);
    res.status(500).json({ success: false, error: String(error) });
  }
});

/**
 * GET /api/hackathons/:platform
 * Get hackathons from a specific platform
 */
app.get('/api/hackathons/:platform', async (req: Request, res: Response) => {
  try {
    const { platform } = req.params;
    const cached = getHackathonsByPlatform(platform);

    if (cached.length > 0) {
      res.json({
        success: true,
        source: 'cached',
        count: cached.length,
        data: cached,
      });
      return;
    }

    // Not in cache, fetch from web
    let allHackathons: Map<string, any[]>;
    try {
      allHackathons = await scrapeAllHackathons();
    } catch (scrapeErr: any) {
      const msg = scrapeErr?.message || String(scrapeErr);
      Logger.error({ scrapeErr, platform }, 'TinyFish scrape error');
      res.status(502).json({
        success: false,
        error: `TinyFish API error: ${msg}`,
        hint: msg.includes('credits') ? 'Your TinyFish API key has run out of credits. Top up at https://app.tinyfish.ai' : undefined,
      });
      return;
    }

    const hackathons = allHackathons.get(platform) || [];

    if (hackathons.length > 0) {
      saveHackathons(
        hackathons.map((h) => ({
          id: `${platform}-${h.url}`,
          ...h,
          deadline: h.deadline ?? null,
          prize_pool: h.prize_pool ?? null,
          description: h.description ?? null,
          theme: h.theme ?? null,
          difficulty: h.difficulty ?? null,
        }))
      );
    }

    res.json({
      success: true,
      source: 'scraped',
      count: hackathons.length,
      data: hackathons,
    });
  } catch (error) {
    Logger.error(error);
    res.status(500).json({ success: false, error: String(error) });
  }
});

/**
 * GET /api/solutions/:theme
 * Find solutions for a theme
 */
app.get('/api/solutions/:theme', async (req: Request, res: Response) => {
  try {
    const { theme } = req.params;
    const cached = getSolutionsByTheme(theme);

    if (cached.length > 0) {
      res.json({
        success: true,
        source: 'cached',
        count: cached.length,
        data: cached,
      });
      return;
    }

    // Fetch from web
    const solutions = await findWinningSolutions(theme);
    res.json({
      success: true,
      source: 'scraped',
      count: solutions.length,
      data: solutions,
    });
  } catch (error) {
    Logger.error(error);
    res.status(500).json({ success: false, error: String(error) });
  }
});

// ============ User Management ============

/**
 * POST /api/users
 * Create or update user profile
 */
app.post('/api/users', (req: Request, res: Response) => {
  try {
    const { id, name, email, skills, interests } = req.body;

    const user = createUser({
      id: id || `user-${Date.now()}`,
      name,
      email,
      skills: skills || [],
      interests: interests || [],
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    Logger.error(error);
    res.status(500).json({ success: false, error: String(error) });
  }
});

// ============ Submission Management ============

/**
 * POST /api/submissions
 * Create submission draft
 */
app.post('/api/submissions', (req: Request, res: Response) => {
  try {
    const {
      user_id,
      hackathon_id,
      project_name,
      project_description,
      technologies,
      github_url,
      demo_url,
    } = req.body;

    const submission = createSubmission({
      user_id,
      hackathon_id,
      project_name,
      project_description,
      technologies: technologies || [],
      github_url,
      demo_url,
    });

    res.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    Logger.error(error);
    res.status(500).json({ success: false, error: String(error) });
  }
});

/**
 * GET /api/submissions/:userId
 * Get user's submissions
 */
app.get('/api/submissions/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const submissions = getUserSubmissions(userId);

    res.json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    Logger.error(error);
    res.status(500).json({ success: false, error: String(error) });
  }
});

// ============ Form Automation ============

/**
 * POST /api/forms/detect
 * Detect form fields on a hackathon submission page
 */
app.post('/api/forms/detect', async (req: Request, res: Response) => {
  try {
    const { hackathon_url } = req.body;
    const fields = await detectFormFields(hackathon_url);

    res.json({
      success: true,
      data: fields,
    });
  } catch (error) {
    Logger.error(error);
    res.status(500).json({ success: false, error: String(error) });
  }
});

/**
 * POST /api/forms/fill
 * Auto-fill submission form
 */
app.post('/api/forms/fill', async (req: Request, res: Response) => {
  try {
    const {
      hackathon_url,
      project_name,
      project_description,
      team_members,
      technologies,
      github_url,
      demo_url,
    } = req.body;

    const result = await autoFillSubmissionForm({
      hackathon_url,
      project_name,
      project_description,
      team_members,
      technologies,
      github_url,
      demo_url,
    });

    res.json({
      success: result.success,
      data: result,
    });
  } catch (error) {
    Logger.error(error);
    res.status(500).json({ success: false, error: String(error) });
  }
});

// ============ Error Handler ============

app.use((err: any, req: Request, res: Response, next: any) => {
  Logger.error(err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

export default app;
