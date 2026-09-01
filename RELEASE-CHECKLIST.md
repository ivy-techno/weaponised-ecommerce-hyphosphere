# Hyphosphere — release checklist

## Product readiness

- [x] The deployed site has a simple public title: **Hyphosphere**.
- [x] Thread, Map, Terrain, Evidence, and Compare views are present.
- [x] `Follow this` progressively reveals the deterministic investigation path.
- [x] Verified, supported, inferred, and disputed evidence states remain distinct.
- [x] Evidence inspection explains basis and provenance.
- [x] Verified-only filtering works as an evidence threshold.
- [x] Save Discovery and Markdown export are present.
- [x] Responsive layout and reduced-motion support are implemented.

## WebMCP readiness

- [x] `follow_relationship` is registered.
- [x] `get_evidence` is registered.
- [x] `set_evidence_threshold` is registered.
- [x] `show_terrain` is registered.
- [x] `save_discovery` is registered.
- [x] Human controls and WebMCP handlers share the same domain actions.
- [ ] Run the final tool invocation test in an official WebMCP-compatible environment.

## Evidence for submission

- [x] `npm run build` succeeds.
- [x] Focused Oxlint check for `app/page.tsx` succeeds.
- [x] Local app responds at `http://localhost:3000/`.
- [x] Deterministic corpus is documented and reproducible.
- [x] Implemented features and future work are clearly separated in the README.
- [ ] Confirm the public repository link and access permissions.
- [ ] Record and review the under-three-minute demo with audio.
- [ ] Capture final screenshots showing the opening terrain, evidence drawer, comparison, and saved Discovery.
- [x] Custom domain is active at `https://hyphosphere.site` with SSL enabled.

## Recording notes

Use [DEMO-SCRIPT.md](./DEMO-SCRIPT.md) and the working deployed URL. Avoid presenting future Observatory features as if they are implemented in this prototype.
