import matter from 'gray-matter';

export type OriginalMeta = {
  title: string;
  level?: string;
  source?: string;
};

export function parseOriginalMd(raw: string, fallbackTitle = 'untitled'): OriginalMeta {
  const { data } = matter(raw);
  return {
    title: typeof data.title === 'string' ? data.title : fallbackTitle,
    level: typeof data.level === 'string' ? data.level : undefined,
    source: typeof data.source === 'string' ? data.source : undefined,
  };
}
