'use client';

import { useEffect } from 'react';

interface UseGalleryKeyboardArgs {
  active: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export const useGalleryKeyboard = ({
  active,
  onClose,
  onPrev,
  onNext,
}: UseGalleryKeyboardArgs) => {
  useEffect(() => {
    if (!active) {
      return;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowRight') {
        onNext();
      } else if (event.key === 'ArrowLeft') {
        onPrev();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, onClose, onPrev, onNext]);
};
