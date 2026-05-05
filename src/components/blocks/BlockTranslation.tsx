export function BlockTranslation({ text }: { text: string }) {
  return (
    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1 ui-sans">번역</div>
      <p className="text-sm">{text}</p>
    </div>
  );
}
