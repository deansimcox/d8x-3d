# THE WORLD BETWEEN THE LINES — WORLD DESIGN SPECIFICATION

Version 1.0 · Approved concept · 2026-11-05

## 1. North star

A cinematic, accessible personal portfolio expressed as **one connected floating island**. The island combines a vast, believable landscape with charming miniature/diorama details. A **balanced central snow-capped mountain** and a connected **river system** unify five distinct destinations. The mountain hides portions of the far side to create discovery. Professional and personal interests are equally respected; football is one destination, not the central motif.

**Non-negotiable:** Button-driven navigation to **fixed cinematic camera poses**. No scroll-driven camera, free orbit, WASD walking, or pointer camera parallax. Essential text and controls live in accessible DOM, not solely in 3D.

## 2. Approved decisions

| Decision | Approved direction |
|---|---|
| Mountain | Balanced scale: dominant landmark but other destinations visible |
| Welcome avatar | Minimal, stylised, small waving representation; only in welcome scene |
| Welcome | Cinematic wide establishing shot; clouds, wave, dramatic but skippable fly-in |
| Navigation | Both persistent dock and world-space markers |
| Markers | Always visible in overview; never shown through terrain; unobtrusive/hidden at close destinations |
| Sound | Optional ambient environment audio; initially muted until user opts in; no required music |
| Camera | Fixed authored poses and button-initiated camera paths; overview always reachable |
| Office | Cosy house/workspace showcasing projects |
| City | Tiny city representing work history |
| Stadium | Small recognisable football stadium, not world centerpiece |
| Nature | Riverside grassy clearing with **picnic basket** focal point |
| Family | Homely family house and garden, **no people, silhouettes, portraits, or figures** |
| Content | Real professional/family details only after user provides them; placeholders clearly labelled |

## 3. Coordinate conventions and island footprint (initial design targets, not fixed engineering facts)

Use Y up; world center at (0,0,0); welcome camera approaches from +Z. Define island top terrain roughly X -38..38, Z -30..30 (world units), uneven ellipse/crescent silhouette; surface Y varies approx 0..9, with mountain summit around Y 26..32. Floating underside extends to Y -14..-20. These numbers are **starting proportions for blockout**, not locked values. Central mountain sits slightly behind center, around (-1, 0, -4), broad footprint radius 13–17; snow cap only upper portion. The river starts on the northwestern mountain slopes and runs through nature toward near-left edge, with bridges, waterfalls, and an eventual edge spill. Vary elevation with terraces, forest belts, gullies and pathways; avoid a flat circular platform.

### Conceptual top-down zoning (north = far side; +Z = near side)

```text
                       FAR / NORTH (-Z)
             Nature + picnic     Family home
              (-20,-15)           (+20,-16)
                   \               /
              forest / MOUNTAIN / sheltered ridge
                         (-1,-4)
             Stadium                 ridge / river
             (-25,+2)             
                  Office       City
                (-18,+17)    (+18,+14)
                       ARRIVAL (+Z)
```

**Important:** This is a relationship map, not a precise final mesh layout. Adjust placement to ensure: (a) office and city readable from overview, (b) stadium and family partially obscured from overview, (c) nature connected visibly to mountain river, (d) cinematic paths never clip mountain/trees/architecture. Stadium may shift farther behind a western ridge during blockout. Family should be private and not visually prominent from initial arrival.

### Initial blockout anchor data

| Anchor | Approx world X,Y,Z | Relative scene purpose |
|---|---|---|
| Mountain peak | -1,29,-4 | Central silhouette and occlusion |
| Office | -18,4,17 | Near-side left, warm house |
| City | 18,6,14 | Near-side right plateau |
| Stadium | -25,3,-3 | Western far-side valley, partly hidden |
| Nature picnic | -18,5,-17 | Grassy riverbank clearing |
| Family house | 20,5,-16 | Sheltered far-side valley |
| River source | -9,15,-10 | Falls into wooded slopes |
| Arrival focus | 0,6,3 | Establish geography |

