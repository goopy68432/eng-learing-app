import Link from 'next/link';
import path from 'node:path';
import { loadAllContent } from '@/lib/content';
import { FolderNode, buildTree } from './FolderNode';
import { ThemeToggle } from './ThemeToggle';
import { FontSizeToggle } from './FontSizeToggle';

export async function Sidebar() {
  const docs = await loadAllContent(path.resolve(process.cwd(), 'content'));
  const tree = buildTree(docs);
  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen sticky top-0 ui-sans">
      <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 grid place-items-center text-white text-sm font-bold">E</div>
          <span className="font-semibold tracking-tight">EngReader</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-3 text-sm">
        <div className="px-2 py-1 text-xs uppercase tracking-wider text-slate-500">Content</div>
        <FolderNode tree={tree} />
      </div>
      <div className="border-t border-slate-200 dark:border-slate-800 p-2 space-y-0.5 text-sm">
        <Link href="/bookmarks" className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800">⭐ <span>Bookmarks</span></Link>
        <Link href="/vocab" className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800">📚 <span>Vocab</span></Link>
        <FontSizeToggle />
        <ThemeToggle />
      </div>
    </aside>
  );
}
