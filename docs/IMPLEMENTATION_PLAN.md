# IMPLEMENTATION_PLAN.md — The World Between the Lines

Version 1.0 · OpenCode execution roadmap · Use with `WORLD_DESIGN_SPEC.md` and `AGENTS.md`.

## Operating principles

Build **one vertical slice at a time**, preserve a runnable app, and validate camera composition before detailed 3D asset creation. Phases are sequential by default; content and asset work can overlap once blockout is approved. Checkboxes are work items, **not claims of completion**. No dates or performance scores are guaranteed. Do not invent user biography.

## Phase 0 — Repository audit and migration design

- [ ] Inspect actual repo tree, package scripts, lockfile, dependencies, TypeScript and Next.js versions.
- [ ] Inspect old Canvas, `World`, terrain, football, camera parallax, Zustand state, CSS and editorial sections.
- [ ] Identify scroll-driven references, old pitch-centric scene and old section navigation.
- [ ] Run baseline install (if required), lint, typecheck, build; record results and environment.
- [ ] Review accessibility and mobile behavior in existing prototype.
- [ ] Propose incremental migration plan; avoid premature mass refactor.
- [ ] Identify missing content/assets and keep them placeholder-only.

**Acceptance:** Written audit with actual state, errors, risks, files to preserve/remove and a clear first implementation step. No claims of tested status without executed commands.

## Phase 1 — State, content and design system

- [ ] Define `SceneId`, `ExperienceState` union, transition action contracts, typed scene registry.
- [ ] Replace scroll progress as navigation state; remove obsolete scroll coupling.
- [ ] Create content stubs for five scenes and safe placeholder project/experience records.
- [ ] Define palette, typography, panel, dock, marker and focus tokens.
- [ ] Build accessible DOM shell and responsive safe-area layout.
- [ ] Add route-independent return-to-overview and scene navigation contract.
- [ ] Unit test state transitions, invalid destinations and repeated selections.

**Acceptance:** DOM-only prototype navigates welcome → overview → each scene → overview without scroll; state machine is deterministic.

## Phase 2 — Island geography blockout

- [ ] Replace central pitch as island motif with irregular larger landmass and believable rocky underside.
- [ ] Build balanced central mountain, forested slopes, snow cap and occluding ridges.
- [ ] Add rough river source, waterfall, meandering channel, bridge and island-edge spill.
- [ ] Block out office hillside, city plateau, stadium valley, nature clearing and sheltered family valley.
- [ ] Create landmark proxy meshes and simple paths connecting areas.
- [ ] Use spec anchor coordinates as first pass; adjust for visibility and scene scale.
- [ ] Capture overview from target desktop/mobile aspect ratios and check far-side concealment.
- [ ] Check no floating props, geometry intersections, or obvious path discontinuities.

**Acceptance:** Single coherent island, balanced mountain, river, all five legible zones; professional near-side landmarks visible and far-side partly hidden.

## Phase 3 — Camera rig and navigation choreography

- [ ] Define authored welcome/overview/five scene poses and focal targets.
- [ ] Add debug-only pose/route tuning tool; store approved numeric poses in source.
- [ ] Build camera controller with sole camera ownership; remove pointer parallax.
- [ ] Author curved routes that clear mountain, terrain, buildings and foliage.
- [ ] Add 2–4 second typical transitions, configurable and skippable/reduced-motion.
- [ ] Implement direct scene-to-scene transitions and return-to-overview.
- [ ] Lock/cancel overlapping transitions; handle rapid input, resize, hidden tab and unmount.
- [ ] Add tests for state progression, route completion and interrupted transitions.

**Acceptance:** Every destination reachable from every other; no clipping/teleporting, no scroll/free camera control, no stuck transition state.

## Phase 4 — Welcome and cinematic arrival

- [ ] Wide establishing camera and atmospheric cloud layers.
- [ ] Minimal stylised avatar waving; ensure it does not dominate island composition.
- [ ] Add readable DOM title/intro and **Come on in** CTA.
- [ ] Animate fade and dramatic camera flight into overview; provide visible skip affordance.
- [ ] Prevent replay when returning to overview; define fresh reload behavior.
- [ ] Add reduced-motion alternative and HTML fallback when Canvas unavailable.
- [ ] Check mobile framing and safe-area placement.

