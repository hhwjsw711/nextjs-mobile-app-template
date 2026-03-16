'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { SliderField } from '@/components/shared/SliderField';
import { TagSelector } from '@/components/shared/TagSelector';
import { WhenPicker } from '@/components/shared/WhenPicker';
import { useEvents } from '@/hooks/useEvents';
import { useTemplates } from '@/hooks/useTemplates';
import {
  MUSCLE_GROUP_LABELS,
  MOOD_TAG_LABELS,
  type MuscleGroup,
  type MoodTag,
  type WorkoutCategory,
} from '@/lib/types';
import { CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

const CATEGORY_OPTIONS: { value: WorkoutCategory; label: string }[] = [
  { value: 'strength', label: '力量训练' },
  { value: 'cardio', label: '有氧运动' },
  { value: 'flexibility', label: '柔韧性' },
  { value: 'sports', label: '体育运动' },
  { value: 'other', label: '其他' },
];

const MUSCLE_GROUP_OPTIONS = Object.entries(MUSCLE_GROUP_LABELS).map(([value, label]) => ({
  value: value as MuscleGroup,
  label,
}));

const MOOD_TAG_OPTIONS = Object.entries(MOOD_TAG_LABELS).map(([value, label]) => ({
  value: value as MoodTag,
  label,
}));

interface WorkoutLogFormProps {
  onComplete?: () => void;
}

export function WorkoutLogForm({ onComplete }: WorkoutLogFormProps) {
  const { addWorkout } = useEvents();
  const { templates } = useTemplates();

  const [saved, setSaved] = useState(false);
  const [category, setCategory] = useState<WorkoutCategory>('strength');
  const [templateId, setTemplateId] = useState<string | undefined>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [effort, setEffort] = useState(5);
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [tags, setTags] = useState<MoodTag[]>([]);
  const [notes, setNotes] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [when, setWhen] = useState<Date | null>(null);

  const relevantTemplates = templates.filter((t) => t.category === category);

  const selectTemplate = (id: string) => {
    const tmpl = templates.find((t) => t.id === id);
    if (tmpl) {
      setTemplateId(id);
      setName(tmpl.name);
      setMuscleGroups(tmpl.muscleGroups);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    await addWorkout({
      category,
      templateId,
      name: name.trim(),
      durationMinutes: durationMinutes > 0 ? durationMinutes : undefined,
      effort,
      muscleGroups: muscleGroups.length > 0 ? muscleGroups : undefined,
      tags: tags.length > 0 ? tags : undefined,
      notes: notes || undefined,
      at: when ?? undefined,
    });
    setSaved(true);
    setTimeout(() => {
      onComplete?.();
    }, 1500);
  };

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 animate-fade-in">
        <CheckCircle2 className="h-14 w-14 text-green-600 dark:text-green-400 animate-check-pop" />
        <p className="font-display text-xl">锻炼已记录</p>
        <p className="text-sm text-muted-foreground">继续保持，做得很好。</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl tracking-tight">记录锻炼</h2>
        <p className="text-sm text-muted-foreground mt-1">记录你做了什么。</p>
      </div>

      <WhenPicker value={when} onChange={setWhen} />

      {/* Category selector */}
      <div className="flex flex-wrap gap-2">
        {CATEGORY_OPTIONS.map((opt) => (
          <button key={opt.value} type="button" onClick={() => setCategory(opt.value)}>
            <Badge
              variant={category === opt.value ? 'default' : 'outline'}
              className={`cursor-pointer px-3 py-1.5 rounded-lg transition-all duration-200 ${
                category === opt.value ? 'shadow-sm' : 'hover:bg-accent/60'
              }`}
            >
              {opt.label}
            </Badge>
          </button>
        ))}
      </div>

      {/* Template quick-pick */}
      {relevantTemplates.length > 0 && (
        <div className="space-y-2.5">
          <p className="text-sm font-medium text-muted-foreground">快速选择</p>
          <div className="grid gap-2">
            {relevantTemplates.map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => selectTemplate(tmpl.id)}
                className={`text-left rounded-xl border p-3.5 text-sm transition-all duration-200 ${
                  templateId === tmpl.id
                    ? 'border-primary/40 bg-primary/5 shadow-sm'
                    : 'border-border/60 hover:bg-accent/40 hover:border-border'
                }`}
              >
                <span className="font-medium">{tmpl.name}</span>
                {tmpl.muscleGroups.length > 0 && (
                  <div className="mt-1.5 flex gap-1">
                    {tmpl.muscleGroups.map((mg) => (
                      <Badge key={mg} variant="secondary" className="text-xs rounded-md">
                        {MUSCLE_GROUP_LABELS[mg]}
                      </Badge>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="workoutName">锻炼名称</Label>
        <Input
          id="workoutName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例如：晨跑、推力训练"
          className="rounded-lg"
        />
      </div>

      {/* Duration slider */}
      <SliderField
        label="时长（分钟）"
        value={durationMinutes}
        onChange={setDurationMinutes}
        min={0}
        max={120}
        step={5}
        description="0 = 未记录"
      />

      {/* Effort slider */}
      <SliderField
        label="努力程度"
        value={effort}
        onChange={setEffort}
        min={1}
        max={10}
        description="1 = 轻松，10 = 全力以赴"
      />

      {/* More details toggle */}
      <button
        type="button"
        onClick={() => setShowMore(!showMore)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {showMore ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        {showMore ? '收起详情' : '更多详情（可选）'}
      </button>

      {showMore && (
        <div className="space-y-4 animate-fade-in">
          <TagSelector
            label="训练肌群"
            options={MUSCLE_GROUP_OPTIONS}
            selected={muscleGroups}
            onChange={setMuscleGroups}
          />

          <TagSelector
            label="你现在感觉如何？"
            options={MOOD_TAG_OPTIONS}
            selected={tags}
            onChange={setTags}
          />

          <div className="space-y-2">
            <Label htmlFor="workoutNotes">备注</Label>
            <Textarea
              id="workoutNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="关于这次锻炼的备注（可选）"
              rows={2}
              className="rounded-lg"
            />
          </div>
        </div>
      )}

      <Button onClick={handleSubmit} className="w-full rounded-xl" size="lg" disabled={!name.trim()}>
        记录锻炼
      </Button>
    </div>
  );
}
