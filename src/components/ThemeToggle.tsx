'use client';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const dark = resolvedTheme === 'dark';
  return (
    <button
      aria-label="테마 전환"
      className="px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ui-sans text-sm w-full text-left"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
    >
      {dark ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}
