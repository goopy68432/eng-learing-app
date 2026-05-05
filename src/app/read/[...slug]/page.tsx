import path from 'node:path';
import { loadAllContent, loadDoc } from '@/lib/content';
import { Sidebar } from '@/components/Sidebar';
import { ReaderHeader } from '@/components/ReaderHeader';
import { SentenceList } from '@/components/SentenceList';
import { KeyboardHelp } from '@/components/KeyboardHelp';
import { UnpairedNotice } from './UnpairedNotice';
import { notFound } from 'next/navigation';

const ROOT = path.resolve(process.cwd(), 'content');

export async function generateStaticParams() {
  const docs = await loadAllContent(ROOT);
  return docs.map((d) => ({ slug: d.slug }));
}

export default async function ReaderPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const doc = await loadDoc(ROOT, slug);
  if (!doc) notFound();

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 min-h-screen">
        {doc.unpaired ? (
          <UnpairedNotice slug={doc.slug} />
        ) : (
          <>
            <ReaderHeader doc={doc} />
            <article className="max-w-prose mx-auto px-8 py-6">
              <SentenceList sentences={doc.sentences} />
              <p className="mt-8 text-center text-xs text-slate-400 ui-sans">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono">e</kbd> 모두 펼치기 ·{' '}
                <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono">c</kbd> 접기 ·{' '}
                <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono">+/-</kbd> 글자 크기 ·{' '}
                <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono">?</kbd> 도움말
              </p>
            </article>
            <KeyboardHelp />
          </>
        )}
      </main>
    </div>
  );
}
