# Warm island asset shortlist

Update: the five primary packs have been sourced and 36 models integrated. See [asset credits](ASSET_ATTRIBUTIONS.md) and `public/models/manifest.json`. The research notes below describe the original shortlist.

Research date: 5 November 2026. This is a sourcing shortlist, not an inventory of downloaded or integrated assets. Licence statements below were checked on the linked creator pages; preserve the licence bundled with each actual download before integration.

## Recommended direction

Soft stylized foliage, cream plaster, timber, terracotta roofs, warm windows and restrained garden clutter. Use Quaternius nature as the visual anchor. Adapt architecture and supporting props to the same palette rather than combining entire unrelated packs unchanged. Creator showcase lighting and engine shaders are not the appearance the raw meshes will automatically have in Three.js.

| Priority | Pack / original source | Intended use | Verified terms / limits |
| --- | --- | --- | --- |
| 1 | [Quaternius Stylized Nature MegaKit](https://quaternius.com/packs/stylizednaturemegakit.html) | Softer tree silhouettes, garden flowers, rocks and riverside planting | Page lists CC0 and glTF. Full kit advertises 116 models; page says free tier contains 60–70%, with additional paid tiers. Custom wind/leaf shaders belong to Source engine projects and need a Three.js implementation. |
| 2 | [Quaternius Medieval Village MegaKit](https://quaternius.com/packs/medievalvillagemegakit.html) | Select cottage walls, roofs, doors, windows and vines for office/home | Page lists CC0 and glTF; full kit advertises 304 models, with only a subset free. Keep cottage proportions; avoid turning the portfolio into a medieval village. |
| 3 | [Kenney Furniture Kit](https://kenney.nl/assets/furniture-kit) | Office furniture and domestic details | Creator page: 140 files, CC0, free download. Check exact model inventory in archive before choosing individual pieces. |
| 4 | [Kenney City Kit (Commercial)](https://kenney.nl/assets/city-kit-commercial) | Career district buildings and storefront detail | Creator page: 50 files, CC0. Select a small group and soften their palette. |
| 5 | [Kenney City Kit (Suburban)](https://kenney.nl/assets/city-kit-suburban) | Alternative contemporary home architecture | Creator page: 40 files, CC0. Alternative to the village architecture, rather than a second competing house style. |
| 6 | [Kenney Food Kit](https://kenney.nl/assets/food-kit) | A few picnic food props | Creator page: 200 files, CC0. Supporting detail; the basket remains the focal point. |
| Backup | [Quaternius Ultimate Stylized Nature](https://quaternius.com/packs/ultimatestylizednature.html) | Alternative nature family if MegaKit free selection is insufficient | Creator page lists 63 models, CC0, glTF and other formats. |
| Backup | [Kenney Fantasy Town Kit](https://kenney.nl/assets/fantasy-town-kit) | Simpler modular cottage option | Creator page lists 160 files, CC0. Likely needs more art direction to move beyond the current simple geometry aesthetic. |

CC0 permits commercial use and modification without required attribution. Keep voluntary creator credits and copies of the downloaded licences. Do not infer a library-wide licence for Poly Pizza or Sketchfab; verify each individual model if either is used later.

## Unresolved sourcing

- No individual picnic basket or football stadium model has been selected or licence-verified. Do not substitute a picnic table for the basket brief.
- Download archives have not been inspected; exact free-tier filenames, triangle counts, materials and texture sizes remain unmeasured.
- No pack previews have been evaluated inside the actual scene yet. These are promising candidates, not approved production assets.

## Integration sequence

1. Establish the wider island layout and protected camera sightlines before committing foliage positions.
2. Trial one tree, one rock and one cottage facade in the office composition; evaluate desktop and mobile screenshots with the existing lighting.
3. Store selected converted GLBs and textures locally in public/models, retaining licence evidence in an attribution record. Do not load creator-hosted assets at runtime.
4. Inspect texture colour spaces, transparency, shadow behaviour, scale and orientation. Share materials and instance repeated foliage; avoid cloning hundreds of unique scene graphs.
5. Measure transferred bytes, draw calls, texture memory and frame times before extending the trial across the island. Compress only after establishing a visually correct baseline.

## Repository observations

The current public folder contains only favicon.svg; there is no imported model pipeline. Landmarks in src/world/landmarks.tsx are primitive geometry. The active terrain and instanced tree system live in src/world/artDirection.tsx. Camera poses and transitions are in src/world/World.tsx. Current vegetation exclusion uses circles around fixed coordinates, so imported taller trees will still need camera-to-subject corridor checks. Model replacement alone will not resolve crowded geography or blocked compositions.

Research-only change: no runtime files altered, no build or visual validation claimed.
