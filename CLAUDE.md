# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important

**Do not run build commands** (`next build`, `npm run build`, etc.) unless the user explicitly asks for one.

## Dev commands

```bash
npm run dev        # start dev server at localhost:3000
npm run lint       # Next.js ESLint
npm run typecheck  # tsc --noEmit
```

## Architecture

PeekSense is a Next.js App Router gallery with two views:

1. **Album picker** (`/`) — `app/page.tsx` — async server component. Fetches 4 preview images per album in parallel via `getAlbumPreviews` and renders full-width strip cards stacked vertically.

2. **Album gallery** (`/album/[id]`) — `app/album/[id]/page.tsx` — dynamic server component. Fetches the full image list for one album via `getGallery`, passes it to `<ElasticGrid>`.

### Album configuration

Albums are defined in **`albums.config.ts`** at the project root — one entry per UploadThing app, each with an `id` (URL segment), `name` (display), and `tokenEnvKey` (env var name). Tokens live in `.env.local`. Adding a new album = new entry in the config + new env var.

### Data layer (`app/lib/gallery-data.ts`)

All UploadThing fetches go through here. Two `unstable_cache`-wrapped functions:
- `getGallery(album)` — full file list (up to 300), 1 h cache, tagged `gallery`
- `getAlbumPreviews(album)` — first 4 files only, same cache settings

The UploadThing app domain (`{appId}.ufs.sh`) is decoded from the base64 token itself. `next.config.ts` allows `*.ufs.sh` so all album domains work without config changes.

### Client-side gallery (`ElasticGrid` → `Gallery` + `Lightbox`)

`ElasticGrid` is the sole client entry point. It owns lightbox state and wires three hooks:
- `useScrollSmoother` — initialises GSAP ScrollSmoother, groups grid items into columns, applies staggered parallax lag per column
- `useLightboxScrollLock` — pauses/resumes the smoother when the lightbox is open
- `useGalleryKeyboard` — Escape / arrow key handling

GSAP scripts are loaded via `<Script strategy="beforeInteractive">` in `layout.tsx` (not npm packages — pre-built files in `public/js/`). `useScrollSmoother` polls for them before initialising.

The `--lightbox-close-duration` CSS variable must stay in sync with `GALLERY.lightboxCloseMs` in `app/lib/gallery-config.ts`.

### Styling

Single CSS file: `css/base.css`. Uses CSS nesting (modern browsers / Next.js built-in PostCSS). No CSS modules, no Tailwind.
