// ─── Core Types ───────────────────────────────────────────────────
// All types for the workout tracker app.

export type WorkoutCategory = 'strength' | 'cardio' | 'flexibility' | 'sports' | 'other';

export type EventType = 'workout' | 'rest_day' | 'note';

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'core'
  | 'full_body';

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: '胸部',
  back: '背部',
  shoulders: '肩部',
  biceps: '肱二头肌',
  triceps: '肱三头肌',
  legs: '腿部',
  core: '核心',
  full_body: '全身',
};

export type MoodTag =
  | 'energized'
  | 'tired'
  | 'sore'
  | 'motivated'
  | 'stressed'
  | 'relaxed'
  | 'rushed'
  | 'other';

export const MOOD_TAG_LABELS: Record<MoodTag, string> = {
  energized: '精力充沛',
  tired: '疲惫',
  sore: '酸痛',
  motivated: '有动力',
  stressed: '压力大',
  relaxed: '放松',
  rushed: '匆忙',
  other: '其他',
};

export interface ScheduleSlot {
  type: string; // e.g. 'morning_workout', 'evening_stretch'
  time: string; // HH:mm
  enabled: boolean;
}

export interface WorkoutTemplate {
  id: string;
  category: WorkoutCategory;
  name: string;
  muscleGroups: MuscleGroup[];
  isDefault?: boolean;
}

export interface Profile {
  id: string; // always 'default'
  wakeTime: string; // HH:mm
  timezone: string;
  preferredTime: string; // HH:mm — preferred workout time
  restDays: string[]; // e.g. ['sunday', 'wednesday']
  goals: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Events ───────────────────────────────────────────────────────

export interface BaseEvent {
  id: string;
  timestamp: string; // ISO
  localDate: string; // YYYY-MM-DD
  localTime: string; // HH:mm
  type: EventType;
  notes?: string;
}

export interface WorkoutEvent extends BaseEvent {
  type: 'workout';
  category: WorkoutCategory;
  templateId?: string;
  name: string;
  durationMinutes?: number;
  effort?: number; // 1-10
  muscleGroups?: MuscleGroup[];
  tags?: MoodTag[];
}

export interface RestDayEvent extends BaseEvent {
  type: 'rest_day';
  reason?: string;
}

export interface NoteEvent extends BaseEvent {
  type: 'note';
}

export type AppEvent = WorkoutEvent | RestDayEvent | NoteEvent;

// ─── Goals ────────────────────────────────────────────────────────

export interface Goal {
  id: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  active: boolean;
  outcome?: string;
  createdAt: string;
}

// ─── Weekly Review ────────────────────────────────────────────────

export interface WeeklyReview {
  id: string;
  weekStart: string; // YYYY-MM-DD (Monday)
  weekEnd: string; // YYYY-MM-DD (Sunday)
  workoutCount: number;
  restDayCount: number;
  totalMinutes: number;
  avgEffort: number | null;
  categoryBreakdown: Record<WorkoutCategory, number>;
  muscleGroupBreakdown: Record<MuscleGroup, number>;
  commonTags: MoodTag[];
  streakDays: number;
  notes?: string;
  createdAt: string;
}

// ─── Export Schema ────────────────────────────────────────────────

export interface ExportData {
  schemaVersion: string;
  appVersion: string;
  exportedAt: string;
  profile: Omit<Profile, 'id'>;
  schedule: ScheduleSlot[];
  templates: WorkoutTemplate[];
  events: AppEvent[];
  goals: Goal[];
  weeklyReviews: WeeklyReview[];
}
