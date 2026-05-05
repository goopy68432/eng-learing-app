export function BlockStructure({ items }: { items: string[] }) {
  return (
    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1 ui-sans">구조</div>
      <ul className="text-sm space-y-0.5">
        {items.map((it, i) => <li key={i}>• {it}</li>)}
      </ul>
    </div>
  );
}
