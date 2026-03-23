import path from 'path';
import os from 'os';
import fs from 'fs';
import { Logger } from '../core/types.js';

const DATA_DIR = path.join(os.homedir(), '.hackathon-agent');
const DATA_FILE = path.join(DATA_DIR, 'data.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DatabaseStore {
  hackathons: Map<string, HackathonRecord>;
  solutions: Map<string, SolutionRecord>;
  opportunities: Map<string, any>;
  users: Map<string, UserRecord>;
  submissions: Map<string, SubmissionRecord>;
  async_tasks: Map<string, AsyncTaskRecord>;
}

// In-memory store with file persistence
let store: DatabaseStore = {
  hackathons: new Map(),
  solutions: new Map(),
  opportunities: new Map(),
  users: new Map(),
  submissions: new Map(),
  async_tasks: new Map(),
};

/**
 * Initialize database (file-based storage)
 */
export function initializeDatabase() {
  Logger.info({ path: DATA_FILE }, 'Initializing database');

  // Load existing data
  if (fs.existsSync(DATA_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
      store = {
        hackathons: new Map(data.hackathons || []),
        solutions: new Map(data.solutions || []),
        opportunities: new Map(data.opportunities || []),
        users: new Map(data.users || []),
        submissions: new Map(data.submissions || []),
        async_tasks: new Map(data.async_tasks || []),
      };
      Logger.info('Existing data loaded');
    } catch (e) {
      Logger.warn('Could not load existing data, starting fresh');
    }
  }

  Logger.info('Database initialized');
}

