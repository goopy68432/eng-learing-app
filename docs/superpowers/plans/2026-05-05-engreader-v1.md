# EngReader v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js static site that pairs `*.md` originals with `*.learn.md` study materials and renders them as 3-stage progressive-reveal sentence cards for Korean A2~B1 English learners.

**Architecture:** Next.js 15 App Router with SSG. All `content/**/*.md` is parsed at build-time into a typed `ContentDoc[]` and turned into static routes. Per-user state (read/bookmark/vocab) lives in `localStorage` via Zustand. App is a pure viewer — `*.learn.md` files are produced externally by the LLM prompt at `prompts/generate-learn-md.md`.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, gray-matter, remark/unified, Zustand (with persist), next-themes, Vitest, Testing Library, Playwright, pnpm.

**Spec:** `docs/superpowers/specs/2026-05-05-engreader-design.md`

---

## File Structure

```
eng_learning_app/
├── package.json                          # pnpm scripts, deps
├── tsconfig.json                         # strict TS, path alias @/*
├── next.config.mjs                       # output: export for static
├── tailwind.config.ts                    # font families from openbook tokens
├── postcss.config.mjs
├── vitest.config.ts                      # node env for parser tests, jsdom for components
├── playwright.config.ts                  # smoke E2E
├── .eslintrc.json
├── content/
│   └── samples/                          # committed fixtures so CI builds
│       ├── news/
│       │   ├── climate-2026.md
│       │   └── climate-2026.learn.md
│       └── essays/
│           └── orwell-politics.md        # intentionally unpaired
├── prompts/generate-learn-md.md          # already exists
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # ThemeProvider, fonts, Sidebar shell
│   │   ├── page.tsx                      # home: category list + recent + progress
│   │   ├── globals.css                   # tailwind + tokens
│   │   ├── read/[...slug]/page.tsx       # SSG reader
│   │   ├── read/[...slug]/unpaired.tsx   # rendered when *.learn.md missing
│   │   ├── vocab/page.tsx                # accumulated vocab
│   │   └── bookmarks/page.tsx
│   ├── components/
│   │   ├── Sidebar.tsx                   # tree nav (server)
│   │   ├── FolderNode.tsx                # recursive folder
│   │   ├── ThemeToggle.tsx               # client
│   │   ├── ReaderHeader.tsx              # title, level, progress bar
│   │   ├── SentenceList.tsx              # client, hosts keyboard handler + focus
│   │   ├── SentenceCard.tsx              # client, owns reveal stage state
│   │   ├── blocks/
│   │   │   ├── BlockTranslation.tsx
│   │   │   ├── BlockChunks.tsx
│   │   │   ├── BlockStructure.tsx
│   │   │   ├── BlockVocab.tsx
│   │   │   └── BlockNuance.tsx
│   │   ├── RightTOC.tsx                  # client (highlights current sentence)
│   │   ├── KeyboardHelp.tsx              # ? modal
│   │   └── VocabTooltip.tsx              # hover tooltip on underlined words
│   ├── lib/
│   │   ├── content.ts                    # build-time MD scan + parse
│   │   ├── parse-learn.ts                # *.learn.md → Sentence[]
│   │   ├── parse-original.ts             # *.md → frontmatter + text
│   │   ├── slug.ts                       # path ↔ slug helpers
│   │   ├── store.ts                      # Zustand + persist
│   │   ├── shortcuts.ts                  # keymap → action
│   │   └── types.ts                      # Sentence, ContentDoc, VocabEntry
│   └── styles/
│       └── tokens.css                    # font-family vars from openbook
├── tests/                                # Vitest unit
│   ├── parse-learn.test.ts
│   ├── parse-original.test.ts
│   ├── content.test.ts
│   ├── store.test.ts
│   └── components/
│       ├── SentenceCard.test.tsx
│       └── SentenceList.test.tsx
├── e2e/
│   └── smoke.spec.ts                     # full user journey
├── .github/workflows/ci.yml              # lint + test + build
└── docs/
    └── superpowers/
        ├── specs/2026-05-05-engreader-design.md
        └── plans/2026-05-05-engreader-v1.md   # this file
```

---

## Task 1: Initialize Next.js + TypeScript + Tailwind project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `.eslintrc.json`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `src/styles/tokens.css`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "engreader",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test"
  },
  "dependencies": {
    "next": "15.0.0",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "gray-matter": "^4.0.3",
    "remark": "^15.0.1",
    "remark-parse": "^11.0.0",
    "unified": "^11.0.5",
    "unist-util-visit": "^5.0.0",
    "zustand": "^5.0.0",
    "next-themes": "^0.4.0",
    "clsx": "^2.1.1"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.6.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "15.0.0",
    "vitest": "^2.1.0",
    "@vitejs/plugin-react": "^4.3.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.5.0",
    "jsdom": "^25.0.0",
    "@playwright/test": "^1.48.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create `next.config.mjs`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
};
export default nextConfig;
```

- [ ] **Step 4: Create `postcss.config.mjs`**

```js
export default { plugins: { tailwindcss: {}, autoprefixer: {} } };
```

- [ ] **Step 5: Create `tailwind.config.ts` (openbook fonts)**

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Source Serif 4"', '"Noto Serif KR"', 'Georgia', '"Iowan Old Style"', 'serif'],
        sans: ['Inter', '"Wanted Sans Variable"', 'Pretendard', '-apple-system', 'system-ui', 'sans-serif'],
        mono: ['"D2Coding"', '"JetBrains Mono"', 'ui-monospace', '"SF Mono"', 'Menlo', 'monospace'],
      },
      maxWidth: { prose: '48rem' },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 6: Create `src/styles/tokens.css`**

```css
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Serif+KR:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600;8..60,700&family=JetBrains+Mono:wght@400;500&display=swap");
@import url("https://cdn.jsdelivr.net/gh/wan2land/d2coding/d2coding.css");

:root {
  --font-serif: "Source Serif 4", "Noto Serif KR", Georgia, "Iowan Old Style", serif;
  --font-sans: "Inter", "Wanted Sans Variable", "Pretendard", -apple-system, system-ui, sans-serif;
  --font-mono: "D2Coding", "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace;
}
```

- [ ] **Step 7: Create `src/app/globals.css`**

```css
@import "../styles/tokens.css";
@tailwind base;
@tailwind components;
@tailwind utilities;

html { font-family: var(--font-serif); -webkit-font-smoothing: antialiased; }
body { margin: 0; }
button, kbd, .ui-sans, aside, header nav { font-family: var(--font-sans); }
code, .font-mono { font-family: var(--font-mono); }
```

- [ ] **Step 8: Create `src/app/layout.tsx` (placeholder, will expand later)**

```tsx
import './globals.css';
import type { ReactNode } from 'react';

