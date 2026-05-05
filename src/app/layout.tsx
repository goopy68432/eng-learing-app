import './globals.css';
import type { ReactNode } from 'react';

export const metadata = { title: 'EngReader', description: 'Sentence-level English reading study viewer' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
