'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { GALLERY } from '../lib/gallery-config';
import type { ScrollSmootherInstance } from '../types/gsap-globals';

type Column = HTMLElement[];

const waitForVendorScripts = async () => {
  const { intervalMs, maxAttempts } = GALLERY.vendorPoll;
  for (let attempts = 0; attempts < maxAttempts; attempts += 1) {
    if (window.gsap && window.ScrollTrigger && window.ScrollSmoother) {
      return;
    }
    await new Promise((resolve) => window.setTimeout(resolve, intervalMs));
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

const getLag = (index: number) => GALLERY.lagBase + (index + 1) * GALLERY.lagStep;

interface UseScrollSmootherArgs {
  gridRef: RefObject<HTMLDivElement | null>;
  onReady?: () => void;
}

export const useScrollSmoother = ({ gridRef, onReady }: UseScrollSmootherArgs) => {
  const smootherRef = useRef<ScrollSmootherInstance | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    let smoother: ScrollSmootherInstance | undefined;
    let currentColumnCount: number | null = null;
    let resizeHandler: (() => void) | undefined;

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
      init();
      onReady?.();
    };

    run().catch((error) => {
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
  }, [gridRef, onReady]);

  return smootherRef;
};
