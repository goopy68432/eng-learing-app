import path from 'node:path';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { loadAllContent } from '@/lib/content';

const ROOT = path.resolve(process.cwd(), 'content');

export default async function Home() {
  const docs = await loadAllContent(ROOT);
  const byCategory = new Map<string, typeof docs>();
  for (const d of docs) {
    const arr = byCategory.get(d.category) ?? [];
    arr.push(d);
    byCategory.set(d.category, arr);
  }
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 max-w-prose mx-auto px-8 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">EngReader</h1>
        <p className="mt-2 text-slate-500 ui-sans">사이드바에서 콘텐츠를 선택하세요.</p>

        {Array.from(byCategory.entries()).map(([cat, list]) => (
          <section key={cat} className="mt-8">
            <h2 className="text-lg font-semibold ui-sans">{cat}</h2>
            <ul className="mt-2 space-y-1">
              {list.map((d) => (
                <li key={d.slug.join('/')}>
                  <Link href={`/read/${d.slug.join('/')}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    {d.title}
                  </Link>
                  {d.unpaired && <span className="ml-2 text-amber-500 text-xs">⚠️ 학습자료 없음</span>}
                  {d.level && <span className="ml-2 text-xs text-slate-500">{d.level}</span>}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}
