# AGENTS.md — The World Between the Lines

**Read `WORLD_DESIGN_SPEC.md` and `IMPLEMENTATION_PLAN.md` before changing code.** This is the authoritative OpenCode agent brief. The approved design replaces the earlier scroll-driven/football-centered prototype. If old README, CSS or source files disagree, follow these documents and document the migration.

## Product intent

Build a professional/personal Next.js portfolio set on a single floating island. A balanced central snow-capped mountain and river connect a cosy office (projects), tiny city (career), football stadium, nature picnic by the river, and a homely family house. Family scene has **no people**. Cinematic welcome uses a **minimal waving avatar**. After entering, visitors navigate using **fixed authored camera destinations** via **persistent dock and always-visible overview markers**. **Ambient sound opt-in**, initially muted. Essential content in accessible DOM.

## Hard constraints

1. **NO** scroll-driven camera movement, ScrollTrigger navigation, free orbit, WASD, or pointer camera parallax. Scroll only inside panels when necessary.
2. **NO** central football pitch as the island's defining geometry. Football belongs in the stadium destination.
3. **NO** people, silhouettes, portraits, avatars, or figures in the family scene; no identifiable child information.
4. **NO** invented projects, employers, dates, client logos, testimonials, personal facts, or contact information.
5. **NO** essential 3D-only navigation or text. DOM alternatives and accessible fallbacks are mandatory.
6. **NO** audible autoplay. Explicit user opt-in; persistent mute control; ambient sound only.
7. Overview markers always visible where appropriate, but never through occluding mountain/terrain; dock reaches all locations.
8. Do not claim checks/tests passed unless executed. Do not rewrite the project wholesale before auditing.

## Stack and ownership

Next.js App Router, React, TypeScript, React Three Fiber, Three.js, Drei, Zustand, GSAP (for authored camera transitions and optionally panel choreography). CSS for UI; avoid redundant animation libraries. Assets may be procedural, Blender-made, or licensed GLBs. Preserve working dependencies unless a change is justified.

- `ExperiencePage`: HTML layout, overlays and orchestration.
- `WorldCanvas`: dynamic client-side canvas, loading/error/fallback.
- `World`: island, terrain, scene meshes, atmosphere.
- `CameraRig`: sole writer to camera position/lookAt during transitions.
- `cameraPositions` and `cameraRoutes`: data-only authored poses/routes.
- `experience-store`: discriminated union state, active scene, transition lock/cancel, sound preference.
- `ExperienceNavigation` and `WorldMarkers`: same scene registry and callbacks; keyboard accessible DOM equivalents.
- `SceneInformation`: concise copy, lists and deeper project/experience details.
- `AmbientAudio`: opt-in audio lifecycle, fades, mute, cleanup.
- `content`: typed placeholder scene/project/experience data; never fake biography.

## Existing starter — audit first

Original milestone ZIP may contain Next.js scaffold with R3F canvas, procedural small island, **central pitch**, football object, pointer parallax, editorial sections, and scroll-progress Zustand fields. These are historical prototypes, not current requirements. Actual working repo may differ. Inspect files, dependencies, git status and commands before edits. The original scaffold archive was not build/lint/typecheck verified. Do not assume existing implementation is production-ready.

## Engineering rules

- Incremental milestones with small, reviewable changes and working build at every stage.
- First build **terrain and camera blockout** with labelled placeholders; validate scene visibility and transitions before detailed art.
- Scene anchors in `WORLD_DESIGN_SPEC.md` are starting coordinates only; adjust after sightline review.
- Keep authored camera motion separate from continuous scene animation; no competing camera writes.
- Explicit transition state; handle repeat clicks, cancellation, resize, hidden tab and errors.
- Use instancing for repeated foliage, lazy-load noncritical assets/audio, quality tiers, compressed models/textures when needed.
- Include keyboard, mobile, reduced motion, no WebGL, no audio, slow connection and focus management in acceptance tests.
- Use deterministic procedural seeds when helpful. Maintain clear asset licenses and credits.
- No external tracking or data collection without an explicit requirement.

## Visual direction

Cinematic + stylised diorama, natural editorial composition, restrained movement, warm/tactile detail. Palette: forest `#183D2B`, grass `#8EAF68`, cream `#F3F0E5`, sunset `#D99B65`, charcoal `#171B19`. Coherent base lighting with scene-local atmosphere. Mountain and river are unifying elements.

## Definition of done for each phase

- [ ] Matches relevant approved spec sections.
- [ ] Works by pointer, keyboard and touch where applicable.
- [ ] Does not regress loading, no-WebGL and reduced-motion paths.
- [ ] Typecheck, lint, build and relevant tests executed; report actual outcomes.
- [ ] Screenshots/short captures of desktop and mobile reviewed when feasible.
- [ ] Update docs and checklist; identify any deviations or unresolved user content.

## Working process

1. Read all three handoff docs and inspect current repository.
2. Summarize audit findings and migration risks before broad refactors.
3. Implement only the current milestone, with explicit acceptance criteria.
4. Report changed files, decisions, commands/results, and next milestone.
5. Ask user only for genuinely missing personal content or decisions that materially block progress.

**Do not reintroduce the old scroll-based experience.**
