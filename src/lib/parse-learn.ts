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
