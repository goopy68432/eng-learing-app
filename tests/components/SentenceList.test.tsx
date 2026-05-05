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
  beforeEach(() => useUserStore.setState({ read: {}, bookmarked: {}, vocab: {}, fontSize: 'md' }));

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
