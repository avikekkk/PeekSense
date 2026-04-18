'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import type { GridItem } from '../lib/gallery-data';

const SWAP_DURATION_MS = 650;

interface LightboxProps {
  item: GridItem;
  index: number;
  isClosing: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

interface NavButtonProps {
  direction: 'prev' | 'next';
  onClick: () => void;
}

const NAV_LABEL = { prev: 'Previous image', next: 'Next image' } as const;

const IconChevron = ({ direction }: { direction: 'prev' | 'next' }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d={direction === 'prev' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'}
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconClose = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M6 6l12 12M18 6L6 18"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
);

const NavButton = ({ direction, onClick }: NavButtonProps) => (
  <button
    type="button"
    className={`lightbox__nav lightbox__nav--${direction}`}
    onClick={(event: MouseEvent) => {
      event.stopPropagation();
      onClick();
    }}
    aria-label={NAV_LABEL[direction]}
  >
    <IconChevron direction={direction} />
  </button>
);

interface FrameProps {
  item: GridItem;
  variant: 'enter' | 'leave';
  priority?: boolean;
}

const LightboxFrame = ({ item, variant, priority }: FrameProps) => {
  const isLeaving = variant === 'leave';
  const [loaded, setLoaded] = useState(isLeaving);
  const className = isLeaving
    ? 'lightbox__content lightbox__content--leaving'
    : 'lightbox__content lightbox__content--entering';
  return (
    <div className={className} onClick={(event) => event.stopPropagation()}>
      {!loaded && !isLeaving && (
        <div className="lightbox__loader" aria-hidden="true">
          <span className="lightbox__spinner" />
        </div>
      )}
      <Image
        src={item.image}
        alt={item.caption}
        fill
        sizes="100vw"
        priority={priority}
        onLoad={() => setLoaded(true)}
        className={`lightbox__image${loaded ? ' lightbox__image--loaded' : ''}`}
      />
      <p className="lightbox__caption">{item.caption}</p>
    </div>
  );
};

export const Lightbox = ({ item, index, isClosing, onClose, onPrev, onNext }: LightboxProps) => {
  const [outgoing, setOutgoing] = useState<{ item: GridItem; key: number } | null>(null);
  const lastRef = useRef({ item, index });

  useEffect(() => {
    const last = lastRef.current;
    if (last.index !== index) {
      setOutgoing({ item: last.item, key: last.index });
      const timer = window.setTimeout(() => setOutgoing(null), SWAP_DURATION_MS);
      lastRef.current = { item, index };
      return () => window.clearTimeout(timer);
    }
    lastRef.current = { item, index };
  }, [item, index]);

  return (
    <div
      className={`lightbox${isClosing ? ' lightbox--closing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={item.caption}
      onClick={onClose}
    >
      <button
        type="button"
        className="lightbox__close"
        onClick={onClose}
        aria-label="Close"
      >
        <IconClose />
      </button>
      <NavButton direction="prev" onClick={onPrev} />
      <NavButton direction="next" onClick={onNext} />

      {outgoing && (
        <LightboxFrame
          key={`out-${outgoing.key}`}
          item={outgoing.item}
          variant="leave"
        />
      )}
      <LightboxFrame key={`in-${index}`} item={item} variant="enter" priority />
    </div>
  );
};
