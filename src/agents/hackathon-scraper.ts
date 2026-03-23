import { runAutomationSync } from '../core/tinyfish-client.js';
import { RunStatus, Logger } from '../core/types.js';

interface Hackathon {
  name: string;
  platform: string;
  prize_pool?: string;
  deadline?: string;
  description?: string;
  url: string;
  theme?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * Hackathon Scraper Agent
 * Extracts active hackathons from multiple platforms using TinyFish
 */
export async function scrapeHackathons(platform: string): Promise<Hackathon[]> {
  Logger.info({ platform }, 'Starting hackathon scraper');

  const urls: Record<string, string> = {
    hackerearth: 'https://www.hackerearth.com/challenges/',
    devpost: 'https://devpost.com/hackathons',
    mlh: 'https://mlh.io/seasons/2025/events',
  };

  const url = urls[platform];
  if (!url) {
    throw new Error(`Unknown platform: ${platform}`);
  }

  const goal = `
    Extract ALL active hackathons from this page. For each hackathon, provide:
    - name (exact title)
    - prize_pool (total prize amount, or null if not shown)
    - deadline (date, or null if not specified)
    - description (brief summary, max 200 chars)
    - url (direct link to hackathon page)
    - theme (main theme/focus area)
    - difficulty (beginner/intermediate/advanced estimate based on description)
    
    Return as JSON array with structure:
    {
      "hackathons": [
        {
          "name": "string",
          "platform": "${platform}",
          "prize_pool": "string or null",
          "deadline": "string or null",
          "description": "string",
          "url": "string",
          "theme": "string",
          "difficulty": "beginner | intermediate | advanced"
        }
      ]
    }
    
    Handle pagination by clicking "Load More" or "Next" if available.
    Stop when no more hackathons can be loaded.
  `;

  try {
    Logger.info({ platform, url }, 'Starting real hackathon scraping');
    const result = await runAutomationSync({
      url,
      goal: `Extract ALL active hackathons from this page. For each, get: name, prize_pool, deadline, description, url, theme, difficulty. Return as JSON array.`,
      browser_profile: 'stealth' as const,
      proxy_config: {
        enabled: true,
        country_code: 'US',
      },
    });

    if (result.status !== RunStatus.COMPLETED) {
      Logger.error({ result }, 'Scraping failed - result not completed');
      return [];
    }

    // TinyFish may return the array directly, or wrapped under a key
    const raw = result.result as any;
    const hackathons: Hackathon[] =
      Array.isArray(raw) ? raw :
      Array.isArray(raw?.hackathons) ? raw.hackathons :
      [];

    Logger.info(
      { count: hackathons.length, platform },
      'Real hackathon scraping completed'
    );

    return hackathons;
  } catch (error: any) {
    const msg: string = error?.message ?? String(error);
    // Re-throw API-level errors (credits exhausted, auth failure) so the
    // caller can surface them. Only silently swallow when it's clearly a
    // transient / page-level issue.
    if (
      error?.code === 'STREAM_INIT_FAILED' ||
      error?.statusCode === 403 ||
      error?.statusCode === 401 ||
      msg.toLowerCase().includes('credits') ||
      msg.toLowerCase().includes('forbidden') ||
      msg.toLowerCase().includes('api key')
    ) {
      Logger.error({ error, platform }, 'TinyFish API error — re-throwing');
      throw error;
    }
    Logger.error({ error, platform }, 'Error scraping hackathons');
    return [];
  }
}

/**
 * Scrape hackathons from all platforms
 */
export async function scrapeAllHackathons(): Promise<Map<string, Hackathon[]>> {
  const platforms = ['hackerearth', 'devpost', 'mlh'];
  const results = new Map<string, Hackathon[]>();

  Logger.info({ platforms }, 'Starting multi-platform scrape');

  for (const platform of platforms) {
    try {
      const hackathons = await scrapeHackathons(platform);
      results.set(platform, hackathons);
      Logger.info(
        { platform, count: hackathons.length },
        'Platform scrape complete'
      );
      // Rate limiting - wait between requests (reduced from 2s to 500ms)
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      Logger.error({ error, platform }, 'Failed to scrape platform');
      results.set(platform, []);
    }
  }

  return results;
}

/**
 * Filter hackathons by criteria
 */
export function filterHackathons(
  hackathons: Hackathon[],
  criteria: {
    theme?: string;
    minPrize?: number;
    daysUntilDeadline?: number;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
  }
): Hackathon[] {
  return hackathons.filter((h) => {
    if (criteria.theme && !h.theme?.toLowerCase().includes(criteria.theme.toLowerCase())) {
      return false;
    }

    if (criteria.difficulty && h.difficulty !== criteria.difficulty) {
      return false;
    }

    return true;
  });
}
