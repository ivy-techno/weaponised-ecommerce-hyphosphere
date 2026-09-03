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
- [x] `draft_possible_output` is registered.
- [x] `list_source_collections` is registered with ecommerce-stack filtering.
- [x] `search_research` and `run_research_brief` share the visible research-brief action.
- [x] `save_agent_brief` retains a reviewed brief in the notebook.
- [x] `publish_signal_feed` accepts current HTTPS-linked items from an agent.
- [x] `save_signal_feed_item` retains a reviewed signal lead.
- [x] Human controls and WebMCP handlers share the same domain actions.
- [ ] Run the final tool invocation test in an official WebMCP-compatible environment.

## Evidence for submission

- [x] `npm run build` succeeds.
- [x] Focused Oxlint check for `app/page.tsx` succeeds.
- [x] Local app responds at `http://localhost:3000/`.
- [x] Deterministic corpus is documented and reproducible.
- [x] Implemented features, prior research, challenge work, and future work are distinguished in the repository documentation.
- [x] MIT licence file is present.
- [ ] Confirm the public repository link and access permissions.
- [ ] Confirm the repository About panel detects and displays the licence.
- [ ] Confirm the public URL serves commit `660da42` or its final successor.
- [ ] Record and review the under-three-minute demo with audio.
- [ ] Upload the demo publicly to YouTube and add its URL to Devpost.
- [ ] Capture final screenshots showing the introduction, agent-created brief, signal feed, evidence drawer, and populated notebook.
- [x] Custom domain is active at `https://hyphosphere.site` with SSL enabled.

## Devpost form

- [ ] Add the project name and one-line tagline.
- [ ] Paste the judging-aligned description from `DEVPOST-SUBMISSION.md`.
- [ ] Add the working live URL and public repository URL.
- [ ] Add concise testing instructions, including two sample agent prompts.
- [ ] Add the public YouTube demo URL.
- [ ] Confirm all submission material is in English.
- [ ] Confirm all third-party data links and assets are used consistently with their terms.
- [ ] Save a Devpost draft before final submission.

## Recording notes

Use [DEMO-SCRIPT.md](./DEMO-SCRIPT.md) and the working deployed URL. Avoid presenting future Observatory features as if they are implemented in this prototype.
