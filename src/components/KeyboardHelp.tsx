'use client';
import { useEffect, useState } from 'react';

const ROWS: [string, string][] = [
  ['j / k', '다음/이전 문장'],
  ['0 / 1 / 2', '현재 문장 stage 변경'],
  ['e / c', '모두 펼치기 / 접기'],
  ['b', '북마크 토글'],
  ['space', '읽음 토글'],
  ['+ / -', '본문 글자 크게 / 작게'],
  ['?', '이 도움말'],
];

export function KeyboardHelp() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '?') setOpen((v) => !v);
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40" onClick={() => setOpen(false)}>
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full ui-sans" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-3">단축키</h2>
        <table className="w-full text-sm">
          <tbody>
            {ROWS.map(([k, d]) => (
              <tr key={k}><td className="py-1 font-mono text-slate-500">{k}</td><td className="py-1">{d}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