export const metadata = { title: 'EngReader', description: 'Sentence-level English reading study viewer' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 9: Create `src/app/page.tsx` (stub, real content in Task 9)**

```tsx
export default function Home() {
  return <main className="p-8"><h1 className="text-2xl font-semibold">EngReader</h1></main>;
}
```

- [ ] **Step 10: Create `.eslintrc.json`**

```json
{ "extends": "next/core-web-vitals" }
```

- [ ] **Step 11: Install and verify dev server boots**

Run:
```
pnpm install
pnpm dev
```
Expected: server on `http://localhost:3000`, "EngReader" heading renders. Stop the server (Ctrl-C).

- [ ] **Step 12: Run typecheck**

Run: `pnpm typecheck`
Expected: no errors.

- [ ] **Step 13: Commit**

```bash
git add package.json pnpm-lock.yaml tsconfig.json next.config.mjs tailwind.config.ts postcss.config.mjs .eslintrc.json src/app/layout.tsx src/app/page.tsx src/app/globals.css src/styles/tokens.css
git commit -m "feat: scaffold Next.js 15 + Tailwind with openbook font tokens"
```

---

## Task 2: Add types and Vitest configuration

**Files:**
- Create: `src/lib/types.ts`, `vitest.config.ts`, `tests/setup.ts`

- [ ] **Step 1: Create `src/lib/types.ts`**

```ts
export type ChunkSpan = { text: string; role?: string };

export type VocabItem = {
  word: string;
  pos?: string;
  meaning: string;
  nuance?: string;
};

export type Sentence = {
  id: string;          // "<slug>/S<index>", e.g. "news/climate-2026/S1"
  index: number;       // 1-based
  original: string;
  translation: string;
  chunks: ChunkSpan[];
  chunksNote: string;  // line under chunks
  structure: string[]; // bullet items
  vocab: VocabItem[];
  nuance: string;
};

export type ContentDoc = {
  slug: string[];      // ["news", "climate-2026"]
  title: string;
  level?: string;
  category: string;    // first segment of slug
  source?: string;
  sentences: Sentence[];
  unpaired?: boolean;
};

export type VocabEntry = {
  meaning: string;
  sourceSentenceId: string;
  addedAt: string;     // ISO date
};
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
  },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});
```

- [ ] **Step 3: Create `tests/setup.ts`**

```ts
import '@testing-library/jest-dom';
```

- [ ] **Step 4: Add a smoke test to verify Vitest works**

Create `tests/smoke.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
describe('smoke', () => {
  it('runs', () => { expect(1 + 1).toBe(2); });
});
```

- [ ] **Step 5: Run tests**

Run: `pnpm test`
Expected: 1 passed.

- [ ] **Step 6: Commit**

```bash
git add src/lib/types.ts vitest.config.ts tests/setup.ts tests/smoke.test.ts
git commit -m "feat: add core types and Vitest config"
```

---

## Task 3: Parse `*.learn.md` into Sentence[]

**Files:**
- Create: `src/lib/parse-learn.ts`, `tests/parse-learn.test.ts`, `content/samples/news/climate-2026.learn.md`

- [ ] **Step 1: Create the fixture `content/samples/news/climate-2026.learn.md`**

```markdown
---
source: "climate-2026.md"
generated_at: "2026-05-05"
sentence_count: 2
---

## S1
> Despite the heavy rain, the climbers pressed on toward the summit.

### 번역
폭우에도 불구하고 등반대는 정상을 향해 계속 나아갔다.

### 청크
`Despite the heavy rain` // `the climbers` // `pressed on` // `toward the summit`
[양보 부사구][주어][동사구][방향 부사구]의 흐름.

### 구조
- 주절: the climbers (S) / pressed on (V)
- 부사구: Despite the heavy rain (양보), toward the summit (방향)

### 어휘
- **press on** *(phrasal v.)*: 어려움에도 계속 밀고 나가다 — *carry on*보다 의지가 강함
- **summit** *(n.)*: (산의) 정상; 비유적 "정점"

### 감각
"despite + 명사구"는 although절보다 문어적·간결. 뉴스/논픽션에서 빈출.

## S2
> The negotiations, however, made little progress.

### 번역
하지만 협상은 거의 진전이 없었다.

### 청크
`The negotiations` // `however` // `made little progress`
삽입어 however가 콤마 사이.

### 구조
- 주절: The negotiations (S) / made (V) / little progress (O)
- 삽입 부사: however

### 어휘
- **make progress** *(idiom)*: 진전을 이루다
- **little** *(quantifier)*: 거의 ~없는 (부정적 의미)

### 감각
"however"가 문장 중간에 콤마 사이로 들어가면 약한 대조. 격식 있는 문어체.
```

- [ ] **Step 2: Write failing test `tests/parse-learn.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parseLearnMd } from '@/lib/parse-learn';

const fixture = readFileSync(
  path.resolve(__dirname, '../content/samples/news/climate-2026.learn.md'),
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
```

- [ ] **Step 3: Run test, verify failure**

Run: `pnpm test parse-learn`
Expected: FAIL — `parseLearnMd is not defined`.

- [ ] **Step 4: Implement `src/lib/parse-learn.ts`**

```ts
import matter from 'gray-matter';
import type { Sentence, ChunkSpan, VocabItem } from './types';

export type LearnFrontmatter = {
  source?: string;
  generated_at?: string;
  sentence_count?: number;
};

export type ParsedLearn = {
  frontmatter: LearnFrontmatter;
  sentences: Omit<Sentence, 'id'>[];
};

const SENTENCE_HEADING = /^##\s+S(\d+)\s*$/m;

export function parseLearnMd(raw: string): ParsedLearn {
  const { data, content } = matter(raw);
  const frontmatter = data as LearnFrontmatter;

  // split body on "## S<n>" headings
  const blocks: { index: number; body: string }[] = [];
  const lines = content.split('\n');
  let current: { index: number; body: string[] } | null = null;
  for (const line of lines) {
    const m = line.match(/^##\s+S(\d+)\s*$/);
    if (m) {
      if (current) blocks.push({ index: current.index, body: current.body.join('\n') });
      current = { index: parseInt(m[1], 10), body: [] };
    } else if (current) {
      current.body.push(line);
    }
  }
  if (current) blocks.push({ index: current.index, body: current.body.join('\n') });

  const sentences = blocks.map(({ index, body }) => parseOneSentence(index, body));
  return { frontmatter, sentences };
}

function parseOneSentence(index: number, body: string): Omit<Sentence, 'id'> {
  const sections = splitOnSubheadings(body);
  const original = extractOriginal(sections.preamble);
  const translation = sections['번역']?.trim() ?? '';
  const { chunks, chunksNote } = parseChunks(sections['청크'] ?? '');
  const structure = parseBullets(sections['구조'] ?? '');
  const vocab = parseVocab(sections['어휘'] ?? '');
  const nuance = (sections['감각'] ?? '').trim();
  return {
    index, original, translation, chunks, chunksNote, structure, vocab, nuance,
  };
}

function splitOnSubheadings(body: string): { preamble: string } & Record<string, string> {
  const result: { preamble: string } & Record<string, string> = { preamble: '' };
  const lines = body.split('\n');
  let currentKey = 'preamble';
  let buffer: string[] = [];
  const flush = () => { result[currentKey] = buffer.join('\n'); buffer = []; };
  for (const line of lines) {
    const m = line.match(/^###\s+(번역|청크|구조|어휘|감각)\s*$/);
    if (m) { flush(); currentKey = m[1]; }
    else { buffer.push(line); }
  }
  flush();
  return result;
}

function extractOriginal(preamble: string): string {
  const line = preamble.split('\n').find((l) => l.startsWith('> '));
  return line ? line.replace(/^>\s+/, '').trim() : '';
}

function parseChunks(section: string): { chunks: ChunkSpan[]; chunksNote: string } {
  const lines = section.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return { chunks: [], chunksNote: '' };
  const chunkLine = lines[0];
  const chunks = chunkLine
    .split('//')
    .map((s) => s.trim().replace(/^`|`$/g, ''))
    .filter(Boolean)
    .map((text) => ({ text }));
  const chunksNote = lines.slice(1).join(' ').trim();
  return { chunks, chunksNote };
}

function parseBullets(section: string): string[] {
  return section
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('- '))
    .map((l) => l.slice(2).trim());
}

function parseVocab(section: string): VocabItem[] {
  const items: VocabItem[] = [];
  for (const raw of section.split('\n')) {
    const line = raw.trim();
    if (!line.startsWith('- ')) continue;
    const body = line.slice(2);
    // **word** *(pos)*: meaning — nuance?
    const m = body.match(/^\*\*([^*]+)\*\*\s*(?:\*\(([^)]+)\)\*)?\s*:\s*([^—]+?)(?:\s+—\s+(.+))?$/);
    if (!m) continue;
    items.push({
      word: m[1].trim(),
      pos: m[2]?.trim(),
      meaning: m[3].trim(),
      nuance: m[4]?.trim(),
    });
  }
  return items;
}
```

- [ ] **Step 5: Run test**

Run: `pnpm test parse-learn`
Expected: all 7 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/parse-learn.ts tests/parse-learn.test.ts content/samples/news/climate-2026.learn.md
git commit -m "feat(parse): parse *.learn.md into Sentence[]"
```

---

## Task 4: Parse original `*.md` and pair files

**Files:**
- Create: `src/lib/parse-original.ts`, `src/lib/content.ts`, `src/lib/slug.ts`, `tests/parse-original.test.ts`, `tests/content.test.ts`, `content/samples/news/climate-2026.md`, `content/samples/essays/orwell-politics.md`

- [ ] **Step 1: Create `content/samples/news/climate-2026.md`**

```markdown
---
title: "Climate Talks Stall in Geneva"
source: "Reuters, 2026-04-30"
level: "B1"
---

# Climate Talks Stall in Geneva

Despite the heavy rain, the climbers pressed on toward the summit.
The negotiations, however, made little progress.
```

- [ ] **Step 2: Create `content/samples/essays/orwell-politics.md` (intentionally unpaired)**

```markdown
---
title: "Politics and the English Language (excerpt)"
level: "B2"
---

# Politics and the English Language

Most people who bother with the matter at all would admit that the English language is in a bad way.
```

- [ ] **Step 3: Write failing test `tests/parse-original.test.ts`**

```ts
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
```

- [ ] **Step 4: Implement `src/lib/parse-original.ts`**

```ts
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
```

- [ ] **Step 5: Run test**

Run: `pnpm test parse-original`
Expected: 3 passed.

- [ ] **Step 6: Implement `src/lib/slug.ts`**

```ts
import path from 'node:path';

const CONTENT_ROOT = 'content';

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

export const DEFAULT_CONTENT_ROOT = CONTENT_ROOT;
```

- [ ] **Step 7: Write failing test `tests/content.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { loadAllContent } from '@/lib/content';

const root = path.resolve(__dirname, '../content/samples');

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
```

- [ ] **Step 8: Run test, verify failure**

Run: `pnpm test content`
Expected: FAIL — `loadAllContent is not defined`.

- [ ] **Step 9: Implement `src/lib/content.ts`**

```ts
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
```

- [ ] **Step 10: Run all tests**

Run: `pnpm test`
Expected: all green (smoke + parse-learn + parse-original + content).

- [ ] **Step 11: Commit**

```bash
git add src/lib/parse-original.ts src/lib/content.ts src/lib/slug.ts tests/parse-original.test.ts tests/content.test.ts content/samples/news/climate-2026.md content/samples/essays/orwell-politics.md
git commit -m "feat(content): scan and pair *.md with *.learn.md"
```

---

## Task 5: Zustand store for read/bookmark/vocab with localStorage

**Files:**
- Create: `src/lib/store.ts`, `tests/store.test.ts`

- [ ] **Step 1: Write failing test `tests/store.test.ts`**

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useUserStore } from '@/lib/store';

describe('useUserStore', () => {
  beforeEach(() => {
    useUserStore.setState({ read: {}, bookmarked: {}, vocab: {} });
    localStorage.clear();
  });

  it('toggles read', () => {
    useUserStore.getState().toggleRead('news/x/S1');
    expect(useUserStore.getState().read['news/x/S1']).toBe(true);
    useUserStore.getState().toggleRead('news/x/S1');
    expect(useUserStore.getState().read['news/x/S1']).toBeFalsy();
  });

  it('toggles bookmark', () => {
    useUserStore.getState().toggleBookmark('news/x/S1');
    expect(useUserStore.getState().bookmarked['news/x/S1']).toBe(true);
  });

  it('adds and removes vocab', () => {
    useUserStore.getState().addVocab('press on', {
      meaning: 'continue', sourceSentenceId: 'news/x/S1', addedAt: '2026-05-05',
    });
    expect(useUserStore.getState().vocab['press on'].meaning).toBe('continue');
    useUserStore.getState().removeVocab('press on');
    expect(useUserStore.getState().vocab['press on']).toBeUndefined();
  });

  it('persists to localStorage under engreader:user-state:v1', () => {
    useUserStore.getState().toggleRead('a');
    const raw = localStorage.getItem('engreader:user-state:v1');
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!).state.read.a).toBe(true);
  });
});
```

- [ ] **Step 2: Run test, verify failure**

Run: `pnpm test store`
Expected: FAIL — module missing.

- [ ] **Step 3: Implement `src/lib/store.ts`**

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { VocabEntry } from './types';

type UserState = {
  read: Record<string, boolean>;
  bookmarked: Record<string, boolean>;
  vocab: Record<string, VocabEntry>;
  toggleRead: (sentenceId: string) => void;
  toggleBookmark: (sentenceId: string) => void;
  addVocab: (word: string, entry: VocabEntry) => void;
  removeVocab: (word: string) => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      read: {},
      bookmarked: {},
      vocab: {},
      toggleRead: (id) =>
        set((s) => {
          const next = { ...s.read };
          if (next[id]) delete next[id];
          else next[id] = true;
          return { read: next };
        }),
      toggleBookmark: (id) =>
        set((s) => {
          const next = { ...s.bookmarked };
          if (next[id]) delete next[id];
          else next[id] = true;
          return { bookmarked: next };
        }),
      addVocab: (word, entry) =>
        set((s) => ({ vocab: { ...s.vocab, [word]: entry } })),
      removeVocab: (word) =>
        set((s) => {
          const next = { ...s.vocab };
          delete next[word];
          return { vocab: next };
        }),
    }),
    { name: 'engreader:user-state:v1' }
  )
);
```

- [ ] **Step 4: Run test**

Run: `pnpm test store`
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/store.ts tests/store.test.ts
git commit -m "feat(store): Zustand+persist for read/bookmark/vocab"
```

