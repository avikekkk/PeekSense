# PeekSense

An elastic image grid where columns scroll at slightly different speeds, producing a subtle parallax that reveals content as you peek through the layout. Built with Next.js (App Router) and GSAP's ScrollSmoother / ScrollTrigger.

## Tech stack

- **Next.js** (App Router) + **React** + **TypeScript**
- **GSAP** with **ScrollSmoother** and **ScrollTrigger** (loaded from `public/js/`)

## Getting started

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the grid.

## Scripts

| Command           | Description                         |
| ----------------- | ----------------------------------- |
| `npm run dev`     | Start the Next.js development server |
| `npm run build`   | Build for production                |
| `npm run start`   | Start the production server         |
| `npm run lint`    | Run Next.js lint                    |
| `npm run typecheck` | Run TypeScript type checking      |

## Project structure

```
app/
  components/ElasticGrid.tsx   # Core scroll-driven grid component
  lib/gallery-data.ts          # Image/column configuration
  layout.tsx, page.tsx         # App Router entry points
public/
  assets/                      # Gallery images (.webp)
  js/                          # GSAP vendor scripts
```

## Credits

- Images generated with [Midjourney](https://midjourney.com)
- Scroll effects powered by [GSAP](https://gsap.com)

## License

[MIT](LICENSE)
