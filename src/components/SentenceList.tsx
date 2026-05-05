'use client';
import { useEffect, useState } from 'react';
import { SentenceCard, type Stage } from './SentenceCard';
import type { Sentence } from '@/lib/types';
import { keyToAction } from '@/lib/shortcuts';
import { useUserStore } from '@/lib/store';

export function SentenceList({ sentences }: { sentences: Sentence[] }) {
  const [stages, setStages] = useState<Stage[]>(() => sentences.map(() => 0 as Stage));
  const [focus, setFocus] = useState(0);

  const toggleRead = useUserStore((s) => s.toggleRead);
  const toggleBookmark = useUserStore((s) => s.toggleBookmark);
  const cycleFontSize = useUserStore((s) => s.cycleFontSize);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const action = keyToAction(e.key);
      if (!action) return;
      e.preventDefault();
      switch (action.type) {
        case 'focus-next': setFocus((f) => Math.min(f + 1, sentences.length - 1)); break;
        case 'focus-prev': setFocus((f) => Math.max(f - 1, 0)); break;
        case 'set-stage':
          setStages((s) => s.map((cur, i) => (i === focus ? action.stage : cur)));
          break;
        case 'expand-all': setStages(sentences.map(() => 2 as Stage)); break;
        case 'collapse-all': setStages(sentences.map(() => 0 as Stage)); break;
        case 'toggle-read': toggleRead(sentences[focus].id); break;
        case 'toggle-bookmark': toggleBookmark(sentences[focus].id); break;
        case 'toggle-help': /* handled by KeyboardHelp in Task 8 */ break;
        case 'font-size': cycleFontSize(action.direction); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [focus, sentences, toggleRead, toggleBookmark, cycleFontSize]);

  return (
    <div className="space-y-5">
      {sentences.map((s, i) => (
        <SentenceCard
          key={s.id}
          sentence={s}
          stageOverride={stages[i]}
          onStageChange={(stage) => setStages((arr) => arr.map((cur, idx) => (idx === i ? stage : cur)))}
        />
      ))}
    </div>
  );
}
