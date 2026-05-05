'use client';
import { useState } from 'react';
import type { Sentence } from '@/lib/types';
import { useUserStore } from '@/lib/store';
import { BlockTranslation } from './blocks/BlockTranslation';
import { BlockChunks } from './blocks/BlockChunks';
import { BlockStructure } from './blocks/BlockStructure';
import { BlockVocab } from './blocks/BlockVocab';
import { BlockNuance } from './blocks/BlockNuance';

export type Stage = 0 | 1 | 2;

type Props = { sentence: Sentence; stageOverride?: Stage; onStageChange?: (s: Stage) => void };

export function SentenceCard({ sentence, stageOverride, onStageChange }: Props) {
  const [internal, setInternal] = useState<Stage>(0);
  const stage = stageOverride ?? internal;
  const setStage = (s: Stage) => { onStageChange ? onStageChange(s) : setInternal(s); };

  const isRead = useUserStore((s) => !!s.read[sentence.id]);
  const isBookmarked = useUserStore((s) => !!s.bookmarked[sentence.id]);
  const toggleRead = useUserStore((s) => s.toggleRead);
  const toggleBookmark = useUserStore((s) => s.toggleBookmark);

  const borderClass =
    stage === 0 ? 'border-slate-200 dark:border-slate-800'
    : stage === 1 ? 'border-indigo-200 dark:border-indigo-500/30'
    : 'border-purple-200 dark:border-purple-500/30';

  return (
    <section
      data-testid={`sentence-${sentence.index}`}
      data-stage={stage}
      className={`rounded-xl border ${borderClass} bg-white dark:bg-slate-900 p-5 shadow-sm`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xs font-mono text-slate-400 mt-1.5 w-6 shrink-0">S{sentence.index}</span>
        <p className="sentence-original leading-relaxed flex-1">{sentence.original}</p>
        <div className="flex items-center gap-1">
          <button
            aria-label="북마크"
            onClick={() => toggleBookmark(sentence.id)}
            className={`w-8 h-8 rounded grid place-items-center ${isBookmarked ? 'text-amber-500 bg-amber-100 dark:bg-amber-500/15' : 'text-slate-300 hover:text-amber-500'}`}
          >⭐</button>
          <button
            aria-label="읽음"
            onClick={() => toggleRead(sentence.id)}
            className={`w-8 h-8 rounded grid place-items-center ${isRead ? 'text-emerald-500 bg-emerald-100 dark:bg-emerald-500/15' : 'text-slate-300 hover:text-emerald-500'}`}
          >✓</button>
        </div>
      </div>

      {stage >= 1 && (
        <div className="mt-4 pl-9 space-y-3">
          <BlockTranslation text={sentence.translation} />
          <BlockChunks chunks={sentence.chunks} note={sentence.chunksNote} />
        </div>
      )}
      {stage >= 2 && (
        <div className="mt-3 pl-9 space-y-3">
          <BlockStructure items={sentence.structure} />
          <BlockVocab items={sentence.vocab} sentenceId={sentence.id} />
          <BlockNuance text={sentence.nuance} />
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 pl-9">
        {stage < 2 && (
          <button
            onClick={() => setStage((stage + 1) as Stage)}
            className="text-xs text-slate-500 hover:text-indigo-500 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800"
          >▼ {stage + 1}단계 펼치기</button>
        )}
        {stage > 0 && (
          <button
            onClick={() => setStage(0)}
            className="text-xs text-slate-500 hover:text-indigo-500 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800"
          >△ 접기</button>
        )}
      </div>
    </section>
  );
}
