export function BlockNuance({ text }: { text: string }) {
  return (
    <div className="rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 border border-indigo-100 dark:border-indigo-500/20 px-4 py-3">
      <div className="text-[10px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1 ui-sans">💡 원어민 감각</div>
      <p className="text-sm leading-relaxed">{text}</p>
    </div>
  );
}
