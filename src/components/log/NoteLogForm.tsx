'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { WhenPicker } from '@/components/shared/WhenPicker';
import { useEvents } from '@/hooks/useEvents';
import { CheckCircle2 } from 'lucide-react';

interface NoteLogFormProps {
  onComplete?: () => void;
}

export function NoteLogForm({ onComplete }: NoteLogFormProps) {
  const { addNote } = useEvents();
  const [saved, setSaved] = useState(false);
  const [notes, setNotes] = useState('');
  const [when, setWhen] = useState<Date | null>(null);

  const handleSubmit = async () => {
    if (!notes.trim()) return;
    await addNote(notes, when ?? undefined);
    setSaved(true);
    setTimeout(() => onComplete?.(), 1500);
  };

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 animate-fade-in">
        <CheckCircle2 className="h-14 w-14 text-green-600 dark:text-green-400 animate-check-pop" />
        <p className="font-display text-xl">笔记已保存</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl tracking-tight">快速笔记</h2>
        <p className="text-sm text-muted-foreground mt-1">记录任何内容。</p>
      </div>

      <WhenPicker value={when} onChange={setWhen} />

      <div className="space-y-2">
        <Label htmlFor="note">笔记</Label>
        <Textarea
          id="note"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="一个想法、观察或任何你心中的内容"
          rows={4}
          autoFocus
          className="rounded-lg"
        />
      </div>

      <Button onClick={handleSubmit} className="w-full rounded-xl" size="lg" disabled={!notes.trim()}>
        保存笔记
      </Button>
    </div>
  );
}
