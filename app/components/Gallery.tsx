'use client';

import Image from 'next/image';
import Link from 'next/link';
import { forwardRef } from 'react';
import type { GridItem } from '../lib/gallery-data';

interface GalleryProps {
  items: GridItem[];
  onOpen: (index: number) => void;
  ready: boolean;
  albumName?: string;
}

export const Gallery = forwardRef<HTMLDivElement, GalleryProps>(function Gallery(
  { items, onOpen, ready, albumName },
  gridRef,
) {
  return (
    <div id="smooth-wrapper">
      <main id="smooth-content">
        <header className="frame">
          {albumName && (
            <Link href="/" className="frame__back" aria-label="Back to albums">
              ← Albums
            </Link>
          )}
          <h1 className="frame__title">{albumName ?? 'PeekSense'}</h1>
        </header>
        <div
          className={`grid${ready ? ' grid--ready' : ''}`}
          ref={gridRef}
        >
          {items.map((item, index) => (
            <figure className="grid__item" key={item.id}>
              <button
                type="button"
                className="grid__item-img"
                onClick={() => onOpen(index)}
                aria-label={`Open ${item.caption}`}
              >
                <Image
                  src={item.image}
                  alt={item.caption}
                  fill
                  sizes="(min-width: 65em) 20vw, (min-width: 40em) 33vw, 50vw"
                  priority={index < 8}
                />
              </button>
              <figcaption className="grid__item-caption">{item.caption}</figcaption>
            </figure>
          ))}
        </div>
      </main>
    </div>
  );
});
