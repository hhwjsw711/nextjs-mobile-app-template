'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TagSelector } from '@/components/shared/TagSelector';
import { useTemplates } from '@/hooks/useTemplates';
import {
  MUSCLE_GROUP_LABELS,
  type MuscleGroup,
  type WorkoutCategory,
  type WorkoutTemplate,
} from '@/lib/types';
import { Plus, Trash2, Dumbbell, Activity } from 'lucide-react';

const CATEGORY_LABELS: Record<WorkoutCategory, string> = {
  strength: '力量训练',
  cardio: '有氧运动',
  flexibility: '柔韧性',
  sports: '体育运动',
  other: '其他',
};

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

export function TemplatesScreen() {
  const { templates, addTemplate, deleteTemplate } = useTemplates();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<WorkoutCategory>('strength');
  const [newMuscleGroups, setNewMuscleGroups] = useState<MuscleGroup[]>([]);

  const grouped = CATEGORY_OPTIONS.reduce(
    (acc, { value }) => {
      acc[value] = templates.filter((t) => t.category === value);
      return acc;
    },
    {} as Record<WorkoutCategory, WorkoutTemplate[]>
  );

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await addTemplate({
      category: newCategory,
      name: newName.trim(),
      muscleGroups: newMuscleGroups,
    });
    setNewName('');
    setNewMuscleGroups([]);
    setShowAdd(false);
  };

  return (
    <div className="space-y-6 stagger-children">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl tracking-tight">模板</h2>
          <p className="text-sm text-muted-foreground mt-1">
            一键快速记录常用锻炼。
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(!showAdd)} className="rounded-lg">
          <Plus className="mr-1 h-4 w-4" />
          添加
        </Button>
      </div>

      {/* Add form */}
      {showAdd && (
        <Card className="shadow-sm animate-fade-in">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tmplName">名称</Label>
              <Input
                id="tmplName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="例如：晨间HIIT、瑜伽流程"
                className="rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label>分类</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setNewCategory(opt.value)}>
                    <Badge
                      variant={newCategory === opt.value ? 'default' : 'outline'}
                      className={`cursor-pointer px-3 py-1.5 rounded-lg transition-all duration-200 ${
                        newCategory === opt.value ? 'shadow-sm' : 'hover:bg-accent/60'
                      }`}
                    >
                      {opt.label}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            <TagSelector
              label="训练肌群"
              options={MUSCLE_GROUP_OPTIONS}
              selected={newMuscleGroups}
              onChange={setNewMuscleGroups}
            />

            <div className="flex gap-2">
              <Button onClick={handleAdd} size="sm" disabled={!newName.trim()} className="rounded-lg">
                添加模板
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)} className="rounded-lg">
                取消
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template groups */}
      {CATEGORY_OPTIONS.map(({ value, label }) => {
        const items = grouped[value];
        if (items.length === 0) return null;
        return (
          <div key={value} className="space-y-2.5">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {label}
            </h3>
            <div className="grid gap-2">
              {items.map((tmpl) => (
                <Card key={tmpl.id} className="shadow-sm">
                  <CardContent className="flex items-center justify-between p-3.5">
                    <div className="flex items-start gap-3">
                      <Dumbbell className="mt-0.5 h-4 w-4 text-muted-foreground/60 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{tmpl.name}</p>
                        {tmpl.muscleGroups.length > 0 && (
                          <div className="mt-1.5 flex gap-1">
                            {tmpl.muscleGroups.map((mg) => (
                              <Badge key={mg} variant="secondary" className="text-xs rounded-md">
                                {MUSCLE_GROUP_LABELS[mg]}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {!tmpl.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTemplate(tmpl.id)}
                        aria-label={`删除 ${tmpl.name}`}
                        className="rounded-lg"
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {/* Empty state */}
      {templates.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/60">
            <Dumbbell className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground">暂无模板。在上面添加你的常用锻炼。</p>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 py-3">
        <Activity className="h-3 w-3 text-primary/40" />
        <p className="text-center text-xs text-muted-foreground italic">
          模板减少阻力，少想多做。
        </p>
        <Activity className="h-3 w-3 text-primary/40" />
      </div>
    </div>
  );
}
