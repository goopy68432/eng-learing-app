'use client';
import type { ContentDoc } from '@/lib/types';
import { useUserStore } from '@/lib/store';

export function ReaderHeader({ doc }: { doc: ContentDoc }) {
  const read = useUserStore((s) => s.read);
  const total = doc.sentences.length;
  const done = doc.sentences.filter((s) => read[s.id]).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <header className="sticky top-0 z-10 backdrop-blur bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-prose mx-auto px-8 py-4">
        <div className="flex items-center gap-3 text-xs text-slate-500 ui-sans">
          {doc.slug.slice(0, -1).map((seg, i) => <span key={i}>{seg} ›</span>)}
          <span>{doc.slug[doc.slug.length - 1]}</span>
          {doc.level && (
            <span className="ml-auto px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 font-medium">{doc.level}</span>
          )}
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{doc.title}</h1>
        <div className="mt-3 flex items-center gap-3 text-xs text-slate-500 ui-sans">
          <span>{total}문장</span><span>·</span>
          <span>{done} / {total} 읽음</span>
          <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${pct}%` }} />
          </div>
          <span className="font-medium text-slate-600 dark:text-slate-300">{pct}%</span>
        </div>
      </div>
    </header>
  );
}
