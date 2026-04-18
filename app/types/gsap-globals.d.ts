export {};

declare global {
  interface Window {
    gsap?: GsapGlobal;
    ScrollTrigger?: unknown;
    ScrollSmoother?: ScrollSmootherGlobal;
  }
}

interface GsapGlobal {
  registerPlugin: (...plugins: unknown[]) => void;
  ticker: {
    add: (callback: () => void) => void;
    remove: (callback: () => void) => void;
  };
}

interface ScrollSmootherGlobal {
  create: (config: {
    smooth: number;
    effects: boolean;
    normalizeScroll: boolean;
    wrapper?: string | Element;
    content?: string | Element;
  }) => ScrollSmootherInstance;
  get?: () => ScrollSmootherInstance | undefined;
}

export interface ScrollSmootherInstance {
  effects: (target: Element, config: { speed: number; lag: number }) => void;
  getVelocity: () => number;
  paused: (value?: boolean) => boolean;
  kill?: () => void;
}
