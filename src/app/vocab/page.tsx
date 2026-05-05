import { Sidebar } from '@/components/Sidebar';
import { VocabList } from '@/components/VocabList';

export default function VocabPage() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 max-w-prose mx-auto px-8 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Vocab</h1>
        <p className="mt-1 text-sm text-slate-500 ui-sans">누적 단어장</p>
        <div className="mt-6"><VocabList /></div>
      </main>
    </div>
  );
}
