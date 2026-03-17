import { createClient, type Client } from '@libsql/client';

let _db: Client | null = null;
let _initialized = false;

export function getDb(): Client {
  if (!_db) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url) {
      throw new Error('TURSO_DATABASE_URL environment variable is required. See .env.example');
    }

    _db = createClient({
      url,
      authToken,
    });
  }
  return _db;
}

export async function initDb() {
  if (_initialized) return;
  
  const db = getDb();
  
  await db.execute(`CREATE TABLE IF NOT EXISTS profile (
    user_id TEXT PRIMARY KEY,
    wake_time TEXT NOT NULL DEFAULT '07:00',
    timezone TEXT NOT NULL DEFAULT 'America/Los_Angeles',
    preferred_time TEXT NOT NULL DEFAULT '07:00',
    rest_days TEXT NOT NULL DEFAULT '["sunday"]',
    goals TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS schedule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    time TEXT NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 1
  )`);
  
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_schedule_user_id ON schedule(user_id)`);

  await db.execute(`CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    muscle_groups TEXT NOT NULL DEFAULT '[]',
    is_default INTEGER NOT NULL DEFAULT 0
  )`);
  
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id)`);

  await db.execute(`CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    local_date TEXT NOT NULL,
    local_time TEXT NOT NULL,
    type TEXT NOT NULL,
    data TEXT NOT NULL DEFAULT '{}'
  )`);

  await db.execute(`CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_events_local_date ON events(local_date)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_events_type ON events(type)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_events_type_date ON events(type, local_date)`);

  await db.execute(`CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    description TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    outcome TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);
  
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id)`);

  await db.execute(`CREATE TABLE IF NOT EXISTS weekly_reviews (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    week_start TEXT NOT NULL,
    week_end TEXT NOT NULL,
    data TEXT NOT NULL DEFAULT '{}'
  )`);
  
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_weekly_reviews_user_id ON weekly_reviews(user_id)`);
  
  _initialized = true;
}