---

## Task 6: Reveal-stage SentenceCard component

**Files:**
- Create: `src/components/SentenceCard.tsx`, `src/components/blocks/BlockTranslation.tsx`, `src/components/blocks/BlockChunks.tsx`, `src/components/blocks/BlockStructure.tsx`, `src/components/blocks/BlockVocab.tsx`, `src/components/blocks/BlockNuance.tsx`, `tests/components/SentenceCard.test.tsx`

- [ ] **Step 1: Write failing test `tests/components/SentenceCard.test.tsx`**

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SentenceCard } from '@/components/SentenceCard';
import { useUserStore } from '@/lib/store';
import type { Sentence } from '@/lib/types';

const s: Sentence = {
  id: 'news/climate-2026/S1',
  index: 1,
  original: 'Despite the heavy rain, the climbers pressed on toward the summit.',
  translation: '폭우에도 불구하고 등반대는 정상을 향해 계속 나아갔다.',
  chunks: [
    { text: 'Despite the heavy rain' },
    { text: 'the climbers' },
    { text: 'pressed on' },
    { text: 'toward the summit' },
  ],
  chunksNote: '양보 부사구.',
  structure: ['주절: the climbers / pressed on'],
  vocab: [{ word: 'press on', pos: 'phrasal v.', meaning: '계속 나아가다' }],
  nuance: 'despite는 문어적.',
};

