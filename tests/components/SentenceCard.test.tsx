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
    useUserStore.setState({ read: {}, bookmarked: {}, vocab: {}, fontSize: 'md' });
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
