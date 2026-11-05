# d8x.dev

Dean's personal portfolio is a floating island with five destinations for projects, work history, football, family and time outdoors. It is a static Vite site built with React, TypeScript, React Three Fiber, Three.js, Drei and Zustand.

```sh
npm ci
npm run dev
npm run typecheck
npm run build
npm run preview
```

Vite prints the local URL. Deploy the contents of `dist/` to a static host. The browser loads the scene models from the site itself. Google Fonts is the external source for DM Sans and Fraunces. An illustrated guide appears automatically if the browser cannot run the 3D view.

- [Project handoff](docs/README.md) records the current experience and where to make changes.
- [Asset inventory and licences](docs/ASSET_ATTRIBUTIONS.md) lists every bundled model, including retired ones. The site links to its public [credits page](public/credits.html) from the intro.
- [Launch checklist](REVIEW_CHECKLIST.md) covers browser checks, hosting and the production smoke test.

After building, run `node scripts/smoke.mjs` with Playwright and Chromium installed. Set `PLAYWRIGHT_MODULE` to the absolute Playwright entry point if it is installed outside the project. The script serves `dist/` locally and writes screenshots and its console report to `artifacts/smoke/`.
