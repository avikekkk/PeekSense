'use client';

import { useEffect, type RefObject } from 'react';
import type { ScrollSmootherInstance } from '../types/gsap-globals';

interface UseLightboxScrollLockArgs {
  active: boolean;
  smootherRef: RefObject<ScrollSmootherInstance | undefined>;
}

export const useLightboxScrollLock = ({ active, smootherRef }: UseLightboxScrollLockArgs) => {
  useEffect(() => {
    if (!active) {
      return;
    }

    smootherRef.current?.paused(true);

    const block = (event: Event) => event.preventDefault();
    window.addEventListener('wheel', block, { passive: false });
    window.addEventListener('touchmove', block, { passive: false });

    return () => {
      window.removeEventListener('wheel', block);
      window.removeEventListener('touchmove', block);
      smootherRef.current?.paused(false);
    };
  }, [active, smootherRef]);
};
