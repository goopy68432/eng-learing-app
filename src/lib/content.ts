import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { parseLearnMd } from './parse-learn';
import { parseOriginalMd } from './parse-original';
import { fileToSlug, slugCategory } from './slug';
import type { ContentDoc, Sentence } from './types';

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...(await walk(p)));
    else if (e.isFile() && e.name.endsWith('.md')) files.push(p);
  }
  return files;
}

export async function loadAllContent(contentRoot: string): Promise<ContentDoc[]> {
  const all = await walk(contentRoot);
  const originals = all.filter((p) => !p.endsWith('.learn.md'));
  const learnSet = new Set(all.filter((p) => p.endsWith('.learn.md')));

  const docs: ContentDoc[] = [];
  for (const orig of originals) {
    const slug = fileToSlug(orig, contentRoot);
    const learnPath = orig.replace(/\.md$/, '.learn.md');
    const origRaw = await readFile(orig, 'utf8');
    const meta = parseOriginalMd(origRaw, slug[slug.length - 1]);

    if (!learnSet.has(learnPath)) {
      docs.push({
        slug,
        title: meta.title,
        level: meta.level,
        category: slugCategory(slug),
        source: meta.source,
        sentences: [],
        unpaired: true,
      });
      continue;
    }
    const learnRaw = await readFile(learnPath, 'utf8');
    const parsed = parseLearnMd(learnRaw);
    const slugStr = slug.join('/');
    const sentences: Sentence[] = parsed.sentences.map((s) => ({
      ...s,
      id: `${slugStr}/S${s.index}`,
    }));
    docs.push({
      slug,
      title: meta.title,
      level: meta.level,
      category: slugCategory(slug),
      source: meta.source,
      sentences,
    });
  }
  docs.sort((a, b) => a.slug.join('/').localeCompare(b.slug.join('/')));
  return docs;
}

export async function loadDoc(contentRoot: string, slug: string[]): Promise<ContentDoc | null> {
  const all = await loadAllContent(contentRoot);
  return all.find((d) => d.slug.join('/') === slug.join('/')) ?? null;
}
