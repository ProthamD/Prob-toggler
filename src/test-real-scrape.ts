/**
 * Live real-data scrape test
 * Run: npx tsx src/test-real-scrape.ts
 */
import 'dotenv/config';
import { scrapeHackathons } from './agents/hackathon-scraper.js';

async function main() {
  const platforms = ['devpost', 'hackerearth', 'mlh'];

  for (const platform of platforms) {
    console.log(`\n🔍 Scraping: ${platform} ...`);
    try {
      const hackathons = await scrapeHackathons(platform);
      if (hackathons.length === 0) {
        console.log(`  ⚠️  0 hackathons returned (page may have changed layout)`);
      } else {
        console.log(`  ✅ ${hackathons.length} hackathons found!`);
        hackathons.slice(0, 3).forEach((h, i) => {
          console.log(`  [${i + 1}] ${h.name} | ${h.prize_pool ?? 'no prize'} | deadline: ${h.deadline ?? 'n/a'}`);
          console.log(`       URL: ${h.url}`);
        });
      }
    } catch (err: any) {
      console.error(`  ❌ ERROR: ${err.message}`);
    }
  }
}

main().catch(console.error);
