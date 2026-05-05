'use client';
import Link from 'next/link';
import { useUserStore } from '@/lib/store';

export function BookmarkList() {
  const bookmarked = useUserStore((s) => s.bookmarked);
  const ids = Object.keys(bookmarked).sort();
  if (ids.length === 0) return <p className="text-slate-500 ui-sans">북마크가 없습니다. 문장의 ⭐를 눌러 추가하세요.</p>;
  return (
    <ul className="space-y-1 ui-sans">
      {ids.map((id) => {
        const parts = id.split('/');
        const sIndex = parts[parts.length - 1];
        const docSlug = parts.slice(0, -1).join('/');
        return (
          <li key={id}>
            <Link href={`/read/${docSlug}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
              {docSlug} <span className="text-xs text-slate-400">{sIndex}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
