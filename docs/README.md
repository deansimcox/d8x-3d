# d8x.dev project handoff

The current portfolio lives in this repository. [AGENTS.md](../AGENTS.md) records the current project rules. The older design spec, implementation plan, first OpenCode prompt and polish changelog in this folder record earlier iterations.

The intro presents Dean's role, portrait, profile links and asset credits alongside a wide island view. The d8x.dev badge returns to that intro. Overview has destination markers, and the dock follows the trail in this order: Projects, Work, Football, Family, Outdoors. Visitors can skip camera journeys, pan from a fixed viewpoint in each scene, and press Home to recenter. The scene card and camera framing adjust together when the story is collapsed. Reduced motion uses immediate camera and layout changes.

| Area | Current implementation |
| --- | --- |
| Projects | The camera enters the workshop through its window. Three animated displays show an editor, a responsive preview and a build terminal. The archive includes The Village Wellness Centre and d8x.dev case studies. |
| Work | A small city and coffee shop frame the career archive, with entries for HBF and Precedent. |
| Football | The east side has an open village ground, stands on four sides, two supporter palettes, floodlights, a 3–2 scoreboard and opt-in cheering. The earlier full bowl is retained as an unused asset. |
| Family | The house is on the northern ridge, screened from Matchday by trees. The yard includes bikes, toys, a veggie patch, chickens, a telescope and stepping stones. |
| Outdoors | The riverside has a picnic, animated deer and butterflies, a waterfall, and the footbridge that closes the island trail loop. Plant and rock placement uses the same trail route as the rendering. |
| Sky | Clouds, birds, a balloon, a vintage biplane, a ferry and a lighthouse add detail around the island. |
| Sound and fallback | Ambient sound starts muted and is synthesized in the browser. The illustrated guide appears automatically when WebGL is unavailable. |

Edit the bio, navigation and overlays in `src/main.tsx`, `src/content.ts` and `src/Details.tsx`. Camera journeys live in `src/world/CameraRig.tsx`, island geography in `src/world/layout.ts`, and trail coordinates and clearance in `src/world/trail.ts`. The original and prepared models are documented in the [asset inventory](ASSET_ATTRIBUTIONS.md).

Before pointing the domain at a host, use the [launch checklist](../REVIEW_CHECKLIST.md) to validate the preview and deployed build. Build, type and browser checks used throughout development have been local. Production URL, HTTPS and real-device performance still need verification on the chosen host.

Use `/#projects` or `/#work` to share a direct link to either archive. A visit to either URL opens the HTML archive before loading the 3D world. The island loads after the archive closes. The workshop plants and woodland deer load on first approach to their destinations.

A local Chromium run used a 390 × 844 mobile viewport, cold cache, software WebGL, reduced motion, 8 Mbps down, 3 Mbps up and 150 ms latency. Initial model requests fell from 40 to 36 (10.63 MB to 9.17 MB of GLB payload), and the loading indicator cleared at about 27.0 s before the change and 21.9 s after it. These are single emulated runs. Check real-device and hosted timings before launch.
