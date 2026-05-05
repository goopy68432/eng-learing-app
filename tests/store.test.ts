import { describe, it, expect, beforeEach } from 'vitest';
import { useUserStore } from '@/lib/store';

describe('useUserStore', () => {
  beforeEach(() => {
    useUserStore.setState({ read: {}, bookmarked: {}, vocab: {}, fontSize: 'md' });
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

  it('defaults fontSize to md', () => {
    expect(useUserStore.getState().fontSize).toBe('md');
  });

  it('sets fontSize and persists', () => {
    useUserStore.getState().setFontSize('lg');
    expect(useUserStore.getState().fontSize).toBe('lg');
    const raw = localStorage.getItem('engreader:user-state:v1');
    expect(JSON.parse(raw!).state.fontSize).toBe('lg');
  });

  it('cycleFontSize advances sm → md → lg → sm', () => {
    useUserStore.getState().setFontSize('sm');
    useUserStore.getState().cycleFontSize(1);
    expect(useUserStore.getState().fontSize).toBe('md');
    useUserStore.getState().cycleFontSize(1);
    expect(useUserStore.getState().fontSize).toBe('lg');
    useUserStore.getState().cycleFontSize(1);
    expect(useUserStore.getState().fontSize).toBe('sm');
  });

  it('cycleFontSize(-1) goes backwards', () => {
    useUserStore.getState().setFontSize('md');
    useUserStore.getState().cycleFontSize(-1);
    expect(useUserStore.getState().fontSize).toBe('sm');
  });
});
