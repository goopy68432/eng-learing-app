import Link from 'next/link';
import type { ContentDoc } from '@/lib/types';

type Tree = { name: string; docs: ContentDoc[]; folders: Tree[] };

export function buildTree(docs: ContentDoc[]): Tree {
  const root: Tree = { name: '', docs: [], folders: [] };
  for (const doc of docs) {
    let node = root;
    for (let i = 0; i < doc.slug.length - 1; i++) {
      const seg = doc.slug[i];
      let next = node.folders.find((f) => f.name === seg);
      if (!next) { next = { name: seg, docs: [], folders: [] }; node.folders.push(next); }
      node = next;
    }
    node.docs.push(doc);
  }
  return root;
}

export function FolderNode({ tree, level = 0 }: { tree: Tree; level?: number }) {
  return (
    <div>
      {tree.folders.map((sub) => (
        <details key={sub.name} open className="mt-1">
          <summary className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
            <span className="text-base">📁</span>
            <span className="font-medium">{sub.name}</span>
          </summary>
          <div className="ml-4">
            <FolderNode tree={sub} level={level + 1} />
          </div>
        </details>
      ))}
      {tree.docs.map((doc) => {
        const href = `/read/${doc.slug.join('/')}`;
        return (
          <Link
            key={doc.slug.join('/')}
            href={href}
            className={`flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${doc.unpaired ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400'}`}
          >
            <span>📄</span>
            <span className="truncate">{doc.slug[doc.slug.length - 1]}</span>
            {doc.unpaired && <span className="ml-auto" title="learn.md 없음">⚠️</span>}
          </Link>
        );
      })}
    </div>
  );
}
