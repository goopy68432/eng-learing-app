import type { ChunkSpan } from '@/lib/types';

const PALETTE = [
  'bg-indigo-100 dark:bg-indigo-500/20',
  'bg-purple-100 dark:bg-purple-500/20',
  'bg-emerald-100 dark:bg-emerald-500/20',
  'bg-amber-100 dark:bg-amber-500/20',
  'bg-rose-100 dark:bg-rose-500/20',
];

export function BlockChunks({ chunks, note }: { chunks: ChunkSpan[]; note: string }) {
  return (
    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1 ui-sans">청크</div>
      <p className="text-sm font-mono leading-relaxed">
        {chunks.map((c, i) => (
          <span key={i}>
            <span className={`px-1.5 py-0.5 rounded ${PALETTE[i % PALETTE.length]}`}>{c.text}</span>
            {i < chunks.length - 1 && <span className="text-slate-400 mx-1">//</span>}
          </span>
        ))}
      </p>
      {note && <p className="mt-1.5 text-xs text-slate-500">{note}</p>}
    </div>
  );
}
