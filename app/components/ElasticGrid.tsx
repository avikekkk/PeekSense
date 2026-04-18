'use client';

import { useEffect, useRef } from 'react';
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

const preloadBackgroundImages = (elements: HTMLElement[]) => {
  const urls = elements
    .map((element) => element.style.backgroundImage.match(/url\(["']?(.+?)["']?\)/)?.[1])
    .filter((url): url is string => Boolean(url));

  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const image = new Image();
          image.onload = () => resolve();
          image.onerror = () => resolve();
          image.src = url;
        }),
    ),
  );
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

export function ElasticGrid({ gallery }: ElasticGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

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
      await preloadBackgroundImages(Array.from(grid.querySelectorAll<HTMLElement>('.grid__item-img')));

      if (cancelled || !window.gsap || !window.ScrollSmoother) {
        return;
      }

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
              <div className="grid__item-img" style={{ backgroundImage: `url(${item.image})` }} />
              <figcaption className="grid__item-caption">{item.caption}</figcaption>
            </figure>
          ))}
        </div>
      </main>
    </div>
  );
}
