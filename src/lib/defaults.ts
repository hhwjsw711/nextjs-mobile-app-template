import type { ScheduleSlot, WorkoutTemplate, Profile } from './types';

// ─── Default Schedule ─────────────────────────────────────────────

export const DEFAULT_SCHEDULE: ScheduleSlot[] = [
  { type: 'morning_workout', time: '07:00', enabled: true },
  { type: 'evening_stretch', time: '20:00', enabled: false },
];

// ─── Default Templates ───────────────────────────────────────────

export const DEFAULT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'tmpl_push_day',
    category: 'strength',
    name: '推力日（胸、肩、三头）',
    muscleGroups: ['chest', 'shoulders', 'triceps'],
    isDefault: true,
  },
  {
    id: 'tmpl_pull_day',
    category: 'strength',
    name: '拉力日（背、二头）',
    muscleGroups: ['back', 'biceps'],
    isDefault: true,
  },
  {
    id: 'tmpl_leg_day',
    category: 'strength',
    name: '腿部训练（深蹲、弓步、小腿）',
    muscleGroups: ['legs'],
    isDefault: true,
  },
  {
    id: 'tmpl_full_body',
    category: 'strength',
    name: '全身循环训练',
    muscleGroups: ['full_body'],
    isDefault: true,
  },
  {
    id: 'tmpl_run',
    category: 'cardio',
    name: '跑步 / 慢跑',
    muscleGroups: ['legs', 'core'],
  },
  {
    id: 'tmpl_cycling',
    category: 'cardio',
    name: '骑行',
    muscleGroups: ['legs'],
  },
  {
    id: 'tmpl_yoga',
    category: 'flexibility',
    name: '瑜伽流程',
    muscleGroups: ['full_body'],
  },
  {
    id: 'tmpl_stretching',
    category: 'flexibility',
    name: '拉伸训练',
    muscleGroups: ['full_body'],
  },
];

// ─── Default Profile ─────────────────────────────────────────────

export const DEFAULT_PROFILE: Profile = {
  id: 'default',
  wakeTime: '07:00',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai',
  preferredTime: '07:00',
  restDays: ['sunday'],
  goals: [
    '每周至少锻炼4天',
    '每周尝试一种新运动',
    '坚持比强度更重要',
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ─── Suggested Goals ──────────────────────────────────────────────

export const SUGGESTED_GOALS = [
  '本周锻炼4天以上',
  '每个肌群至少练一次',
  '尝试一种新运动或训练',
  '每次锻炼后拉伸10分钟',
  '完成一次较长有氧运动（30分钟以上）',
  '在某项力量训练中增加重量或次数',
  '改为晨练而非晚间锻炼',
  '好好休息（不要有负罪感）',
];

// ─── Schedule Type Labels ────────────────────────────────────────

export const SCHEDULE_TYPE_LABELS: Record<string, string> = {
  morning_workout: '晨练',
  evening_stretch: '晚间拉伸',
};

// ─── Motivational Copy ──────────────────────────────────────────

export const MOTIVATIONAL_MESSAGES = {
  restDay: [
    '休息是计划的一部分，肌肉在恢复中生长。',
    '主动恢复或完全休息——都算数。',
    '休息日培养持续性，而非负罪感。',
  ],
  general: [
    '坚持胜过强度。',
    '每次锻炼都算数，无论多短。',
    '最好的锻炼是你真正去做的那个。',
    '出现就是成功，这是最难的部分。',
  ],
  streak: [
    '你正在状态，继续保持。',
    '动力就是一切。',
  ],
};
