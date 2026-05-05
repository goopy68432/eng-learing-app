'use client';
import { useEffect } from 'react';
import { useUserStore } from '@/lib/store';

export function FontSizeApplier() {
  const fontSize = useUserStore((s) => s.fontSize);
  useEffect(() => {
    document.documentElement.dataset.fontsize = fontSize;
  }, [fontSize]);
  return null;
}
