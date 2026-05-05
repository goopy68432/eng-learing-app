'use client';
import { useUserStore, type FontSize } from '@/lib/store';

const SIZES: { value: FontSize; label: string; ariaLabel: string }[] = [
  { value: 'sm', label: '가', ariaLabel: '작게' },
  { value: 'md', label: '가', ariaLabel: '보통' },
  { value: 'lg', label: '가', ariaLabel: '크게' },
];

export function FontSizeToggle() {
  const fontSize = useUserStore((s) => s.fontSize);
  const setFontSize = useUserStore((s) => s.setFontSize);
  return (
    <div className="flex items-center gap-1 px-2 py-1.5 ui-sans" role="group" aria-label="본문 글자크기">
      <span className="text-xs text-slate-500 mr-1">크기</span>
      {SIZES.map((s) => {
        const active = fontSize === s.value;
        const sizeClass = s.value === 'sm' ? 'text-xs' : s.value === 'md' ? 'text-sm' : 'text-base';
        return (
          <button
            key={s.value}
            type="button"
            aria-label={s.ariaLabel}
            aria-pressed={active}
            onClick={() => setFontSize(s.value)}
            className={`${sizeClass} w-7 h-7 rounded grid place-items-center transition-colors ${
              active
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >{s.label}</button>
        );
      })}
    </div>
  );
}