These are **conceptual scene anchors**; validate with visual blockout, scale and camera sightline tests before treating as production transforms.

## 4. Geography and visual storytelling

- **Mountain:** broad rocky foothills, forest lower slopes, exposed mid-rock, small snow cap; major ridges create sightline reveals. No implausibly huge peak.
- **River:** physically continuous water course from upper falls through forest, near picnic, bridges, to an island-edge cascade; prioritize readable silhouette and modest geometry.
- **Paths:** winding dirt/stone paths, steps, bridges connect all places visually, even though visitors do not control a walking character.
- **Underside:** layered rock, roots and occasional hanging vegetation; believable mass rather than tiny cone.
- **Atmosphere:** coherent world-wide daylight base with scene-local practical lights and exposure accents; do not abruptly change world time-of-day on every navigation.
- **Palette:** forest #183D2B, grass #8EAF68, cream #F3F0E5, sunset #D99B65, charcoal #171B19.

## 5. Scene art and interaction briefs

### Welcome
Wide camera sees island suspended among clouds. Small minimal avatar waves on a foreground ledge or welcome element. DOM headline and **Come on in** button. Avatar is not a full player character, not shown in family scene. Button dismisses overlay, performs skippable fly-in, ends at overview. Do not auto-replay welcome on return-to-overview; refresh behaviour can be configured later.

### Overview
Elevated three-quarter view; mountain center; office/city immediately legible, stadium/nature/family partly teased by landmark shapes. All five **overview markers always visible if their destination is in line of sight**. For occluded destinations, use edge-of-ridge directional indicators or dock; **do not render pins through mountains**. Markers must have DOM accessible equivalents. Bottom navigation dock always available after arrival; overview button persistent. No hover-only navigation.

### Office — projects
Warm hillside home, windows, books, desk/screens, plants, chimney/leaf motion. Physical project displays can be selected, but each project must also be accessible in a DOM project list. Project details: title, summary, role, screenshots, stack, links (only when provided). No invented projects.

### City — experience
Compact plateau city, buildings as career chapters; paths/streets show progression. Building interaction mirrors accessible DOM experience list. Use actual employer names/roles/dates only after user supplies them. No invented employment facts.

### Stadium — football
Correctly proportioned pitch, stands, floodlights, scoreboard and flags. Dusk mood via local light treatment, not a separate incompatible global sun. Football interest is personal; no fabricated favorite team or match statistics. Avoid heavy crowd geometry.

### Nature — riverside picnic
A grassy riverbank clearing with a **picnic basket as primary focal point**, optionally a blanket, book, cup or fruit. River current, small bridge, wildflowers, rocks, gentle grass motion, bird ambience. Quiet, contemplative destination with short DOM blurb, not a large information-heavy interface. Keep props modest and legible from fixed camera.

### Family — homely house
A cosy family home in sheltered valley, warm glowing windows, path, flowers, garden, perhaps swing/bicycle/toys or mugs. **No people, no silhouettes, no avatars, no portraits, no human figures.** Convey family life through architecture and environmental objects only. No children's names, ages, identifiable details or likenesses. Scene stays timeless.

## 6. Camera system

Use authored pose data `{position, target, fov?, duration?, pathId?}`. Suggested first-pass views (not calibrated):

| View | Shot intent |
|---|---|
| Welcome | Far +Z, elevated, island relatively small in frame |
| Overview | Elevated +Z three-quarter; mountain framed with near-side destinations |
| Office | Close exterior with view toward desk/workspace |
| City | Oblique elevated miniature streets/buildings |
| Stadium | Low wide stadium framing, pitch legible |
| Nature | Picnic basket foreground, river midground, forest/mountain behind |
| Family | Intimate exterior with garden and glowing house windows |

