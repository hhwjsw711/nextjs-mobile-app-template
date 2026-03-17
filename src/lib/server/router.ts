import { os } from '@orpc/server';
import * as z from 'zod';
import * as dao from './dao';
import { auth } from '@clerk/nextjs/server';

// ─── Context middleware ───────────────────────────────────────────

const withAuth = os
  .middleware(async ({ context, next }) => {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }
    return next({ context: { ...context, userId } });
  });

const protectedProcedure = os.use(withAuth);

// ─── Zod Schemas ──────────────────────────────────────────────────

const WorkoutCategorySchema = z.enum(['strength', 'cardio', 'flexibility', 'sports', 'other']);

const EventTypeSchema = z.enum(['workout', 'rest_day', 'note']);

const MuscleGroupSchema = z.enum(['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core', 'full_body']);

const MoodTagSchema = z.enum([
  'energized', 'tired', 'sore', 'motivated', 'stressed', 'relaxed', 'rushed', 'other',
]);

const ProfileSchema = z.object({
  id: z.string(),
  wakeTime: z.string(),
  timezone: z.string(),
  preferredTime: z.string(),
  restDays: z.array(z.string()),
  goals: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const ScheduleSlotSchema = z.object({
  type: z.string(),
  time: z.string(),
  enabled: z.boolean(),
});

const WorkoutTemplateSchema = z.object({
  id: z.string(),
  category: WorkoutCategorySchema,
  name: z.string(),
  muscleGroups: z.array(MuscleGroupSchema),
  isDefault: z.boolean().optional(),
});

const BaseEventSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  localDate: z.string(),
  localTime: z.string(),
  type: EventTypeSchema,
  notes: z.string().optional(),
});

const WorkoutEventSchema = BaseEventSchema.extend({
  type: z.literal('workout'),
  category: WorkoutCategorySchema,
  templateId: z.string().optional(),
  name: z.string(),
  durationMinutes: z.number().optional(),
  effort: z.number().optional(),
  muscleGroups: z.array(MuscleGroupSchema).optional(),
  tags: z.array(MoodTagSchema).optional(),
});

const RestDayEventSchema = BaseEventSchema.extend({
  type: z.literal('rest_day'),
  reason: z.string().optional(),
});

const NoteEventSchema = BaseEventSchema.extend({
  type: z.literal('note'),
});

const AppEventSchema = z.union([WorkoutEventSchema, RestDayEventSchema, NoteEventSchema]);

const GoalSchema = z.object({
  id: z.string(),
  description: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  active: z.boolean(),
  outcome: z.string().optional(),
  createdAt: z.string(),
});

// ─── Procedures ───────────────────────────────────────────────────

// Profile
const getProfile = protectedProcedure
  .handler(async ({ context }) => {
    return dao.getProfile(context.userId);
  });

const updateProfile = protectedProcedure
  .input(ProfileSchema.partial().omit({ id: true }))
  .handler(async ({ context, input }) => {
    return dao.updateProfile(context.userId, input);
  });

// Schedule
const getSchedule = protectedProcedure
  .handler(async ({ context }) => {
    return dao.getSchedule(context.userId);
  });

const updateScheduleSlot = protectedProcedure
  .input(z.object({
    index: z.number(),
    updates: ScheduleSlotSchema.partial(),
  }))
  .handler(async ({ context, input }) => {
    await dao.updateScheduleSlot(context.userId, input.index, input.updates);
    return dao.getSchedule(context.userId);
  });

const initSchedule = protectedProcedure
  .handler(async ({ context }) => {
    await dao.initSchedule(context.userId);
    return dao.getSchedule(context.userId);
  });

const resetSchedule = protectedProcedure
  .handler(async ({ context }) => {
    await dao.resetSchedule(context.userId);
    return dao.getSchedule(context.userId);
  });

// Templates
const getTemplates = protectedProcedure
  .handler(async ({ context }) => {
    return dao.getTemplates(context.userId);
  });

const addTemplate = protectedProcedure
  .input(WorkoutTemplateSchema)
  .handler(async ({ context, input }) => {
    await dao.addTemplate(context.userId, input);
    return dao.getTemplates(context.userId);
  });

const deleteTemplate = protectedProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ context, input }) => {
    await dao.deleteTemplate(context.userId, input.id);
    return dao.getTemplates(context.userId);
  });

const initTemplates = protectedProcedure
  .handler(async ({ context }) => {
    await dao.initTemplates(context.userId);
    return dao.getTemplates(context.userId);
  });

// Events
const getEventsByDate = protectedProcedure
  .input(z.object({ date: z.string() }))
  .handler(async ({ context, input }) => {
    return dao.getEventsByDate(context.userId, input.date);
  });

const getAllEvents = protectedProcedure
  .handler(async ({ context }) => {
    return dao.getAllEvents(context.userId);
  });

