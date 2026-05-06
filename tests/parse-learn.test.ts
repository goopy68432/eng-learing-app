import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parseLearnMd } from '@/lib/parse-learn';

const fixture = readFileSync(
  path.resolve(__dirname, './fixtures/news/climate-2026.learn.md'),
  'utf8'
);

describe('parseLearnMd', () => {
  it('parses frontmatter', () => {
    const result = parseLearnMd(fixture);
    expect(result.frontmatter.source).toBe('climate-2026.md');
    expect(result.frontmatter.sentence_count).toBe(2);
  });

  it('extracts two sentences', () => {
    const { sentences } = parseLearnMd(fixture);
    expect(sentences).toHaveLength(2);
  });

  it('parses S1 original from blockquote', () => {
    const { sentences } = parseLearnMd(fixture);
    expect(sentences[0].original).toBe(
      'Despite the heavy rain, the climbers pressed on toward the summit.'
    );
  });

  it('parses S1 translation', () => {
    const { sentences } = parseLearnMd(fixture);
    expect(sentences[0].translation).toBe(
      '폭우에도 불구하고 등반대는 정상을 향해 계속 나아갔다.'
    );
  });

  it('parses S1 chunks (split on // ) and note', () => {
    const { sentences } = parseLearnMd(fixture);
    expect(sentences[0].chunks.map((c) => c.text)).toEqual([
      'Despite the heavy rain',
      'the climbers',
      'pressed on',
      'toward the summit',
    ]);
    expect(sentences[0].chunksNote).toContain('양보 부사구');
  });

  it('parses S1 structure as bullet array', () => {
    const { sentences } = parseLearnMd(fixture);
    expect(sentences[0].structure).toHaveLength(2);
    expect(sentences[0].structure[0]).toContain('주절');
  });

  it('parses S1 vocab entries', () => {
    const { sentences } = parseLearnMd(fixture);
    expect(sentences[0].vocab).toHaveLength(2);
    expect(sentences[0].vocab[0].word).toBe('press on');
    expect(sentences[0].vocab[0].pos).toBe('phrasal v.');
    expect(sentences[0].vocab[0].meaning).toContain('밀고 나가다');
  });

  it('parses S1 nuance', () => {
    const { sentences } = parseLearnMd(fixture);
    expect(sentences[0].nuance).toContain('despite');
  });
});
