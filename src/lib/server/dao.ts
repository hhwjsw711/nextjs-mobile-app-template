import { getDb, initDb } from './db';
import type {
  Profile,
  ScheduleSlot,
  WorkoutTemplate,
  AppEvent,
  Goal,
  WeeklyReview,
} from '../types';
import { DEFAULT_PROFILE, DEFAULT_SCHEDULE, DEFAULT_TEMPLATES } from '../defaults';

// ─── Profile ──────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile> {
  await initDb();
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM profile WHERE user_id = ?',
    args: [userId],
  });
  const row = result.rows[0] as any;
  if (!row) {
    await insertProfile(userId, DEFAULT_PROFILE);
    return { ...DEFAULT_PROFILE, id: userId };
  }
  return {
    id: row.user_id as string,
    wakeTime: row.wake_time as string,
    timezone: row.timezone as string,
    preferredTime: row.preferred_time as string,
    restDays: JSON.parse(row.rest_days as string),
    goals: JSON.parse(row.goals as string),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

async function insertProfile(userId: string, p: Profile) {
  const db = getDb();
  await db.execute({
    sql: `INSERT OR REPLACE INTO profile (user_id, wake_time, timezone, preferred_time, rest_days, goals, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      userId,
      p.wakeTime,
      p.timezone,
      p.preferredTime,
      JSON.stringify(p.restDays),
      JSON.stringify(p.goals),
      p.createdAt,
      p.updatedAt,
    ],
  });
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
  const current = await getProfile(userId);
  const merged = { ...current, ...updates, id: userId, updatedAt: new Date().toISOString() };
  await insertProfile(userId, merged);
  return merged;
}

// ─── Schedule ─────────────────────────────────────────────────────

export async function getSchedule(userId: string): Promise<ScheduleSlot[]> {
  await initDb();
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM schedule WHERE user_id = ? ORDER BY id',
    args: [userId],
  });
  const rows = result.rows;
  if (rows.length === 0) {
    await initSchedule(userId);
    return DEFAULT_SCHEDULE;
  }
  return rows.map((r) => ({
    type: r.type as string,
    time: r.time as string,
    enabled: !!r.enabled,
  }));
}

export async function initSchedule(userId: string) {
  const db = getDb();
  const countResult = await db.execute({
    sql: 'SELECT COUNT(*) as c FROM schedule WHERE user_id = ?',
    args: [userId],
  });
  const count = (countResult.rows[0] as any).c;
  if (count === 0) {
    for (const s of DEFAULT_SCHEDULE) {
      await db.execute({
        sql: 'INSERT INTO schedule (user_id, type, time, enabled) VALUES (?, ?, ?, ?)',
        args: [userId, s.type, s.time, s.enabled ? 1 : 0],
      });
    }
  }
}

export async function updateScheduleSlot(userId: string, index: number, updates: Partial<ScheduleSlot>) {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT id FROM schedule WHERE user_id = ? ORDER BY id',
    args: [userId],
  });
  const rows = result.rows;
  if (index < 0 || index >= rows.length) return;
  const rowId = (rows[index] as any).id;

  const sets: string[] = [];
  const vals: any[] = [];
  if (updates.time !== undefined) { sets.push('time = ?'); vals.push(updates.time); }
  if (updates.enabled !== undefined) { sets.push('enabled = ?'); vals.push(updates.enabled ? 1 : 0); }
  if (updates.type !== undefined) { sets.push('type = ?'); vals.push(updates.type); }

  if (sets.length > 0) {
    vals.push(rowId);
    await db.execute({
      sql: `UPDATE schedule SET ${sets.join(', ')} WHERE id = ?`,
      args: vals,
    });
  }
}

export async function resetSchedule(userId: string) {
  const db = getDb();
  await db.execute({
    sql: 'DELETE FROM schedule WHERE user_id = ?',
    args: [userId],
  });
  await initSchedule(userId);
}

// ─── Templates ────────────────────────────────────────────────────

export async function getTemplates(userId: string): Promise<WorkoutTemplate[]> {
  await initDb();
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM templates WHERE user_id = ?',
    args: [userId],
  });
  const rows = result.rows;
  if (rows.length === 0) {
    await initTemplates(userId);
    return DEFAULT_TEMPLATES;
  }
  return rows.map((r) => ({
    id: r.id as string,
    category: r.category as import('../types').WorkoutCategory,
    name: r.name as string,
    muscleGroups: JSON.parse(r.muscle_groups as string),
    isDefault: !!r.is_default,
  }));
}

export async function initTemplates(userId: string) {
  const db = getDb();
  const countResult = await db.execute({
    sql: 'SELECT COUNT(*) as c FROM templates WHERE user_id = ?',
    args: [userId],
  });
  const count = (countResult.rows[0] as any).c;
  if (count === 0) {
    for (const t of DEFAULT_TEMPLATES) {
      await db.execute({
        sql: 'INSERT INTO templates (id, user_id, category, name, muscle_groups, is_default) VALUES (?, ?, ?, ?, ?, ?)',
        args: [t.id, userId, t.category, t.name, JSON.stringify(t.muscleGroups), t.isDefault ? 1 : 0],
      });
    }
  }
}

export async function addTemplate(userId: string, t: WorkoutTemplate) {
  const db = getDb();
  await db.execute({
    sql: 'INSERT INTO templates (id, user_id, category, name, muscle_groups, is_default) VALUES (?, ?, ?, ?, ?, ?)',
    args: [t.id, userId, t.category, t.name, JSON.stringify(t.muscleGroups), t.isDefault ? 1 : 0],
  });
}

export async function deleteTemplate(userId: string, id: string) {
  const db = getDb();
  await db.execute({
    sql: 'DELETE FROM templates WHERE id = ? AND user_id = ?',
    args: [id, userId],
  });
}

// ─── Events ───────────────────────────────────────────────────────

export async function getEventsByDate(userId: string, date: string): Promise<AppEvent[]> {
  await initDb();
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM events WHERE user_id = ? AND local_date = ? ORDER BY timestamp',
    args: [userId, date],
  });
  return result.rows.map(rowToEvent);
}

export async function getAllEvents(userId: string): Promise<AppEvent[]> {
  await initDb();
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM events WHERE user_id = ? ORDER BY timestamp',
    args: [userId],
  });
  return result.rows.map(rowToEvent);
}

export async function addEvent(userId: string, event: AppEvent) {
  const db = getDb();
  const { id, timestamp, localDate, localTime, type, ...rest } = event;
  await db.execute({
    sql: 'INSERT INTO events (id, user_id, timestamp, local_date, local_time, type, data) VALUES (?, ?, ?, ?, ?, ?, ?)',
    args: [id, userId, timestamp, localDate, localTime, type, JSON.stringify(rest)],
  });
}

export async function deleteEvent(userId: string, id: string) {
  const db = getDb();
  await db.execute({
    sql: 'DELETE FROM events WHERE id = ? AND user_id = ?',
    args: [id, userId],
  });
}

function rowToEvent(row: any): AppEvent {
  const data = JSON.parse(row.data as string);
  return {
    id: row.id as string,
    timestamp: row.timestamp as string,
    localDate: row.local_date as string,
    localTime: row.local_time as string,
    type: row.type as string,
    ...data,
  };
}

// ─── Goals ────────────────────────────────────────────────────────

export async function getGoals(userId: string): Promise<Goal[]> {
  await initDb();
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC',
    args: [userId],
  });
  return result.rows.map((r) => ({
    id: r.id as string,
    description: r.description as string,
    startDate: r.start_date as string,
    endDate: r.end_date as string,
    active: !!r.active,
    outcome: (r.outcome as string) || undefined,
    createdAt: r.created_at as string,
  }));
}

export async function addGoal(userId: string, g: Goal) {
  const db = getDb();
  await db.execute({
    sql: 'INSERT INTO goals (id, user_id, description, start_date, end_date, active, outcome, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    args: [g.id, userId, g.description, g.startDate, g.endDate, g.active ? 1 : 0, g.outcome || null, g.createdAt],
  });
}

export async function updateGoal(userId: string, id: string, updates: { active?: boolean; outcome?: string }) {
  const db = getDb();
  const sets: string[] = [];
  const vals: any[] = [];
  if (updates.active !== undefined) { sets.push('active = ?'); vals.push(updates.active ? 1 : 0); }
  if (updates.outcome !== undefined) { sets.push('outcome = ?'); vals.push(updates.outcome); }
  if (sets.length > 0) {
    vals.push(id, userId);
    await db.execute({
      sql: `UPDATE goals SET ${sets.join(', ')} WHERE id = ? AND user_id = ?`,
      args: vals,
    });
  }
}

export async function deleteGoal(userId: string, id: string) {
  const db = getDb();
  await db.execute({
    sql: 'DELETE FROM goals WHERE id = ? AND user_id = ?',
    args: [id, userId],
  });
}

// ─── Weekly Reviews ───────────────────────────────────────────────

export async function getWeeklyReviews(userId: string): Promise<WeeklyReview[]> {
  await initDb();
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM weekly_reviews WHERE user_id = ? ORDER BY week_start DESC',
    args: [userId],
  });
  return result.rows.map((r) => ({
    id: r.id as string,
    weekStart: r.week_start as string,
    weekEnd: r.week_end as string,
    ...JSON.parse(r.data as string),
  }));
}

export async function upsertWeeklyReview(userId: string, review: WeeklyReview) {
  const db = getDb();
  const { id, weekStart, weekEnd, ...data } = review;
  await db.execute({
    sql: 'INSERT OR REPLACE INTO weekly_reviews (id, user_id, week_start, week_end, data) VALUES (?, ?, ?, ?, ?)',
    args: [id, userId, weekStart, weekEnd, JSON.stringify(data)],
  });
}

// ─── Bulk import ──────────────────────────────────────────────────

export async function bulkImportEvents(userId: string, events: AppEvent[]) {
  const db = getDb();
  for (const event of events) {
    const { id, timestamp, localDate, localTime, type, ...rest } = event;
    await db.execute({
      sql: 'INSERT OR REPLACE INTO events (id, user_id, timestamp, local_date, local_time, type, data) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [id, userId, timestamp, localDate, localTime, type, JSON.stringify(rest)],
    });
  }
}

export async function clearAllEvents(userId: string) {
  const db = getDb();
  await db.execute({ sql: 'DELETE FROM events WHERE user_id = ?', args: [userId] });
  await db.execute({ sql: 'DELETE FROM goals WHERE user_id = ?', args: [userId] });
  await db.execute({ sql: 'DELETE FROM weekly_reviews WHERE user_id = ?', args: [userId] });
}

export async function resetAll(userId: string) {
  const db = getDb();
  await db.execute({ sql: 'DELETE FROM profile WHERE user_id = ?', args: [userId] });
  await db.execute({ sql: 'DELETE FROM schedule WHERE user_id = ?', args: [userId] });
  await db.execute({ sql: 'DELETE FROM templates WHERE user_id = ?', args: [userId] });
  await db.execute({ sql: 'DELETE FROM events WHERE user_id = ?', args: [userId] });
  await db.execute({ sql: 'DELETE FROM goals WHERE user_id = ?', args: [userId] });
  await db.execute({ sql: 'DELETE FROM weekly_reviews WHERE user_id = ?', args: [userId] });
}
