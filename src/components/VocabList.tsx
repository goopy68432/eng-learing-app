'use client';
import { useUserStore } from '@/lib/store';

export function VocabList() {
  const vocab = useUserStore((s) => s.vocab);
  const removeVocab = useUserStore((s) => s.removeVocab);
  const items = Object.entries(vocab).sort(([a], [b]) => a.localeCompare(b));
  if (items.length === 0) return <p className="text-slate-500 ui-sans">단어장이 비어있습니다. 어휘 블록의 ⭐를 눌러 추가하세요.</p>;
  return (
    <ul className="space-y-2">
      {items.map(([word, entry]) => (
        <li key={word} className="flex items-baseline gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
          <b className="text-lg">{word}</b>
          <span className="text-sm text-slate-700 dark:text-slate-300">{entry.meaning}</span>
          <span className="ml-auto text-xs text-slate-400 ui-sans">{entry.addedAt}</span>
          <button aria-label={`삭제 ${word}`} onClick={() => removeVocab(word)} className="text-xs text-rose-500 ui-sans">삭제</button>
        </li>
      ))}
    </ul>
  );
}
