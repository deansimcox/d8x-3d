# Island expansion and polish

- Widened the irregular terrain from roughly 39 × 33 to 59 × 49 units in radius (about 2.25× usable surface area). Moved the five destinations apart at their original miniature scale. Added meadow contours and a deeper, tapered underside.
- Added destination clearings and camera-to-subject corridors. The camera travels around the island perimeter and can be redirected or skipped. Portrait layouts have their own framing.
- Integrated CC0 Quaternius foliage, rocks and cottage pieces, plus Kenney furniture, city buildings and picnic props. Built the workshop cutaway, family garden, woven basket, bridge and football ground around them.
- Reworked the interface, loading indication, responsive dock, focus states, archive dialogs and the illustrated WebGL fallback. The house contains no people or silhouettes.
- Added opt-in ambient sound with separate wind, river and background layers that crossfade by destination.
- Batched repeated vegetation in spatial groups, reduced mobile foliage and shadow resolution, cached static shadows, and stopped continuous rendering for reduced motion. No post-processing pass or remote model hosting.

Verification: `npm install`, `npm run typecheck` and `npm run build` passed. The Vite dev preview returned HTTP 200. Playwright exercised the production welcome, overview and five destinations at 1280 × 800 and 390 × 844, including navigation retargeting, skip, keyboard focus, both archive dialogs, opt-in sound, reduced motion and unavailable WebGL. Screenshots and console results are in `artifacts/smoke/`.

A final rotation regression test confirmed all five overview markers stay above the dock when changing from 390 × 844 to 844 × 390 in reduced-motion mode. The full suite and rotation check reported no browser errors.

The sampled overview used 332 draw calls after batching, down from 404 before batching. The headless browser used software rendering, so its frame rate does not establish device performance. Vite reports a size warning for the lazy-loaded Three.js world chunk.

Remaining launch work: add real case studies and career entries to `src/content.ts`, review with screen readers, and profile representative physical iOS and Android devices. The site runs without commissioned assets or external audio recordings.
