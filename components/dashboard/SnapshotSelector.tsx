'use client';

import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Snapshot } from '@/types';

interface Props {
  value: string;
  onChange: (id: string | null) => void;
}

export function SnapshotSelector({ value, onChange }: Props) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);

  useEffect(() => {
    fetch('/api/snapshots')
      .then(r => r.json())
      .then(setSnapshots)
      .catch(console.error);
  }, []);

  if (!snapshots.length) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-neutral-400 shrink-0">Referência:</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-48 bg-neutral-900 border-neutral-700 text-neutral-100 text-sm h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-neutral-900 border-neutral-700">
          {snapshots.map(s => (
            <SelectItem key={s.id} value={s.id} className="text-neutral-100 text-sm">
              {new Date(s.record_date + 'T12:00:00').toLocaleDateString('pt-BR')} — {s.total_rows} emp.
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
