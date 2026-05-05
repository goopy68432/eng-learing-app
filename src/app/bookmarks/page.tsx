import { Sidebar } from '@/components/Sidebar';
import { BookmarkList } from '@/components/BookmarkList';

export default function BookmarksPage() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 max-w-prose mx-auto px-8 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Bookmarks</h1>
        <p className="mt-1 text-sm text-slate-500 ui-sans">북마크한 문장</p>
        <div className="mt-6"><BookmarkList /></div>
      </main>
    </div>
  );
}
