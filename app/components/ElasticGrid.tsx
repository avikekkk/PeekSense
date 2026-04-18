'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { GalleryConfig } from '../lib/gallery-data';
import type { ScrollSmootherInstance } from '../types/gsap-globals';

interface ElasticGridProps {
  gallery: GalleryConfig;
}

type Column = HTMLElement[];

const waitForVendorScripts = async () => {
  for (let attempts = 0; attempts < 80; attempts += 1) {
    if (window.gsap && window.ScrollTrigger && window.ScrollSmoother) {
      return;
    }

    await new Promise((resolve) => window.setTimeout(resolve, 50));
  }

  throw new Error('GSAP vendor scripts did not load.');
};

const safeKillSmoother = (instance?: ScrollSmootherInstance) => {
  if (!instance?.kill) {
    return;
  }

  try {
    instance.kill();
  } catch (error) {
    if (error instanceof DOMException && error.name === 'NotFoundError') {
      return;
    }

    throw error;
  }
};

const getColumnCount = (grid: HTMLElement) =>
  getComputedStyle(grid)
    .getPropertyValue('grid-template-columns')
    .split(' ')
    .filter(Boolean).length;

const getLag = (index: number) => 0.2 + (index + 1) * 0.3;

const CLOSE_ANIMATION_MS = 220;

export function ElasticGrid({ gallery }: ElasticGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const smootherRef = useRef<ScrollSmootherInstance | undefined>(undefined);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const itemCount = gallery.items.length;
  const selected = selectedIndex === null ? null : gallery.items[selectedIndex];

  const closeLightbox = () => {
    if (isClosing) {
      return;
    }
    setIsClosing(true);
    window.setTimeout(() => {
      setSelectedIndex(null);
      setIsClosing(false);
    }, CLOSE_ANIMATION_MS);
  };

  const showRelative = (delta: number) => {
    setSelectedIndex((current) => {
      if (current === null) {
        return current;
      }
      return (current + delta + itemCount) % itemCount;
    });
  };

  useEffect(() => {
    if (selectedIndex === null) {
      return;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeLightbox();
      } else if (event.key === 'ArrowRight') {
        showRelative(1);
      } else if (event.key === 'ArrowLeft') {
        showRelative(-1);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedIndex, isClosing, itemCount]);

  useEffect(() => {
    if (selectedIndex === null) {
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
  }, [selectedIndex]);

  useEffect(() => {
    let cancelled = false;
    let smoother: ScrollSmootherInstance | undefined;
    let currentColumnCount: number | null = null;
    let resizeHandler: (() => void) | undefined;

    document.body.classList.remove('peeksense');
    document.body.classList.add(gallery.bodyClass, 'loading');

    const run = async () => {
      await waitForVendorScripts();

      if (cancelled || !gridRef.current || !window.gsap || !window.ScrollSmoother) {
        return;
      }

      const grid = gridRef.current;
      const existingSmoother = window.ScrollSmoother.get?.();
      safeKillSmoother(existingSmoother);

      window.gsap.registerPlugin(window.ScrollTrigger, window.ScrollSmoother);

      smoother = window.ScrollSmoother.create({
        smooth: 1,
        effects: true,
        normalizeScroll: true,
        wrapper: '#smooth-wrapper',
        content: '#smooth-content',
      });
      smootherRef.current = smoother;

      const originalItems = Array.from(grid.querySelectorAll<HTMLElement>('.grid__item'));

      const clearGrid = () => {
        grid.querySelectorAll('.grid__column').forEach((column) => column.remove());
        originalItems.forEach((item) => grid.appendChild(item));
      };

      const groupItemsByColumn = () => {
        const columnCount = getColumnCount(grid);
        const columns = Array.from({ length: columnCount }, () => []) as Column[];

        grid.querySelectorAll<HTMLElement>('.grid__item').forEach((item, index) => {
          columns[index % columnCount].push(item);
        });

        return { columns, columnCount };
      };

      const buildGrid = (columns: Column[]) => {
        const fragment = document.createDocumentFragment();
        const columnContainers: Array<{ element: HTMLElement; lag: number }> = [];

        columns.forEach((column, index) => {
          const element = document.createElement('div');
          element.className = 'grid__column';
          column.forEach((item) => element.appendChild(item));
          fragment.appendChild(element);
          columnContainers.push({ element, lag: getLag(index) });
        });

        grid.appendChild(fragment);
        return columnContainers;
      };

      const init = () => {
        if (!smoother) {
          return;
        }

        clearGrid();
        const { columns, columnCount } = groupItemsByColumn();
        currentColumnCount = columnCount;
        buildGrid(columns).forEach(({ element, lag }) => {
          smoother?.effects(element, { speed: 1, lag });
        });
      };

      resizeHandler = () => {
        const nextColumnCount = getColumnCount(grid);
        if (nextColumnCount !== currentColumnCount) {
          init();
        }
      };

      window.addEventListener('resize', resizeHandler);
      document.body.classList.remove('loading');
      init();
    };

    run().catch((error) => {
      document.body.classList.remove('loading');
      console.error(error);
    });

    return () => {
      cancelled = true;

      if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
      }

      safeKillSmoother(smoother);
      smootherRef.current = undefined;
    };
  }, [gallery.bodyClass]);

  return (
    <div id="smooth-wrapper">
      <main id="smooth-content">
        <header className="frame">
          <h1 className="frame__title">PeekSense</h1>
        </header>
        <div className="grid" ref={gridRef}>
          {gallery.items.map((item, index) => (
            <figure className="grid__item" key={`${item.image}-${index}`}>
              <button
                type="button"
                className="grid__item-img"
                onClick={() => setSelectedIndex(index)}
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
      {selected && (
        <div
          className={`lightbox${isClosing ? ' lightbox--closing' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label={selected.caption}
          onClick={closeLightbox}
        >
          <button
            type="button"
            className="lightbox__close"
            onClick={closeLightbox}
            aria-label="Close"
          >
            ×
          </button>
          <button
            type="button"
            className="lightbox__nav lightbox__nav--prev"
            onClick={(event) => {
              event.stopPropagation();
              showRelative(-1);
            }}
            aria-label="Previous image"
          >
            ‹
          </button>
          <button
            type="button"
            className="lightbox__nav lightbox__nav--next"
            onClick={(event) => {
              event.stopPropagation();
              showRelative(1);
            }}
            aria-label="Next image"
          >
            ›
          </button>
          <div
            key={selectedIndex}
            className="lightbox__content"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={selected.image}
              alt={selected.caption}
              fill
              sizes="100vw"
              priority
            />
            <p className="lightbox__caption">{selected.caption}</p>
          </div>
        </div>
      )}
    </div>
  );
}
