import { describe, it, expect } from 'vitest';
import { parseOriginalMd } from '@/lib/parse-original';

const sample = `---
title: "Climate Talks Stall in Geneva"
level: "B1"
---

# Climate Talks Stall in Geneva

Body text.
`;

describe('parseOriginalMd', () => {
  it('extracts title from frontmatter', () => {
    expect(parseOriginalMd(sample).title).toBe('Climate Talks Stall in Geneva');
  });

  it('extracts level', () => {
    expect(parseOriginalMd(sample).level).toBe('B1');
  });

  it('falls back to filename-derived title when frontmatter missing', () => {
    const noFront = '# Heading\n\nBody.';
    expect(parseOriginalMd(noFront, 'climate-2026').title).toBe('climate-2026');
  });
});