describe('SentenceCard', () => {
  beforeEach(() => {
    useUserStore.setState({ read: {}, bookmarked: {}, vocab: {} });
  });

  it('renders original at stage 0 only', () => {
    render(<SentenceCard sentence={s} />);
    expect(screen.getByText(/Despite the heavy rain/)).toBeInTheDocument();
    expect(screen.queryByText(s.translation)).not.toBeInTheDocument();
  });

  it('shows translation+chunks at stage 1', () => {
    render(<SentenceCard sentence={s} />);
    fireEvent.click(screen.getByRole('button', { name: /1단계 펼치기/ }));
    expect(screen.getByText(s.translation)).toBeInTheDocument();
    expect(screen.queryByText(/despite는 문어적/)).not.toBeInTheDocument();
  });

  it('shows all 5 blocks at stage 2', () => {
    render(<SentenceCard sentence={s} />);
    fireEvent.click(screen.getByRole('button', { name: /1단계 펼치기/ }));
    fireEvent.click(screen.getByRole('button', { name: /2단계 펼치기/ }));
    expect(screen.getByText(s.translation)).toBeInTheDocument();
    expect(screen.getByText(/주절: the climbers/)).toBeInTheDocument();
    expect(screen.getByText(/계속 나아가다/)).toBeInTheDocument();
    expect(screen.getByText(/despite는 문어적/)).toBeInTheDocument();
  });

  it('toggles read state when ✓ clicked', () => {
    render(<SentenceCard sentence={s} />);
    fireEvent.click(screen.getByRole('button', { name: /읽음/ }));
    expect(useUserStore.getState().read[s.id]).toBe(true);
  });

  it('toggles bookmark when ⭐ clicked', () => {
    render(<SentenceCard sentence={s} />);
    fireEvent.click(screen.getByRole('button', { name: /북마크/ }));
    expect(useUserStore.getState().bookmarked[s.id]).toBe(true);
  });
});
```

- [ ] **Step 2: Run test, verify failure**

Run: `pnpm test SentenceCard`
Expected: FAIL — module missing.

- [ ] **Step 3: Implement `src/components/blocks/BlockTranslation.tsx`**

```tsx
export function BlockTranslation({ text }: { text: string }) {
  return (
    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1 ui-sans">번역</div>
      <p className="text-sm">{text}</p>
    </div>
  );
}
```

- [ ] **Step 4: Implement `src/components/blocks/BlockChunks.tsx`**

```tsx
import type { ChunkSpan } from '@/lib/types';

const PALETTE = [
  'bg-indigo-100 dark:bg-indigo-500/20',
  'bg-purple-100 dark:bg-purple-500/20',
  'bg-emerald-100 dark:bg-emerald-500/20',
  'bg-amber-100 dark:bg-amber-500/20',
  'bg-rose-100 dark:bg-rose-500/20',
];

