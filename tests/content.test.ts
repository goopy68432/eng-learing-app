import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { loadAllContent } from '@/lib/content';

const root = path.resolve(__dirname, './fixtures');

describe('loadAllContent', () => {
  it('finds 2 docs (paired and unpaired)', async () => {
    const docs = await loadAllContent(root);
    expect(docs).toHaveLength(2);
  });

  it('marks unpaired doc', async () => {
    const docs = await loadAllContent(root);
    const orwell = docs.find((d) => d.slug.join('/').endsWith('orwell-politics'))!;
    expect(orwell.unpaired).toBe(true);
    expect(orwell.sentences).toHaveLength(0);
  });

  it('paired doc has parsed sentences', async () => {
    const docs = await loadAllContent(root);
    const climate = docs.find((d) => d.slug.join('/').endsWith('climate-2026'))!;
    expect(climate.unpaired).toBeFalsy();
    expect(climate.sentences).toHaveLength(2);
    expect(climate.sentences[0].id).toBe('news/climate-2026/S1');
  });

  it('extracts category from first slug segment', async () => {
    const docs = await loadAllContent(root);
    const climate = docs.find((d) => d.slug.join('/').endsWith('climate-2026'))!;
    expect(climate.category).toBe('news');
  });
});
