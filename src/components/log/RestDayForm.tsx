'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { WhenPicker } from '@/components/shared/WhenPicker';
import { useEvents } from '@/hooks/useEvents';
import { CheckCircle2 } from 'lucide-react';

interface RestDayFormProps {
  onComplete?: () => void;
}

export function RestDayForm({ onComplete }: RestDayFormProps) {
  const { addRestDay } = useEvents();
  const [saved, setSaved] = useState(false);
  const [reason, setReason] = useState('');
  const [when, setWhen] = useState<Date | null>(null);

  const handleSubmit = async () => {
    await addRestDay(reason || undefined, when ?? undefined);
    setSaved(true);
    setTimeout(() => onComplete?.(), 1500);
  };

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 animate-fade-in">
        <CheckCircle2 className="h-14 w-14 text-green-600 dark:text-green-400 animate-check-pop" />
        <p className="font-display text-xl">休息日已记录</p>
        <p className="text-sm text-muted-foreground">休息也是计划的一部分。</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl tracking-tight">休息日</h2>
        <p className="text-sm text-muted-foreground mt-1">
          休息日培养持续性，而非负罪感。
        </p>
      </div>

      <WhenPicker value={when} onChange={setWhen} />

      <div className="space-y-2">
        <Label htmlFor="reason">原因（可选）</Label>
        <Textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="例如：肌肉酸痛、主动恢复、计划休息"
          rows={3}
          className="rounded-lg"
        />
      </div>

      <Button onClick={handleSubmit} className="w-full rounded-xl" size="lg">
        记录休息日
      </Button>
    </div>
  );
}