export function BlockChunks({ chunks, note }: { chunks: ChunkSpan[]; note: string }) {
  return (
    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1 ui-sans">청크</div>
      <p className="text-sm font-mono leading-relaxed">
        {chunks.map((c, i) => (
          <span key={i}>
            <span className={`px-1.5 py-0.5 rounded ${PALETTE[i % PALETTE.length]}`}>{c.text}</span>
            {i < chunks.length - 1 && <span className="text-slate-400 mx-1">//</span>}
          </span>
        ))}
      </p>
      {note && <p className="mt-1.5 text-xs text-slate-500">{note}</p>}
    </div>
  );
}
```

- [ ] **Step 5: Implement `src/components/blocks/BlockStructure.tsx`**

```tsx
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
```

- [ ] **Step 6: Implement `src/components/blocks/BlockVocab.tsx`**

```tsx
'use client';
import type { VocabItem } from '@/lib/types';
import { useUserStore } from '@/lib/store';

export function BlockVocab({ items, sentenceId }: { items: VocabItem[]; sentenceId: string }) {
  const vocab = useUserStore((s) => s.vocab);
  const addVocab = useUserStore((s) => s.addVocab);
  const removeVocab = useUserStore((s) => s.removeVocab);
  return (
    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1 ui-sans">어휘</div>
      <ul className="text-sm space-y-1.5">
        {items.map((v) => {
          const saved = !!vocab[v.word];
          return (
            <li key={v.word}>
              <b>{v.word}</b>{' '}
              {v.pos && <span className="text-xs text-slate-500">{v.pos}</span>}
              {' — '}
              {v.meaning}
              {v.nuance && <span className="text-slate-500"> ({v.nuance})</span>}
              <button
                aria-label={`단어장 ${saved ? '제거' : '추가'}: ${v.word}`}
                className={`ml-2 ${saved ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'}`}
                onClick={() =>
                  saved
                    ? removeVocab(v.word)
                    : addVocab(v.word, {
                        meaning: v.meaning,
                        sourceSentenceId: sentenceId,
                        addedAt: new Date().toISOString().slice(0, 10),
                      })
                }
              >⭐</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

- [ ] **Step 7: Implement `src/components/blocks/BlockNuance.tsx`**

```tsx
export function BlockNuance({ text }: { text: string }) {
  return (
    <div className="rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 border border-indigo-100 dark:border-indigo-500/20 px-4 py-3">
      <div className="text-[10px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1 ui-sans">💡 원어민 감각</div>
      <p className="text-sm leading-relaxed">{text}</p>
    </div>
  );
}
```

- [ ] **Step 8: Implement `src/components/SentenceCard.tsx`**

```tsx
'use client';
import { useState } from 'react';
import type { Sentence } from '@/lib/types';
import { useUserStore } from '@/lib/store';
import { BlockTranslation } from './blocks/BlockTranslation';
import { BlockChunks } from './blocks/BlockChunks';
import { BlockStructure } from './blocks/BlockStructure';
import { BlockVocab } from './blocks/BlockVocab';
import { BlockNuance } from './blocks/BlockNuance';

export type Stage = 0 | 1 | 2;

type Props = { sentence: Sentence; stageOverride?: Stage; onStageChange?: (s: Stage) => void };

export function SentenceCard({ sentence, stageOverride, onStageChange }: Props) {
  const [internal, setInternal] = useState<Stage>(0);
  const stage = stageOverride ?? internal;
  const setStage = (s: Stage) => { onStageChange ? onStageChange(s) : setInternal(s); };

  const isRead = useUserStore((s) => !!s.read[sentence.id]);
  const isBookmarked = useUserStore((s) => !!s.bookmarked[sentence.id]);
  const toggleRead = useUserStore((s) => s.toggleRead);
  const toggleBookmark = useUserStore((s) => s.toggleBookmark);

  const borderClass =
    stage === 0 ? 'border-slate-200 dark:border-slate-800'
    : stage === 1 ? 'border-indigo-200 dark:border-indigo-500/30'
    : 'border-purple-200 dark:border-purple-500/30';

  return (
    <section
      data-testid={`sentence-${sentence.index}`}
      data-stage={stage}
      className={`rounded-xl border ${borderClass} bg-white dark:bg-slate-900 p-5 shadow-sm`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xs font-mono text-slate-400 mt-1.5 w-6 shrink-0">S{sentence.index}</span>
        <p className="text-lg leading-relaxed flex-1">{sentence.original}</p>
        <div className="flex items-center gap-1">
          <button
            aria-label="북마크"
            onClick={() => toggleBookmark(sentence.id)}
            className={`w-8 h-8 rounded grid place-items-center ${isBookmarked ? 'text-amber-500 bg-amber-100 dark:bg-amber-500/15' : 'text-slate-300 hover:text-amber-500'}`}
          >⭐</button>
          <button
            aria-label="읽음"
            onClick={() => toggleRead(sentence.id)}
            className={`w-8 h-8 rounded grid place-items-center ${isRead ? 'text-emerald-500 bg-emerald-100 dark:bg-emerald-500/15' : 'text-slate-300 hover:text-emerald-500'}`}
          >✓</button>
        </div>
      </div>

      {stage >= 1 && (
        <div className="mt-4 pl-9 space-y-3">
          <BlockTranslation text={sentence.translation} />
          <BlockChunks chunks={sentence.chunks} note={sentence.chunksNote} />
        </div>
      )}
      {stage >= 2 && (
        <div className="mt-3 pl-9 space-y-3">
          <BlockStructure items={sentence.structure} />
          <BlockVocab items={sentence.vocab} sentenceId={sentence.id} />
          <BlockNuance text={sentence.nuance} />
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 pl-9">
        {stage < 2 && (
          <button
            onClick={() => setStage((stage + 1) as Stage)}
            className="text-xs text-slate-500 hover:text-indigo-500 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800"
          >▼ {stage + 1}단계 펼치기</button>
        )}
        {stage > 0 && (
          <button
            onClick={() => setStage(0)}
            className="text-xs text-slate-500 hover:text-indigo-500 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800"
          >△ 접기</button>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 9: Run test**

Run: `pnpm test SentenceCard`
Expected: 5 passed.

- [ ] **Step 10: Commit**

```bash
git add src/components/SentenceCard.tsx src/components/blocks tests/components/SentenceCard.test.tsx
git commit -m "feat(ui): SentenceCard with 3-stage reveal and 5 blocks"
```

---

## Task 7: SentenceList with keyboard shortcuts

**Files:**
- Create: `src/components/SentenceList.tsx`, `src/lib/shortcuts.ts`, `tests/components/SentenceList.test.tsx`

- [ ] **Step 1: Implement `src/lib/shortcuts.ts`**

```ts
export type Action =
  | { type: 'focus-next' }
  | { type: 'focus-prev' }
  | { type: 'set-stage'; stage: 0 | 1 | 2 }
  | { type: 'expand-all' }
  | { type: 'collapse-all' }
  | { type: 'toggle-bookmark' }
  | { type: 'toggle-read' }
  | { type: 'toggle-help' };

export function keyToAction(key: string): Action | null {
  switch (key) {
    case 'j': return { type: 'focus-next' };
    case 'k': return { type: 'focus-prev' };
    case '0': return { type: 'set-stage', stage: 0 };
    case '1': return { type: 'set-stage', stage: 1 };
    case '2': return { type: 'set-stage', stage: 2 };
    case 'e': return { type: 'expand-all' };
    case 'c': return { type: 'collapse-all' };
    case 'b': return { type: 'toggle-bookmark' };
    case ' ': return { type: 'toggle-read' };
    case '?': return { type: 'toggle-help' };
    default: return null;
  }
}
```

- [ ] **Step 2: Write failing test `tests/components/SentenceList.test.tsx`**

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SentenceList } from '@/components/SentenceList';
import { useUserStore } from '@/lib/store';
import type { Sentence } from '@/lib/types';

const make = (i: number): Sentence => ({
  id: `t/d/S${i}`, index: i, original: `S${i} text.`, translation: `번역${i}`,
  chunks: [{ text: 'a' }, { text: 'b' }], chunksNote: '', structure: ['x'],
  vocab: [{ word: 'w', meaning: 'm' }], nuance: 'n',
});
const fixture = [make(1), make(2), make(3)];

describe('SentenceList', () => {
  beforeEach(() => useUserStore.setState({ read: {}, bookmarked: {}, vocab: {} }));

  it('renders all sentences', () => {
    render(<SentenceList sentences={fixture} />);
    expect(screen.getAllByTestId(/^sentence-/)).toHaveLength(3);
  });

  it('e key expands all to stage 2', () => {
    render(<SentenceList sentences={fixture} />);
    fireEvent.keyDown(window, { key: 'e' });
    for (const card of screen.getAllByTestId(/^sentence-/)) {
      expect(card.dataset.stage).toBe('2');
    }
  });

  it('c key collapses all to stage 0', () => {
    render(<SentenceList sentences={fixture} />);
    fireEvent.keyDown(window, { key: 'e' });
    fireEvent.keyDown(window, { key: 'c' });
    for (const card of screen.getAllByTestId(/^sentence-/)) {
      expect(card.dataset.stage).toBe('0');
    }
  });

  it('space toggles read on focused sentence', () => {
    render(<SentenceList sentences={fixture} />);
    fireEvent.keyDown(window, { key: ' ' });
    expect(useUserStore.getState().read['t/d/S1']).toBe(true);
  });

  it('j moves focus to next', () => {
    render(<SentenceList sentences={fixture} />);
    fireEvent.keyDown(window, { key: 'j' });
    fireEvent.keyDown(window, { key: 'b' });
    expect(useUserStore.getState().bookmarked['t/d/S2']).toBe(true);
  });
});
```

- [ ] **Step 3: Run test, verify failure**

Run: `pnpm test SentenceList`
Expected: FAIL.

- [ ] **Step 4: Implement `src/components/SentenceList.tsx`**

```tsx
'use client';
import { useEffect, useState } from 'react';
import { SentenceCard, type Stage } from './SentenceCard';
import type { Sentence } from '@/lib/types';
import { keyToAction } from '@/lib/shortcuts';
import { useUserStore } from '@/lib/store';

export function SentenceList({ sentences }: { sentences: Sentence[] }) {
  const [stages, setStages] = useState<Stage[]>(() => sentences.map(() => 0 as Stage));
  const [focus, setFocus] = useState(0);

  const toggleRead = useUserStore((s) => s.toggleRead);
  const toggleBookmark = useUserStore((s) => s.toggleBookmark);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // ignore when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const action = keyToAction(e.key);
      if (!action) return;
      e.preventDefault();
      switch (action.type) {
        case 'focus-next': setFocus((f) => Math.min(f + 1, sentences.length - 1)); break;
        case 'focus-prev': setFocus((f) => Math.max(f - 1, 0)); break;
        case 'set-stage':
          setStages((s) => s.map((cur, i) => (i === focus ? action.stage : cur)));
          break;
        case 'expand-all': setStages(sentences.map(() => 2 as Stage)); break;
        case 'collapse-all': setStages(sentences.map(() => 0 as Stage)); break;
        case 'toggle-read': toggleRead(sentences[focus].id); break;
        case 'toggle-bookmark': toggleBookmark(sentences[focus].id); break;
        case 'toggle-help': /* handled by KeyboardHelp in Task 8 */ break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [focus, sentences, toggleRead, toggleBookmark]);

  return (
    <div className="space-y-5">
      {sentences.map((s, i) => (
        <SentenceCard
          key={s.id}
          sentence={s}
          stageOverride={stages[i]}
          onStageChange={(stage) => setStages((arr) => arr.map((cur, idx) => (idx === i ? stage : cur)))}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Run test**

Run: `pnpm test SentenceList`
Expected: 5 passed.

- [ ] **Step 6: Commit**

```bash
git add src/components/SentenceList.tsx src/lib/shortcuts.ts tests/components/SentenceList.test.tsx
git commit -m "feat(ui): SentenceList with keyboard shortcuts"
```

---

## Task 8: Theme provider, KeyboardHelp modal, ReaderHeader

**Files:**
- Create: `src/components/ThemeToggle.tsx`, `src/components/KeyboardHelp.tsx`, `src/components/ReaderHeader.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Update `src/app/layout.tsx` to add ThemeProvider**

```tsx
import './globals.css';
import type { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';

export const metadata = { title: 'EngReader', description: 'Sentence-level English reading study viewer' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Create `src/components/ThemeToggle.tsx`**

```tsx
'use client';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const dark = resolvedTheme === 'dark';
  return (
    <button
      aria-label="테마 전환"
      className="px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ui-sans text-sm"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
    >
      {dark ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}
```

- [ ] **Step 3: Create `src/components/KeyboardHelp.tsx`**

```tsx
'use client';
import { useEffect, useState } from 'react';

const ROWS: [string, string][] = [
  ['j / k', '다음/이전 문장'],
  ['0 / 1 / 2', '현재 문장 stage 변경'],
  ['e / c', '모두 펼치기 / 접기'],
  ['b', '북마크 토글'],
  ['space', '읽음 토글'],
  ['?', '이 도움말'],
];

export function KeyboardHelp() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '?') setOpen((v) => !v);
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40" onClick={() => setOpen(false)}>
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full ui-sans" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-3">단축키</h2>
        <table className="w-full text-sm">
          <tbody>
            {ROWS.map(([k, d]) => (
              <tr key={k}><td className="py-1 font-mono text-slate-500">{k}</td><td className="py-1">{d}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/components/ReaderHeader.tsx`**

```tsx
'use client';
import type { ContentDoc } from '@/lib/types';
import { useUserStore } from '@/lib/store';

export function ReaderHeader({ doc }: { doc: ContentDoc }) {
  const read = useUserStore((s) => s.read);
  const total = doc.sentences.length;
  const done = doc.sentences.filter((s) => read[s.id]).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <header className="sticky top-0 z-10 backdrop-blur bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-prose mx-auto px-8 py-4">
        <div className="flex items-center gap-3 text-xs text-slate-500 ui-sans">
          {doc.slug.slice(0, -1).map((seg, i) => <span key={i}>{seg} ›</span>)}
          <span>{doc.slug[doc.slug.length - 1]}</span>
          {doc.level && (
            <span className="ml-auto px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 font-medium">{doc.level}</span>
          )}
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{doc.title}</h1>
        <div className="mt-3 flex items-center gap-3 text-xs text-slate-500 ui-sans">
          <span>{total}문장</span><span>·</span>
          <span>{done} / {total} 읽음</span>
          <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${pct}%` }} />
          </div>
          <span className="font-medium text-slate-600 dark:text-slate-300">{pct}%</span>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 5: Verify build**

Run: `pnpm typecheck && pnpm test`
Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add src/app/layout.tsx src/components/ThemeToggle.tsx src/components/KeyboardHelp.tsx src/components/ReaderHeader.tsx
git commit -m "feat(ui): theme provider, keyboard help modal, reader header"
```

---

## Task 9: Sidebar tree navigation

**Files:**
- Create: `src/components/Sidebar.tsx`, `src/components/FolderNode.tsx`

- [ ] **Step 1: Create `src/components/FolderNode.tsx`**

```tsx
import Link from 'next/link';
import type { ContentDoc } from '@/lib/types';

type Tree = { name: string; docs: ContentDoc[]; folders: Tree[] };

export function buildTree(docs: ContentDoc[]): Tree {
  const root: Tree = { name: '', docs: [], folders: [] };
  for (const doc of docs) {
    let node = root;
    for (let i = 0; i < doc.slug.length - 1; i++) {
      const seg = doc.slug[i];
      let next = node.folders.find((f) => f.name === seg);
      if (!next) { next = { name: seg, docs: [], folders: [] }; node.folders.push(next); }
      node = next;
    }
    node.docs.push(doc);
  }
  return root;
}

export function FolderNode({ tree, level = 0 }: { tree: Tree; level?: number }) {
  return (
    <div>
      {tree.folders.map((sub) => (
        <details key={sub.name} open className="mt-1">
          <summary className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
            <span className="text-base">📁</span>
            <span className="font-medium">{sub.name}</span>
          </summary>
          <div className="ml-4">
            <FolderNode tree={sub} level={level + 1} />
          </div>
        </details>
      ))}
      {tree.docs.map((doc) => {
        const href = `/read/${doc.slug.join('/')}`;
        return (
          <Link
            key={doc.slug.join('/')}
            href={href}
            className={`flex items-center gap-2 px-2 py-1.5 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 ${doc.unpaired ? 'text-amber-600 dark:text-amber-400' : ''}`}
          >
            <span>📄</span>
            <span className="truncate">{doc.slug[doc.slug.length - 1]}</span>
            {doc.unpaired && <span className="ml-auto" title="learn.md 없음">⚠️</span>}
          </Link>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/Sidebar.tsx`**

```tsx
import Link from 'next/link';
import path from 'node:path';
import { loadAllContent } from '@/lib/content';
import { FolderNode, buildTree } from './FolderNode';
import { ThemeToggle } from './ThemeToggle';

export async function Sidebar() {
  const docs = await loadAllContent(path.resolve(process.cwd(), 'content'));
  const tree = buildTree(docs);
  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen sticky top-0 ui-sans">
      <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 grid place-items-center text-white text-sm font-bold">E</div>
          <span className="font-semibold tracking-tight">EngReader</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-3 text-sm">
        <div className="px-2 py-1 text-xs uppercase tracking-wider text-slate-500">Content</div>
        <FolderNode tree={tree} />
      </div>
      <div className="border-t border-slate-200 dark:border-slate-800 p-2 space-y-0.5 text-sm">
        <Link href="/bookmarks" className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800">⭐ <span>Bookmarks</span></Link>
        <Link href="/vocab" className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800">📚 <span>Vocab</span></Link>
        <ThemeToggle />
      </div>
    </aside>
  );
}
```

- [ ] **Step 3: Verify**

Run: `pnpm typecheck`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/Sidebar.tsx src/components/FolderNode.tsx
git commit -m "feat(ui): sidebar tree navigation with unpaired marker"
```

---

## Task 10: Reader page (SSG via generateStaticParams)

**Files:**
- Create: `src/app/read/[...slug]/page.tsx`, `src/app/read/[...slug]/UnpairedNotice.tsx`
- Modify: `src/app/page.tsx` (add Sidebar shell)

- [ ] **Step 1: Create `src/app/read/[...slug]/UnpairedNotice.tsx`**

```tsx
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
```

- [ ] **Step 2: Create `src/app/read/[...slug]/page.tsx`**

```tsx
import path from 'node:path';
import { loadAllContent, loadDoc } from '@/lib/content';
import { Sidebar } from '@/components/Sidebar';
import { ReaderHeader } from '@/components/ReaderHeader';
import { SentenceList } from '@/components/SentenceList';
import { KeyboardHelp } from '@/components/KeyboardHelp';
import { UnpairedNotice } from './UnpairedNotice';
import { notFound } from 'next/navigation';

const ROOT = path.resolve(process.cwd(), 'content');

export async function generateStaticParams() {
  const docs = await loadAllContent(ROOT);
  return docs.map((d) => ({ slug: d.slug }));
}

export default async function ReaderPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const doc = await loadDoc(ROOT, slug);
  if (!doc) notFound();

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 min-h-screen">
        {doc.unpaired ? (
          <UnpairedNotice slug={doc.slug} />
        ) : (
          <>
            <ReaderHeader doc={doc} />
            <article className="max-w-prose mx-auto px-8 py-6">
              <SentenceList sentences={doc.sentences} />
              <p className="mt-8 text-center text-xs text-slate-400 ui-sans">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono">e</kbd> 모두 펼치기 ·{' '}
                <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono">c</kbd> 접기 ·{' '}
                <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono">?</kbd> 도움말
              </p>
            </article>
            <KeyboardHelp />
          </>
        )}
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Replace `src/app/page.tsx` (home with sidebar)**

```tsx
import path from 'node:path';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { loadAllContent } from '@/lib/content';

const ROOT = path.resolve(process.cwd(), 'content');

export default async function Home() {
  const docs = await loadAllContent(ROOT);
  const byCategory = new Map<string, typeof docs>();
  for (const d of docs) {
    const arr = byCategory.get(d.category) ?? [];
    arr.push(d);
    byCategory.set(d.category, arr);
  }
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 max-w-prose mx-auto px-8 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">EngReader</h1>
        <p className="mt-2 text-slate-500 ui-sans">사이드바에서 콘텐츠를 선택하세요.</p>

        {Array.from(byCategory.entries()).map(([cat, list]) => (
          <section key={cat} className="mt-8">
            <h2 className="text-lg font-semibold ui-sans">{cat}</h2>
            <ul className="mt-2 space-y-1">
              {list.map((d) => (
                <li key={d.slug.join('/')}>
                  <Link href={`/read/${d.slug.join('/')}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    {d.title}
                  </Link>
                  {d.unpaired && <span className="ml-2 text-amber-500 text-xs">⚠️ 학습자료 없음</span>}
                  {d.level && <span className="ml-2 text-xs text-slate-500">{d.level}</span>}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}
```

- [ ] **Step 4: Run dev and click through**

Run: `pnpm dev` (manual). Visit `/`, click "Climate Talks Stall in Geneva", confirm the reader works (reveal, ⭐, ✓, dark mode). Visit Orwell entry, confirm UnpairedNotice. Stop server.

- [ ] **Step 5: Run build**

Run: `pnpm build`
Expected: succeeds, generates `out/` with static HTML for `/`, `/read/news/climate-2026/`, `/read/essays/orwell-politics/`.

- [ ] **Step 6: Commit**

```bash
git add src/app/page.tsx src/app/read
git commit -m "feat(app): SSG reader page with home and unpaired notice"
```

---

## Task 11: Vocab and Bookmarks pages

**Files:**
- Create: `src/app/vocab/page.tsx`, `src/app/bookmarks/page.tsx`, `src/components/VocabList.tsx`, `src/components/BookmarkList.tsx`

- [ ] **Step 1: Create `src/components/VocabList.tsx`**

```tsx
'use client';
import { useUserStore } from '@/lib/store';

export function VocabList() {
  const vocab = useUserStore((s) => s.vocab);
  const removeVocab = useUserStore((s) => s.removeVocab);
  const items = Object.entries(vocab).sort(([a], [b]) => a.localeCompare(b));
  if (items.length === 0) return <p className="text-slate-500 ui-sans">단어장이 비어있습니다. 어휘 블록의 ⭐를 눌러 추가하세요.</p>;
  return (
    <ul className="space-y-2">
      {items.map(([word, entry]) => (
        <li key={word} className="flex items-baseline gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
          <b className="text-lg">{word}</b>
          <span className="text-sm text-slate-700 dark:text-slate-300">{entry.meaning}</span>
          <span className="ml-auto text-xs text-slate-400 ui-sans">{entry.addedAt}</span>
          <button aria-label={`삭제 ${word}`} onClick={() => removeVocab(word)} className="text-xs text-rose-500 ui-sans">삭제</button>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 2: Create `src/components/BookmarkList.tsx`**

```tsx
'use client';
import Link from 'next/link';
import { useUserStore } from '@/lib/store';

export function BookmarkList() {
  const bookmarked = useUserStore((s) => s.bookmarked);
  const ids = Object.keys(bookmarked).sort();
  if (ids.length === 0) return <p className="text-slate-500 ui-sans">북마크가 없습니다. 문장의 ⭐를 눌러 추가하세요.</p>;
  return (
    <ul className="space-y-1 ui-sans">
      {ids.map((id) => {
        const parts = id.split('/');
        const sIndex = parts[parts.length - 1];
        const docSlug = parts.slice(0, -1).join('/');
        return (
          <li key={id}>
            <Link href={`/read/${docSlug}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
              {docSlug} <span className="text-xs text-slate-400">{sIndex}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
```

- [ ] **Step 3: Create `src/app/vocab/page.tsx`**

```tsx
import { Sidebar } from '@/components/Sidebar';
import { VocabList } from '@/components/VocabList';

export default function VocabPage() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 max-w-prose mx-auto px-8 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Vocab</h1>
        <p className="mt-1 text-sm text-slate-500 ui-sans">누적 단어장</p>
        <div className="mt-6"><VocabList /></div>
      </main>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/app/bookmarks/page.tsx`**

```tsx
import { Sidebar } from '@/components/Sidebar';
import { BookmarkList } from '@/components/BookmarkList';

export default function BookmarksPage() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 max-w-prose mx-auto px-8 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Bookmarks</h1>
        <p className="mt-1 text-sm text-slate-500 ui-sans">북마크한 문장</p>
        <div className="mt-6"><BookmarkList /></div>
      </main>
    </div>
  );
}
```

- [ ] **Step 5: Build**

Run: `pnpm build`
Expected: passes.

- [ ] **Step 6: Commit**

```bash
git add src/app/vocab src/app/bookmarks src/components/VocabList.tsx src/components/BookmarkList.tsx
git commit -m "feat(app): vocab and bookmarks pages"
```

---

## Task 12: Playwright smoke E2E

**Files:**
- Create: `playwright.config.ts`, `e2e/smoke.spec.ts`

- [ ] **Step 1: Create `playwright.config.ts`**

```ts
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  webServer: {
    command: 'pnpm build && pnpm exec next start -p 3001',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  use: { baseURL: 'http://localhost:3001' },
});
```

- [ ] **Step 2: Create `e2e/smoke.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

test('home → reader → reveal → bookmark → vocab', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'EngReader' })).toBeVisible();

  await page.getByRole('link', { name: /Climate Talks Stall/ }).click();
  await expect(page.getByText(/Despite the heavy rain/)).toBeVisible();

  // Stage 1
  await page.getByRole('button', { name: /1단계 펼치기/ }).first().click();
  await expect(page.getByText(/폭우에도 불구하고/)).toBeVisible();

  // Stage 2
  await page.getByRole('button', { name: /2단계 펼치기/ }).first().click();
  await expect(page.getByText(/계속 밀고 나가다/)).toBeVisible();

  // Bookmark first sentence
  await page.getByRole('button', { name: '북마크' }).first().click();
  await page.goto('/bookmarks');
  await expect(page.getByText(/news\/climate-2026/)).toBeVisible();

  // Add vocab via star next to "press on"
  await page.goto('/read/news/climate-2026');
  await page.getByRole('button', { name: /1단계 펼치기/ }).first().click();
  await page.getByRole('button', { name: /2단계 펼치기/ }).first().click();
  await page.getByRole('button', { name: /단어장 추가: press on/ }).click();
  await page.goto('/vocab');
  await expect(page.getByText('press on')).toBeVisible();
});

test('unpaired notice shows for orwell entry', async ({ page }) => {
  await page.goto('/read/essays/orwell-politics');
  await expect(page.getByText(/학습자료가 없습니다/)).toBeVisible();
});
```

- [ ] **Step 3: Install browsers**

Run: `pnpm exec playwright install chromium`

- [ ] **Step 4: Run e2e**

Run: `pnpm e2e`
Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts e2e/smoke.spec.ts
git commit -m "test(e2e): smoke spec covering reader/bookmark/vocab/unpaired"
```

---

## Task 13: GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create `.github/workflows/ci.yml`**

```yaml
name: ci
on:
  push: { branches: [main] }
  pull_request:
jobs:
  test-and-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm e2e
```

- [ ] **Step 2: Commit and push**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: typecheck + lint + unit + build + e2e"
git push
```

(If push fails on auth, use the same fallback as before — repo write requires the user's auth setup.)

- [ ] **Step 3: Confirm CI green on GitHub**

Manual: open https://github.com/goopy68432/eng-learing-app/actions, confirm the run is green.

---

## Task 14: README polish + sample-content note

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update README to match implemented v1**

```markdown
# EngReader

한국어 초중급(CEFR A2~B1) 학습자를 위한 영문 마크다운 리딩 학습 뷰어.
`content/`에 영문 원문(`*.md`)과 외부 LLM이 생성한 학습자료(`*.learn.md`)를 짝지으면, 문장 단위 점진 reveal로 학습할 수 있는 정적 사이트가 빌드됩니다.

## 설계 문서
- 스펙: `docs/superpowers/specs/2026-05-05-engreader-design.md`
- 구현 계획: `docs/superpowers/plans/2026-05-05-engreader-v1.md`
- 시안: `mockup/reader.html`
- 학습자료 생성 프롬프트: `prompts/generate-learn-md.md`

## 빠른 시작

```bash
pnpm install
pnpm dev      # http://localhost:3000
```

## 콘텐츠 추가 방법

1. 영문 원문을 `content/<카테고리>/<이름>.md`로 저장.
2. `prompts/generate-learn-md.md`를 Claude(Code)에 적용해 같은 위치에 `<이름>.learn.md` 생성.
3. `pnpm dev`(개발 모드는 자동 반영) 또는 `pnpm build`(정적 사이트).

`content/samples/`는 CI 스모크용으로 커밋되어 있습니다. 본인 콘텐츠는 저작권에 따라 `.gitignore`로 제외하세요(기본 설정).

## 단축키

| 키 | 동작 |
|---|---|
| j / k | 다음/이전 문장 |
| 0 / 1 / 2 | 현재 문장 stage 변경 |
| e / c | 모두 펼치기 / 접기 |
| b | 북마크 토글 |
| space | 읽음 토글 |
| ? | 단축키 도움말 |

## 스택
Next.js 15 (App Router) · React 19 · Tailwind · Zustand · gray-matter/remark · Vitest · Playwright
```

- [ ] **Step 2: Commit and push**

```bash
git add README.md
git commit -m "docs: refresh README with quick-start and shortcuts"
git push
```

---

## Self-Review

**Spec coverage**

| Spec section | Implementing task |
|---|---|
| §5 시스템 아키텍처 | Tasks 1, 4, 10 |
| §6 폴더 구조 | Tasks 1, 4 |
| §7.1 원문 MD 규약 | Tasks 4 (parse-original) |
| §7.2 학습자료 MD 규약 | Tasks 3 (parse-learn) |
| §7.3 파싱 규칙 (unpaired) | Tasks 4, 10 |
| §8.1 라우트 | Tasks 10, 11 |
| §8.2 리더 레이아웃 | Tasks 8, 9, 10 |
| §8.3 점진 reveal | Task 6 |
| §8.4 단축키 | Task 7 (shortcuts), Task 8 (help) |
| §8.5 어휘 인터랙션 (단어장 ⭐) | Task 6 (BlockVocab) |
| §9 컴포넌트 트리 | Tasks 6-11 |
| §10.1 빌드 시점 데이터 | Tasks 2, 4 |
| §10.2 런타임 상태 | Task 5 |
| §11 디자인 시스템 (폰트) | Task 1 |
| §13 기술 스택 | Task 1 |
| §14 테스트 전략 | Tasks 2, 3, 4, 5, 6, 7, 12, 13 |
| §15 v1 스코프 | All tasks |

Note: §8.5 본문 단어 점선 밑줄(VocabTooltip)은 시안 디테일이지만 v1 스코프에는 명시 안 됨. 현재 계획에서는 포함하지 않음 — 추가 원할 시 후속 태스크로 분리.

**Placeholder scan:** 모든 step에 실제 코드/명령 포함 확인. "TBD"/"적절한 에러 처리"/"테스트 작성" 등 placeholder 없음.

**Type consistency:** `Sentence`, `ContentDoc`, `VocabEntry`는 Task 2에서 정의 후 Tasks 3, 4, 5, 6에서 동일한 시그니처로 사용. `Stage` 타입(0|1|2)은 Task 6에서 정의되어 Task 7 SentenceList에서 동일하게 사용. `keyToAction`/`Action` 타입은 Task 7에서 정의·소비. 일관성 확인.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-05-engreader-v1.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — fresh subagent per task, two-stage review between tasks, fast iteration.

**2. Inline Execution** — execute tasks in this session using executing-plans, batch execution with checkpoints for review.

**Which approach?**