**Acceptance:** Clear welcome, explicit CTA, smooth cinematic reveal, functional skip, and no required WebGL to read intro.

## Phase 5 — Dock, markers and information panels

- [ ] Implement persistent dock for Office, City, Stadium, Nature, Family and Overview.
- [ ] Implement always-visible overview markers with labels and correct occlusion/directional hints.
- [ ] Ensure markers disappear/de-emphasize when viewing close scenes.
- [ ] Keep dock active selection and marker state in sync with central registry.
- [ ] Add scene information panels and readable expandable details.
- [ ] Mirror all 3D interactions with keyboard-accessible DOM controls.
- [ ] Handle mobile dock expansion, touch targets, safe areas, focus management and announcements.
- [ ] Test markers don't show through terrain and never obstruct primary focal points.

**Acceptance:** All five scenes accessible by dock and markers; overview markers persist; keyboard/touch parity; panels remain readable.

## Phase 6 — Office / project showcase

- [ ] Model cosy office house with desk, screens, books, plants and warm windows.
- [ ] Add subtle smoke/leaves/window-light animation.
- [ ] Add project displays and clickable 3D hotspots paired with DOM project list.
- [ ] Create project detail panel (summary, role, media, stack, links).
- [ ] Ensure placeholders are unmistakable and no projects are fabricated.
- [ ] Check project interactions on keyboard and touch.

**Acceptance:** Office conveys creative work and project content remains usable without selecting 3D objects.

## Phase 7 — City / work experience

- [ ] Build compact city with roads, plateau, buildings and a readable skyline.
- [ ] Define building-to-career-chapter mapping with typed content.
- [ ] Add selectable buildings plus DOM career timeline.
- [ ] Add restrained urban motion/lighting without heavy draw calls.
- [ ] Verify no fabricated employers, roles or dates.

**Acceptance:** Distinct career destination, clear navigation and accessible timeline.

## Phase 8 — Stadium / football interest

- [ ] Create proportionate pitch, stands, goals, floodlights and scoreboard.
- [ ] Add restrained flags and stadium ambience visual cues.
- [ ] Avoid heavy crowds and avoid football as world centerpiece.
- [ ] Add personal-interest panel with placeholder copy.
- [ ] Check stadium is partly hidden from initial overview and revealed on arrival.

**Acceptance:** Recognisable stadium, atmospheric and performant, not a separate disconnected world.

## Phase 9 — Nature / riverside picnic

- [ ] Place grassy riverbank clearing in mountain foothills.
- [ ] Model **picnic basket as primary focal point**, optional blanket/book/cup/fruit.
- [ ] Add flowing river, wildflowers, rocks, trees and bridge within camera composition.
- [ ] Add restrained water/grass/bird movement.
- [ ] Keep information panel short and non-intrusive.
- [ ] Validate picnic basket legibility on narrow mobile viewport.

**Acceptance:** The scene reads immediately as a peaceful riverside picnic, with a clear basket focal point.

## Phase 10 — Family / home

- [ ] Build warm family home in sheltered valley, garden, path, warm windows.
- [ ] Add environmental details (swing, bicycle, toys, flowers, mugs) if they fit composition.
- [ ] **Do not depict any people, silhouettes, avatars, portraits or human figures.**
- [ ] Avoid identifying family information, ages and likenesses.
- [ ] Add short, privacy-conscious panel with approved or placeholder copy.
- [ ] Verify scene remains warm and personal through architecture/environment alone.

**Acceptance:** Clearly homely house and garden; no human depictions anywhere in the family scene.

## Phase 11 — Ambient audio system

- [ ] Create muteable audio manager with explicit opt-in; start muted.
- [ ] Load audio assets lazily and track license/credits.
- [ ] Add distinct ambient beds for overview, office, city, stadium, nature, family.
- [ ] Crossfade on navigation; avoid overlapping sound loops and sudden volume spikes.
- [ ] Support autoplay restrictions, mute persistence policy, tab hidden, audio context errors.
- [ ] Make sound control accessible and usable by keyboard/touch.
- [ ] Test experience with audio disabled or unsupported.

