import 'dotenv/config';
import app from './routes.js';
import { initializeDatabase } from '../db/database.js';
import { Logger } from '../core/types.js';

const PORT = process.env.PORT || 3000;

// Initialize database
initializeDatabase();

app.listen(PORT, () => {
  Logger.info({ port: PORT }, 'Server started');
  console.log(`
╔════════════════════════════════════════════════════════════╗
║   HACKATHON AI AGENT - API Server                          ║
║                                                            ║
║   📍 Server: http://localhost:${PORT}                      ║
║   📚 API Docs: http://localhost:${PORT}/api                ║
║                                                            ║
║   Available Endpoints:                                    ║
║   - POST /api/discover - Full discovery pipeline           ║
║   - GET /api/hackathons/:platform - Get hackathons         ║
║   - GET /api/hackathons/upcoming - Upcoming events         ║
║   - GET /api/solutions/:theme - Find winning solutions     ║
║   - POST /api/users - Create user profile                  ║
║   - POST /api/submissions - Create submission              ║
║   - POST /api/forms/fill - Auto-fill forms                 ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});