const addEvent = protectedProcedure
  .input(AppEventSchema)
  .handler(async ({ context, input }) => {
    await dao.addEvent(context.userId, input);
    return { ok: true as const };
  });

const deleteEvent = protectedProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ context, input }) => {
    await dao.deleteEvent(context.userId, input.id);
    return { ok: true as const };
  });

// Goals
const getGoals = protectedProcedure
  .handler(async ({ context }) => {
    return dao.getGoals(context.userId);
  });

const addGoal = protectedProcedure
  .input(GoalSchema)
  .handler(async ({ context, input }) => {
    await dao.addGoal(context.userId, input);
    return dao.getGoals(context.userId);
  });

const updateGoal = protectedProcedure
  .input(z.object({
    id: z.string(),
    active: z.boolean().optional(),
    outcome: z.string().optional(),
  }))
  .handler(async ({ context, input }) => {
    const { id, ...updates } = input;
    await dao.updateGoal(context.userId, id, updates);
    return dao.getGoals(context.userId);
  });

const deleteGoal = protectedProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ context, input }) => {
    await dao.deleteGoal(context.userId, input.id);
    return dao.getGoals(context.userId);
  });

// Export
const exportData = protectedProcedure
  .input(z.object({
    days: z.number().optional(),
  }).optional())
  .handler(async ({ context, input }) => {
    const { format: fmtFn, subDays } = await import('date-fns');

    const profile = await dao.getProfile(context.userId);
    const schedule = await dao.getSchedule(context.userId);
    const templates = await dao.getTemplates(context.userId);
    let events = await dao.getAllEvents(context.userId);
    const goals = await dao.getGoals(context.userId);
    const weeklyReviews = await dao.getWeeklyReviews(context.userId);

    if (input?.days) {
      const cutoff = fmtFn(subDays(new Date(), input.days), 'yyyy-MM-dd');
      events = events.filter((e) => e.localDate >= cutoff);
    }

    const { id, ...profileData } = profile;

    return {
      schemaVersion: '1.0.0',
      appVersion: '0.1.0',
      exportedAt: new Date().toISOString(),
      profile: profileData,
      schedule,
      templates,
      events,
      goals,
      weeklyReviews,
    };
  });

// Import
const importData = protectedProcedure
  .input(z.object({
    action: z.enum(['clear', 'reset', 'import']).optional(),
    data: z.any().optional(),
  }))
  .handler(async ({ context, input }) => {
    if (input.action === 'clear') {
      await dao.clearAllEvents(context.userId);
      return { ok: true as const, message: '所有记录已清除。' };
    }

    if (input.action === 'reset') {
      await dao.resetAll(context.userId);
      return { ok: true as const, message: '应用已重置。' };
    }

    const data = input.data;
    if (!data?.schemaVersion || !data?.events) {
      throw new Error('导出格式无效。');
    }

    if (data.profile) {
      await dao.updateProfile(context.userId, { ...data.profile, id: context.userId });
    }

    if (data.schedule) {
      await dao.resetSchedule(context.userId);
      const { getDb } = await import('./db');
      const db = getDb();
      for (const s of data.schedule) {
        await db.execute({
          sql: 'INSERT INTO schedule (user_id, type, time, enabled) VALUES (?, ?, ?, ?)',
          args: [context.userId, s.type, s.time, s.enabled ? 1 : 0],
        });
      }
    }

    if (data.templates) {
      const { getDb } = await import('./db');
      const db = getDb();
      await db.execute({
        sql: 'DELETE FROM templates WHERE user_id = ?',
        args: [context.userId],
      });
      for (const t of data.templates) {
        await dao.addTemplate(context.userId, t);
      }
    }

    if (data.events) {
      await dao.bulkImportEvents(context.userId, data.events);
    }

    if (data.goals) {
      for (const g of data.goals) {
        try { await dao.addGoal(context.userId, g); } catch { /* skip duplicates */ }
      }
    }

    if (data.weeklyReviews) {
      for (const r of data.weeklyReviews) {
        await dao.upsertWeeklyReview(context.userId, r);
      }
    }

    return { ok: true as const, message: `已导入 ${data.events.length} 条记录。` };
  });

// ─── Router ───────────────────────────────────────────────────────

export const router = {
  profile: {
    get: getProfile,
    update: updateProfile,
  },
  schedule: {
    get: getSchedule,
    updateSlot: updateScheduleSlot,
    init: initSchedule,
    reset: resetSchedule,
  },
  templates: {
    get: getTemplates,
    add: addTemplate,
    delete: deleteTemplate,
    init: initTemplates,
  },
  events: {
    getByDate: getEventsByDate,
    getAll: getAllEvents,
    add: addEvent,
    delete: deleteEvent,
  },
  goals: {
    get: getGoals,
    add: addGoal,
    update: updateGoal,
    delete: deleteGoal,
  },
  export: exportData,
  import: importData,
};