**Acceptance:** Silent by default, audible only after opt-in, smooth transitions, no audio dependency for navigation.

## Phase 12 — Assets, performance and resilience

- [ ] Identify which blockout elements benefit from Blender GLBs; keep simpler geometry procedural.
- [ ] Track asset provenance and licenses, including audio.
- [ ] Optimize geometry, materials, instancing, textures, LOD and DPR by device tier.
- [ ] Add asset loading UI and error boundaries, retry path, no-WebGL static fallback.
- [ ] Ensure DOM navigation and content available even if 3D assets fail.
- [ ] Test low-end mobile, battery/thermal behavior and slow network where available.
- [ ] Measure and document real device performance; define budgets from profiling rather than guessing.
- [ ] Check GPU cleanup, scene disposal, memory leaks and background-tab behavior.

**Acceptance:** Stable usable experience across supported devices and graceful fallback on unsupported hardware.

## Phase 13 — Accessibility, content, SEO and quality assurance

- [ ] Test keyboard-only journey including welcome, dock, panels, sound and return.
- [ ] Test screen reader landmarks, scene announcements and focus restoration.
- [ ] Verify reduced motion and non-WebGL equivalents.
- [ ] Verify contrast, touch target sizes, responsive typography and safe-area layout.
- [ ] Add metadata, social preview, semantic headings and sitemap as appropriate.
- [ ] Integrate only user-approved real project/career/personal copy and images.
- [ ] Test browser matrix (modern Chromium, Firefox, Safari) and mobile browsers.
- [ ] Run lint, typecheck, build and relevant automated tests; document results.
- [ ] Conduct visual QA of welcome, overview and all five destinations at desktop/mobile sizes.
- [ ] Confirm all links, content and fallback states work without invented details.

**Acceptance:** Portfolio content accessible, no major interaction regressions, deployment build verified.

## Phase 14 — Release and post-launch

- [ ] Configure hosting, production environment and error reporting only as approved.
- [ ] Check caching and CDN for GLB, textures and audio.
- [ ] Test deployed URLs, metadata, navigation and mobile performance.
- [ ] Capture final screenshots and known limitations.
- [ ] Write maintenance notes for adding projects/career chapters and replacing assets.
- [ ] Define a short, prioritized post-launch backlog (not speculative scope creep).

**Acceptance:** Deployable, documented experience with verified production smoke test.

## Suggested initial folder layout (adapt to actual repository)

```text
src/
  app/
  components/
    experience/
      ExperiencePage.tsx
      WorldCanvas.tsx
      WelcomeExperience.tsx
      ExperienceNavigation.tsx
      SceneInformation.tsx
      AmbientAudio.tsx
      SceneFallback.tsx
    world/
      World.tsx
      camera/
        CameraRig.tsx
        cameraPositions.ts
        cameraRoutes.ts
      environment/
        FloatingIsland.tsx
        CentralMountain.tsx
        River.tsx
        Atmosphere.tsx
      scenes/
        OfficeScene.tsx
        CityScene.tsx
        StadiumScene.tsx
        NatureScene.tsx
        FamilyScene.tsx
      navigation/
        WorldMarkers.tsx
  content/
    scenes.ts
    projects.ts
    experience.ts
  store/
    experience-store.ts
public/
  models/
  textures/
  audio/
  images/
```

## Milestone review checklist (repeat after every phase)

- [ ] Demo or screenshots show implemented scope clearly.
- [ ] List changed files and why.
- [ ] Report actual lint/typecheck/build/test commands and outcomes.
- [ ] Document deviations from approved spec and why.
- [ ] Note remaining placeholders and asset/license gaps.
- [ ] Name next phase and its acceptance criteria.

## Stop / ask user only when necessary

Ask for real content, copyrighted assets/licenses, final branding copy, deployment credentials or genuinely ambiguous high-impact design choices. Do **not** ask to reconfirm settled mountain/avatar/markers/audio/picnic/family decisions. Do not treat speculative coordinates or suggested camera durations as immutable constraints.
