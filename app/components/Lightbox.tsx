'use client';

import Image from 'next/image';
import type { MouseEvent } from 'react';
import type { GridItem } from '../lib/gallery-data';

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
const NAV_GLYPH = { prev: '‹', next: '›' } as const;

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
    {NAV_GLYPH[direction]}
  </button>
);

export const Lightbox = ({ item, index, isClosing, onClose, onPrev, onNext }: LightboxProps) => (
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
      ×
    </button>
    <NavButton direction="prev" onClick={onPrev} />
    <NavButton direction="next" onClick={onNext} />
    <div
      key={index}
      className="lightbox__content"
      onClick={(event) => event.stopPropagation()}
    >
      <Image src={item.image} alt={item.caption} fill sizes="100vw" priority />
      <p className="lightbox__caption">{item.caption}</p>
    </div>
  </div>
);
