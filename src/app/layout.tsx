import './globals.css';
import type { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { FontSizeApplier } from '@/components/FontSizeApplier';

export const metadata = { title: 'EngReader', description: 'Sentence-level English reading study viewer' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning data-fontsize="md">
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <FontSizeApplier />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