Store poses in a central registry; tune numerically in a debug-only camera editor. Camera should follow authored spline/waypoints around ridges, not simply lerp straight through terrain. Arrival ~3–5s and skippable; typical scene changes ~2–4s (tune for usability). Sequence: close current panel → mark transitioning → animate camera/target in single owner → settle → open destination panel. Disable conflicting interactions or implement intentional cancellation safely. Direct scene-to-scene routes supported, as is overview. Handle tab hidden, route interruption, resize and reduced-motion. GSAP may drive poses; R3F `useFrame` must not also overwrite the camera. Pointer parallax removed.

## 7. State and UI contract

```ts
type SceneId = 'office' | 'city' | 'stadium' | 'nature' | 'family';
type ExperienceState =
  | { mode: 'welcome' }
  | { mode: 'overview' }
  | { mode: 'transitioning'; target: SceneId | 'overview' }
  | { mode: 'scene'; activeScene: SceneId };
```

Dock: five destinations + overview, active selection, keyboard/touch accessible, responsive compact mobile mode. World markers visible in overview, synchronised with dock; no essential text in 3D. Scene information panels include heading, concise blurb, accessible details and close/back affordance. Keep important content indexed/readable even when 3D cannot load. Support deep links optionally in later phase; do not create unrelated routes prematurely.

## 8. Audio contract

Ambient only, no required music. Start muted; explicit opt-in to enable. Persist preference only with user consent/normal local preference mechanism; handle browser autoplay rules and WebAudio failures. Crossfade soundscape on destination changes, do not stack loops. Overview: wind/birds; office: leaves/breeze; city: distant low urban sounds; stadium: subdued crowd/flags; nature: river/birds/grass; family: evening garden breeze. Always offer mute control; no sudden volume spikes. Load audio lazily; audio failure must not block experience. Optional positional audio only if it improves experience without accessibility cost.

## 9. Loading, accessibility, resilience

- Render a meaningful HTML welcome and navigation fallback before WebGL is ready; progressive enhancement.
- Provide progress/indeterminate loading state, retry for recoverable asset failures, static world image or accessible DOM alternative for no WebGL.
- Honor `prefers-reduced-motion`: shorter fades or immediate scene changes, skip dramatic fly-in; user-controlled skip button.
- Keyboard accessible dock, markers mirrored by DOM buttons, clear focus, readable contrast, semantic landmarks and headings, appropriate screen reader announcements after transition.
- Touch targets ~44 CSS px, safe-area-aware dock, avoid panels hiding island focal points on narrow screens.
- Avoid heavy shaders, expensive dynamic shadows, unbounded particles; instance foliage; compressed GLB/KTX2 where useful; responsive DPR and quality tiers.
- Avoid identifying family content. Do not fabricate personal facts, client logos, awards, endorsements or contact details.

## 10. Art / asset strategy

Start with blockout geometry and camera sightlines, then selectively upgrade to Blender GLBs or licensed models. Favor modular mountain, terrain, water, architecture, vegetation, picnic props, stadium, city. Track attribution/licenses for third-party assets and audio. Use baked light/shadows where feasible. Keep assets reusable and independently loadable.

## 11. Experience acceptance criteria

- [ ] One connected island with central mountain, river, five spatially distinct scenes.
- [ ] Balanced mountain conceals part of far side; no clipping or camera path through terrain.
- [ ] Welcome has minimal waving avatar, cinematic fly-in and skip/reduced-motion path.
- [ ] No scrolling, free camera orbit or pointer-parallax navigation.
- [ ] Dock reaches all five scenes and overview from every scene.
- [ ] Markers always appear in overview and never show through terrain.
- [ ] Nature clearly includes riverside picnic basket focal point.
- [ ] Family shows homely house with absolutely no people/figures.
- [ ] Ambient sound is opt-in, muteable, crossfades and fails gracefully.
- [ ] DOM panels and navigation work without WebGL.
- [ ] Tested on mobile/desktop, keyboard, reduced motion, and constrained devices.

## 12. Open items intentionally deferred

Real projects, employment timeline, approved personal copy, final domain/contact details, exact 3D models, audio licenses, final camera numeric poses and mobile performance budgets are not supplied. Use placeholders and request approval at content integration stage. No additional creative signoff required to begin a blockout.
