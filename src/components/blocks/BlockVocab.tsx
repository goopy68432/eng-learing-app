'use client';
import type { VocabItem } from '@/lib/types';
import { useUserStore } from '@/lib/store';

export function BlockVocab({ items, sentenceId }: { items: VocabItem[]; sentenceId: string }) {
  const vocab = useUserStore((s) => s.vocab);
  const addVocab = useUserStore((s) => s.addVocab);
  const removeVocab = useUserStore((s) => s.removeVocab);
  return (
    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1 ui-sans">어휘</div>
      <ul className="text-sm space-y-1.5">
        {items.map((v) => {
          const saved = !!vocab[v.word];
          return (
            <li key={v.word}>
              <b>{v.word}</b>{' '}
              {v.pos && <span className="text-xs text-slate-500">{v.pos}</span>}
              {' — '}
              {v.meaning}
              {v.nuance && <span className="text-slate-500"> ({v.nuance})</span>}
              <button
                aria-label={`단어장 ${saved ? '제거' : '추가'}: ${v.word}`}
                className={`ml-2 ${saved ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'}`}
                onClick={() =>
                  saved
                    ? removeVocab(v.word)
                    : addVocab(v.word, {
                        meaning: v.meaning,
                        sourceSentenceId: sentenceId,
                        addedAt: new Date().toISOString().slice(0, 10),
                      })
                }
              >⭐</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
