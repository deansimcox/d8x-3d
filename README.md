# The World Between the Lines

A cinematic floating island with five explorable destinations. The portfolio runs as a static Vite, React and Three.js site.

```sh
npm install
npm run dev
npm run typecheck
npm run build
```

Open the URL printed by Vite. `dist/` is the static production build. The illustrated guide is always available via the map button and opens automatically when WebGL is unavailable.

- Edit destination copy and add real project or career entries in [`src/content.ts`](src/content.ts). Empty archives show a coming-soon note. No personal or professional history has been invented.
- Island geography, camera poses and protected views are in [`src/world/layout.ts`](src/world/layout.ts). The terrain, scene models, water, lighting and camera rig are separate modules in `src/world/`.
- The 46 runtime models are local, self-contained GLBs in `public/models/`. See [asset credits](docs/ASSET_ATTRIBUTIONS.md) for the original packs and [the preparation script](scripts/prepare-assets.py) for the conversion recipe. The script uses Python and Pillow; the original packs are only needed when preparing additional models.
- Ambient sound starts muted. Navigation supports keyboard and touch, short or skipped camera journeys, reduced motion and the illustrated guide.

[`scripts/smoke.mjs`](scripts/smoke.mjs) serves `dist/` on loopback and runs the desktop/mobile Playwright checks. Run `node scripts/smoke.mjs` after building, using Playwright and Chromium already installed locally. Set `PLAYWRIGHT_MODULE` to an absolute Playwright entry point when using a separate installation. The script saves screenshots and the console report under `artifacts/smoke/`.
