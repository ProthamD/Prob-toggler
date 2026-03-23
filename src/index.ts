import 'dotenv/config';
import { Logger } from './core/types.js';
import { initializeDatabase } from './db/database.js';
import { HackathonOrchestratorAgent } from './agents/orchestrator.js';

export { HackathonOrchestratorAgent };
export * from './core/tinyfish-client.js';
export * from './core/types.js';
export * from './agents/hackathon-scraper.js';
export * from './agents/solution-finder.js';
export * from './agents/form-automation.js';
export * from './agents/opportunity-monitor.js';
export * from './db/database.js';

/**
 * Main entry point for the Hackathon AI Agent
 */
async function main() {
  Logger.info('🚀 Hackathon AI Agent - Initializing');

  // Initialize database
  initializeDatabase();

  // Create orchestrator
  const orchestrator = new HackathonOrchestratorAgent();

  // Example: Discover opportunities for a user
  const userProfile = {
    skills: ['React', 'TypeScript', 'Node.js', 'Machine Learning', 'Python'],
    interests: ['AI/ML', 'Web3', 'FinTech', 'Climate Tech'],
    availability_days: 30,
  };

  Logger.info({ userProfile }, 'Starting discovery pipeline');

  try {
    const results = await orchestrator.discoverAndPrepareOpportunities(userProfile);
    console.log('\n✅ Discovery completed!');
    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    Logger.error({ error }, 'Discovery failed');
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
