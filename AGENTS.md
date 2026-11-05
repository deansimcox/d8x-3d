# AGENTS.md — The World Between the Lines V3

## Mission
Create a polished, performant, accessible interactive 3D portfolio. Vite + React + TypeScript + React Three Fiber + Three.js + Drei + Zustand. Do not migrate back to Next.js unless explicitly requested. The codebase is a self-contained static website.

## Approved design
- One large irregular floating island with a balanced central snow-capped mountain; distant landscapes cinematic, close-up scenes diorama-like.
- Opening: wide island shot, minimal waving avatar, cinematic button-triggered camera journey. No scroll-driven camera or free orbit controls.
- Five destinations: cosy office for real projects, miniature city for real career history, football stadium, riverside picnic basket, and a warm family home **without people or silhouettes**.
- Persistent destination dock plus 3D markers always visible in overview. Use DOM for important content.
- Subtle opt-in environmental audio, initially muted. No required music.
- Fixed camera destinations, designed paths, skip, reduced motion, return to overview at all times.
- Avoid inventing the user's employers, clients, projects, family details or testimonials.

## Working rules
- Inspect files before editing; preserve working interactions.
- Run `npm install`, `npm run typecheck`, `npm run build` and browser smoke tests when network and browser are available.
- Test desktop and mobile, including reduced motion, keyboard focus, WebGL fallback, audio opt-in and direct destination transitions.
- Avoid giant scene components; maintain separate terrain, dressing, landmark, camera, UI and content responsibilities.
- For production art, consider compressed Blender GLBs and KTX2 textures. Profile memory, GPU draw calls and frame times before adding postprocessing.
- Keep navigation and information usable without pointer hover; no essential content solely in 3D textures.
- Do not mark tasks complete if build or visual validation has not been performed.

## Known caveats
- V3 is an ambitious procedural art pass, not a final asset production pipeline.
- The source environment could not reach npm registry; dependency installation and build validation remain pending.
- Real project and career content remains intentionally placeholder.
- Authored textures, original model refinement, real environmental recordings and mobile GPU profiling are future polish tasks.