function persistData() {
  const data = {
    hackathons: Array.from(store.hackathons.entries()),
    solutions: Array.from(store.solutions.entries()),
    opportunities: Array.from(store.opportunities.entries()),
    users: Array.from(store.users.entries()),
    submissions: Array.from(store.submissions.entries()),
    async_tasks: Array.from(store.async_tasks.entries()),
  };

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ============ Hackathon Operations ============

export interface HackathonRecord {
  id: string;
  name: string;
  platform: string;
  url: string;
  deadline: string | null;
  prize_pool: string | null;
  description: string | null;
  theme: string | null;
  difficulty: string | null;
  created_at?: string;
  updated_at?: string;
}

export function saveHackathons(hackathons: HackathonRecord[]): number {
  let count = 0;
  for (const h of hackathons) {
    const record = {
      ...h,
      created_at: h.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    store.hackathons.set(h.id, record);
    count++;
  }
  persistData();
  return count;
}

export function getHackathonsByPlatform(platform: string): HackathonRecord[] {
  return Array.from(store.hackathons.values())
    .filter((h) => h.platform === platform)
    .sort(
      (a, b) =>
        (new Date(a.deadline || '').getTime() || Infinity) -
        (new Date(b.deadline || '').getTime() || Infinity)
    );
}

export function getUpcomingHackathons(daysThreshold: number = 30): HackathonRecord[] {
  const now = new Date();
  const threshold = new Date(now.getTime() + daysThreshold * 24 * 60 * 60 * 1000);

  return Array.from(store.hackathons.values())
    .filter((h) => {
      if (!h.deadline) return false;
      const deadline = new Date(h.deadline);
      return deadline > now && deadline < threshold;
    })
    .sort(
      (a, b) =>
        new Date(a.deadline || '').getTime() - new Date(b.deadline || '').getTime()
    );
}

// ============ Solutions Operations ============

export interface SolutionRecord {
  id: string;
  title: string;
  theme: string;
  author: string | null;
  team: string | null;
  prize: string | null;
  description: string | null;
  technologies: string | string[];
  github_url: string | null;
  demo_url: string | null;
  votes: number | null;
  rating: number | null;
  year: string | null;
  created_at?: string;
}

export function saveSolutions(solutions: SolutionRecord[]): number {
  let count = 0;
  for (const s of solutions) {
    const record = {
      ...s,
      technologies: Array.isArray(s.technologies)
        ? s.technologies
        : JSON.parse(String(s.technologies) || '[]'),
      created_at: s.created_at || new Date().toISOString(),
    };
    store.solutions.set(s.id, record);
    count++;
  }
  persistData();
  return count;
}

export function getSolutionsByTheme(theme: string): SolutionRecord[] {
  return Array.from(store.solutions.values())
    .filter((s) => s.theme.toLowerCase().includes(theme.toLowerCase()))
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 50);
}

// ============ User Operations ============

export interface UserRecord {
  id: string;
  name: string;
  email: string | null;
  skills: string | string[];
  interests: string | string[];
  created_at?: string;
}

export function createUser(user: {
  id: string;
  name: string;
  email?: string;
  skills: string[];
  interests: string[];
}): UserRecord {
  const record: UserRecord = {
    id: user.id,
    name: user.name,
    email: user.email || null,
    skills: user.skills,
    interests: user.interests,
    created_at: new Date().toISOString(),
  };

  store.users.set(user.id, record);
  persistData();
  return record;
}

export function getUser(userId: string): UserRecord | null {
  return store.users.get(userId) || null;
}

// ============ Submission Operations ============

export interface SubmissionRecord {
  id: string;
  user_id: string;
  hackathon_id: string;
  status: string;
  project_name: string | null;
  project_description: string | null;
  technologies: string | string[];
  github_url: string | null;
  demo_url: string | null;
  created_at: string;
  updated_at: string;
}

export function createSubmission(submission: {
  user_id: string;
  hackathon_id: string;
  project_name: string;
  project_description: string;
  technologies: string[];
  github_url?: string;
  demo_url?: string;
}): SubmissionRecord {
  const id = `sub-${Date.now()}`;
  const now = new Date().toISOString();

  const record: SubmissionRecord = {
    id,
    user_id: submission.user_id,
    hackathon_id: submission.hackathon_id,
    status: 'draft',
    project_name: submission.project_name,
    project_description: submission.project_description,
    technologies: submission.technologies,
    github_url: submission.github_url || null,
    demo_url: submission.demo_url || null,
    created_at: now,
    updated_at: now,
  };

  store.submissions.set(id, record);
  persistData();
  return record;
}

export function getSubmission(submissionId: string): SubmissionRecord | null {
  return store.submissions.get(submissionId) || null;
}

export function getUserSubmissions(userId: string): SubmissionRecord[] {
  return Array.from(store.submissions.values())
    .filter((s) => s.user_id === userId)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
}

// ============ Async Task Operations ============

export interface AsyncTaskRecord {
  run_id: string;
  agent_type: string;
  status: string;
  parameters: string | Record<string, any>;
  result: string | null | Record<string, any>;
  error: string | null;
  created_at: string;
  completed_at: string | null;
}

export function saveAsyncTask(
  runId: string,
  agentType: string,
  parameters: Record<string, any>
): void {
  const record: AsyncTaskRecord = {
    run_id: runId,
    agent_type: agentType,
    status: 'pending',
    parameters,
    result: null,
    error: null,
    created_at: new Date().toISOString(),
    completed_at: null,
  };

  store.async_tasks.set(runId, record);
  persistData();
}

export function updateAsyncTaskStatus(
  runId: string,
  status: string,
  result?: Record<string, any>,
  error?: string
): void {
  const task = store.async_tasks.get(runId);
  if (task) {
    task.status = status;
    task.result = result || null;
    task.error = error || null;
    task.completed_at = new Date().toISOString();
    persistData();
  }
}

export function getAsyncTask(runId: string): AsyncTaskRecord | null {
  return store.async_tasks.get(runId) || null;
}

export function getPendingAsyncTasks(): AsyncTaskRecord[] {
  return Array.from(store.async_tasks.values()).filter((t) => t.status === 'pending');
}

export function getDatabase() {
  return store;
}

export function closeDatabase() {
  persistData();
}
