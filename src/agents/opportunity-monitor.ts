import { runAutomationSync, startAutomationAsync, pollUntilComplete } from '../core/tinyfish-client.js';
import { RunStatus, Logger } from '../core/types.js';

export interface Opportunity {
  id: string;
  title: string;
  type: 'hackathon' | 'grant' | 'problem' | 'bounty';
  url: string;
  deadline: string;
  category: string;
  prize_pool?: string;
  first_seen: Date;
  updated_at: Date;
  is_new: boolean;
}

/**
 * Opportunity Monitor Agent
 * Continuously monitors for new opportunities
 * Uses async endpoint for background monitoring
 */
export async function startOpportunityMonitoring(): Promise<string> {
  Logger.info('Starting opportunity monitor');

  const goal = `
    Monitor this page for new opportunities and changes.
    
    Look for:
    1. New hackathons listed
    2. Upcoming deadlines (next 7 days)
    3. High prize pool events
    4. Trending problem statements
    
    Return JSON with:
    {
      "new_opportunities": [
        {
          "title": "string",
          "type": "hackathon|grant|problem|bounty",
          "url": "string",
          "deadline": "YYYY-MM-DD or null",
          "prize_pool": "string or null",
          "category": "string"
        }
      ],
      "deadline_alerts": [
        {
          "title": "string",
          "days_until_deadline": number,
          "url": "string"
        }
      ]
    }
  `;

  // Use async endpoint to start long-running monitor
  const asyncResult = await startAutomationAsync({
    url: 'https://www.hackerearth.com/challenges/',
    goal,
    browser_profile: (process.env.BROWSER_PROFILE as 'stealth' | 'lite') || 'stealth',
    proxy_config: {
      enabled: process.env.PROXY_ENABLED === 'true',
      country_code: (process.env.PROXY_COUNTRY_CODE as any) || 'US',
    },
  });

  Logger.info({ run_id: asyncResult.run_id }, 'Monitor started');
  return asyncResult.run_id;
}

/**
 * Check monitor status
 */
export async function checkMonitorStatus(runId: string): Promise<{
  status: string;
  opportunities?: Opportunity[];
  alerts?: any[];
}> {
  try {
    const statusResult = await pollUntilComplete(runId, 300000, 5000); // Poll for 5 minutes

    if (statusResult.status === RunStatus.COMPLETED) {
      const data = statusResult.result as {
        new_opportunities: Array<{
          title: string;
          type: string;
          url: string;
          deadline?: string;
          prize_pool?: string;
          category: string;
        }>;
      };

      const opportunities: Opportunity[] = (data.new_opportunities || []).map((opp) => ({
        id: `${opp.url}-${Date.now()}`,
        title: opp.title,
        type: opp.type as 'hackathon' | 'grant' | 'problem' | 'bounty',
        url: opp.url,
        deadline: opp.deadline || '',
        category: opp.category,
        prize_pool: opp.prize_pool,
        first_seen: new Date(),
        updated_at: new Date(),
        is_new: true,
      }));

      return {
        status: 'completed',
        opportunities,
      };
    }

    return {
      status: statusResult.status.toLowerCase(),
    };
  } catch (error) {
    Logger.error({ error, run_id: runId }, 'Error checking monitor status');
    return {
      status: 'error',
    };
  }
}

/**
 * Detect deadline reminders
 */
export async function detectUpcomingDeadlines(
  opportunities: Opportunity[],
  daysThreshold: number = 7
): Promise<Opportunity[]> {
  const now = new Date();
  return opportunities.filter((opp) => {
    if (!opp.deadline) return false;
    const deadlineDate = new Date(opp.deadline);
    const daysUntil = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntil > 0 && daysUntil <= daysThreshold;
  });
}
