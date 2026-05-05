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
