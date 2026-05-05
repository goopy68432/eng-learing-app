import path from 'node:path';

export function fileToSlug(absPath: string, contentRoot: string): string[] {
  const rel = path.relative(contentRoot, absPath);
  const noExt = rel.replace(/\.md$/, '');
  return noExt.split(path.sep);
}

export function slugToTitle(slug: string[]): string {
  return slug[slug.length - 1] ?? 'untitled';
}

export function slugCategory(slug: string[]): string {
  return slug[0] ?? 'uncategorized';
}

export const DEFAULT_CONTENT_ROOT = 'content';
