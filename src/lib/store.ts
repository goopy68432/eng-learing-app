import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { VocabEntry } from './types';

export type FontSize = 'sm' | 'md' | 'lg';
const FONT_ORDER: FontSize[] = ['sm', 'md', 'lg'];

type UserState = {
  read: Record<string, boolean>;
  bookmarked: Record<string, boolean>;
  vocab: Record<string, VocabEntry>;
  fontSize: FontSize;
  toggleRead: (sentenceId: string) => void;
  toggleBookmark: (sentenceId: string) => void;
  addVocab: (word: string, entry: VocabEntry) => void;
  removeVocab: (word: string) => void;
  setFontSize: (size: FontSize) => void;
  cycleFontSize: (direction: 1 | -1) => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      read: {},
      bookmarked: {},
      vocab: {},
      fontSize: 'md',
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
      setFontSize: (size) => set({ fontSize: size }),
      cycleFontSize: (direction) =>
        set((s) => {
          const i = FONT_ORDER.indexOf(s.fontSize);
          const next = FONT_ORDER[(i + direction + FONT_ORDER.length) % FONT_ORDER.length];
          return { fontSize: next };
        }),
    }),
    { name: 'engreader:user-state:v1' }
  )
);
