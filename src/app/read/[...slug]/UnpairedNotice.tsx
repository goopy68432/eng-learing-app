export function UnpairedNotice({ slug }: { slug: string[] }) {
  const file = `${slug.join('/')}.learn.md`;
  return (
    <div className="max-w-prose mx-auto px-8 py-12 ui-sans">
      <h2 className="text-xl font-semibold">학습자료가 없습니다</h2>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        이 원문에 대응하는 <code className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-1 rounded">{file}</code> 파일이 없습니다.
      </p>
      <p className="mt-4 text-sm text-slate-500">
        프로젝트 루트의 <code className="font-mono">prompts/generate-learn-md.md</code>를 Claude Code에 적용해 학습자료를 생성하고, 같은 폴더에 저장한 뒤 사이트를 다시 빌드해주세요.
      </p>
    </div>
  );
}
