'use client';

import { useCallback, useRef, useState } from 'react';

import { Gallery } from './Gallery';
import { Lightbox } from './Lightbox';
import { useGalleryKeyboard } from '../hooks/useGalleryKeyboard';
import { useLightboxScrollLock } from '../hooks/useLightboxScrollLock';
import { useScrollSmoother } from '../hooks/useScrollSmoother';
import { GALLERY } from '../lib/gallery-config';
import type { GalleryConfig } from '../lib/gallery-data';

interface ElasticGridProps {
  gallery: GalleryConfig;
}

export function ElasticGrid({ gallery }: ElasticGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const smootherRef = useScrollSmoother({ gridRef, onReady });

  const itemCount = gallery.items.length;
  const selected = selectedIndex === null ? null : gallery.items[selectedIndex];
  const isOpen = selectedIndex !== null;

  const closeLightbox = useCallback(() => {
    setIsClosing((closing) => {
      if (closing) return closing;
      window.setTimeout(() => {
        setSelectedIndex(null);
        setIsClosing(false);
      }, GALLERY.lightboxCloseMs);
      return true;
    });
  }, []);

  const showRelative = useCallback(
    (delta: number) => {
      setSelectedIndex((current) =>
        current === null ? current : (current + delta + itemCount) % itemCount,
      );
    },
    [itemCount],
  );

  const showPrev = useCallback(() => showRelative(-1), [showRelative]);
  const showNext = useCallback(() => showRelative(1), [showRelative]);

  useGalleryKeyboard({
    active: isOpen,
    onClose: closeLightbox,
    onPrev: showPrev,
    onNext: showNext,
  });

  useLightboxScrollLock({ active: isOpen, smootherRef });

  return (
    <>
      <Gallery ref={gridRef} items={gallery.items} onOpen={setSelectedIndex} ready={ready} />
      {selected && selectedIndex !== null && (
        <Lightbox
          item={selected}
          index={selectedIndex}
          isClosing={isClosing}
          onClose={closeLightbox}
          onPrev={showPrev}
          onNext={showNext}
        />
      )}
    </>
  );
}
