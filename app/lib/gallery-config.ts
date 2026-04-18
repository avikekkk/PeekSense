export const GALLERY = {
  // Must match --lightbox-close-duration in css/base.css.
  lightboxCloseMs: 220,
  vendorPoll: { intervalMs: 50, maxAttempts: 80 },
  lagBase: 0.2,
  lagStep: 0.3,
} as const;
