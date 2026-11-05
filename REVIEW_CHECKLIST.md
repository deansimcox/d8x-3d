# d8x.dev launch checklist

The site builds to `dist/`. The checks below apply to the release candidate and, where relevant, the live URL.

- [ ] Build with `npm ci`, `npm run typecheck` and `npm run build`. Preview the production bundle locally.
- [ ] Run the [browser smoke script](scripts/smoke.mjs). On desktop and mobile, open the intro, overview and all five destinations. Check direct transitions, Skip, panning and recentering, panel collapse, and the return to intro.
- [ ] Check keyboard focus and Escape in the two archives, reduced motion, the muted default, opt-in audio, and the WebGL fallback.
- [ ] Confirm the mobile logo and dock insets in portrait. Check short landscape viewports and real iOS and Android devices for clipping, camera framing, load time and rendering performance.
- [ ] Confirm the profile links, project link and public asset credits. Verify that the lighthouse credit, model manifest and bundled licence files are reachable on the preview host.
- [ ] Open `/#projects` and `/#work` in a fresh tab. Confirm that the archive opens without waiting for 3D, the project images load, and Escape returns to the intro.
- [ ] Upload `dist/` to the chosen static host and verify asset paths, direct access to `/credits.html`, custom-domain DNS and HTTPS.
- [ ] Check the browser title, favicon and page description. Decide whether to add a social share image and canonical URL for launch.
- [ ] Smoke-test the final public URL and confirm a previous build can be restored from the host.
