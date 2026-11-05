# AGENTS.md — d8x.dev

## Mission
Create a polished, performant, accessible interactive 3D portfolio. Vite + React + TypeScript + React Three Fiber + Three.js + Drei + Zustand. Do not migrate back to Next.js unless explicitly requested. The codebase is a self-contained static website.

## Approved design
- One large irregular floating island with a balanced central snow-capped mountain; distant landscapes cinematic, close-up scenes diorama-like.
- Opening: Dean’s intro, portrait, profile links, credits and a wide island shot. The logo returns to the intro. Camera journeys are button-triggered. No scroll-driven camera or free orbit controls.
- Five destinations: cosy office for real projects, miniature city for real career history, football stadium, riverside picnic basket, and a warm family home **without people or silhouettes**.
- Persistent destination dock plus 3D markers always visible in overview. Use DOM for important content.
- Subtle opt-in environmental audio, initially muted. No required music.
- Fixed camera destinations with drag and keyboard look-around, authored journeys, Skip, reduced motion and persistent access to Overview.
- Avoid inventing the user's employers, clients, projects, family details or testimonials.

## Working rules
- Inspect files before editing; preserve working interactions.
- Run `npm install`, `npm run typecheck`, `npm run build` and browser smoke tests when network and browser are available.
- Test desktop and mobile, including reduced motion, keyboard focus, WebGL fallback, audio opt-in and direct destination transitions.
- Avoid giant scene components; maintain separate terrain, dressing, landmark, camera, UI and content responsibilities.
- For production art, consider compressed Blender GLBs and KTX2 textures. Profile memory, GPU draw calls and frame times before adding postprocessing.
- Keep navigation and information usable without pointer hover; no essential content solely in 3D textures.
- Do not mark tasks complete if build or visual validation has not been performed.

## Current context
- Read [the handoff](docs/README.md), [asset inventory](docs/ASSET_ATTRIBUTIONS.md) and [launch checklist](REVIEW_CHECKLIST.md). The older design and planning documents under `docs/` are historical.
- The dock follows the trail: Overview, Projects, Work, Football, Family, Outdoors. The island loop crosses the river on the footbridge. Use the shared trail clearance when placing scenery or changing paths.
- Project and career content is real. Keep important content in the DOM and retain the automatic WebGL fallback.
- Keep the public asset credits reachable from the intro and update the inventory and bundled notices when adding third-party assets.
