# V3 review checklist

## Visual
- [ ] Opening island silhouette and mountain scale
- [ ] Foreground welcome copy readability against moving world
- [ ] Camera route around the mountain (no geometry clipping)
- [ ] Office, city, stadium, picnic and family house framing
- [ ] Forest density, terrain edges, shadows and colour balance
- [ ] Markers remain discoverable, including far-side destinations
- [ ] Mobile portrait and landscape composition

## Interaction
- [ ] Welcome > overview > all five scenes > overview
- [ ] Navigate directly between destinations
- [ ] Skip a transition and start another
- [ ] Toggle sound and confirm muted-by-default behaviour
- [ ] Open and close project/career placeholder overlays
- [ ] Keyboard focus and Escape behaviour
- [ ] Reduced-motion experience
- [ ] WebGL fallback

## Before public launch
- [ ] Replace project and career placeholders with real content
- [ ] Add original asset work and optimize it (compressed GLBs / KTX2) where warranted
- [ ] Validate WCAG focus contrast, screen-reader flow and motion controls
- [ ] Test Android, iOS, low-end GPUs and browser resizing
- [ ] Run `npm run build` and fix any type/runtime issues
- [ ] Check asset loading, frame rate and memory use
- [ ] Add favicon, Open Graph preview and domain metadata
