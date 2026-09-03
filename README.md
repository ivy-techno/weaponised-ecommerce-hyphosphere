# Hyphosphere — Weaponised Ecommerce Observatory

Hyphosphere is a human–agent research terrain for the OpenAI WebMCP Challenge. It helps a researcher trace the less visible commercial infrastructure that may enable online information operations, while keeping citations, evidence states, and human judgement attached to every lead.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## WebMCP testing

The app registers twelve tools through `document.modelContext.registerTool(...)` when opened in a WebMCP-compatible environment:

- `follow_relationship` — extend the active investigation and reveal the next objects.
- `get_evidence` — open the evidence drawer for a research object.
- `set_evidence_threshold` — switch between the full terrain and verified-only evidence.
- `show_terrain` — open the source ecology view.
- `save_discovery` — save the active finding with its trail and evidence states.
- `draft_possible_output` — turn the active cluster into a cautious draft summary and micro case study.
- `list_source_collections` — list linked datasets, reports, databases, and repositories by ecommerce-stack level.
- `search_research` — search local research objects, the linked source index, or both.
- `run_research_brief` — place a small candidate set on screen for researcher review.
- `save_agent_brief` — retain a reviewed brief in the device-local notebook.
- `publish_signal_feed` — place current, HTTPS-linked headlines supplied by an agent into the visible signal feed.
- `save_signal_feed_item` — retain one reviewed signal lead in the notebook.

The human controls and WebMCP handlers use the same domain actions and visible state. The deterministic corpus keeps the principal judging path reproducible. Separately, an agent can conduct current research, call `publish_signal_feed`, and place link-backed candidates into the page for the human to pause, inspect, cite, and save. The page does not pretend that its browser independently fetched those results.

## Implemented in this prototype

- Distinctive research-terrain visual language.
- Thread, Map, Terrain, Evidence, and Compare views over shared investigation state.
- Signature `Follow this` interaction with progressive reveal and Investigation Trail updates.
- Verified, supported, inferred, and disputed evidence states.
- Evidence inspection drawer with basis and provenance notes.
- Deterministic demo corpus with reporting, archived webpages, datasets, platform artefacts, commercial services, and infrastructure records.
- Curated external source index with original links, source descriptions, and inclusion rationales.
- Agent-mediated signal feed with direct citations, infowar labels, ecommerce-stack positions, pause/resume, and notebook capture.
- Agent-assisted research briefs that can be retained and compared with existing notebook assets.
- Saved Discovery state, device-local notebook, and Markdown export.
- Responsive layout and reduced-motion support.

## Challenge provenance

The wider thesis topic, research interests, source collections, and proposed Observatory predate this challenge. The submitted Hyphosphere web application—its interface, deterministic investigation, shared notebook, registered WebMCP tools, agent research brief, and agent-mediated signal feed—was implemented in this repository. Its dated Git history begins on 31 August 2026 and records the WebMCP extension through commit `660da42` on 4 September 2026.

See [CHALLENGE-DEVELOPMENT.md](./CHALLENGE-DEVELOPMENT.md) for the explicit prior-work/new-work distinction and [WEBMCP-IMPLEMENTATION.md](./WEBMCP-IMPLEMENTATION.md) for the technical tool inventory.

## Planned for the larger Hyphosphere Observatory

Live corpus ingestion, authenticated private research materials, richer source previews, collaborative notebooks, production persistence, automatic external archive imports, and the wider Observatory research roadmap are future work. They are not represented as implemented in this prototype.

## Release checklist

- See [DEMO-SCRIPT.md](./DEMO-SCRIPT.md) for the timed walkthrough and [RELEASE-CHECKLIST.md](./RELEASE-CHECKLIST.md) for submission readiness.

- [x] Local build succeeds.
- [x] Human interface and WebMCP actions share domain logic.
- [x] Deterministic principal investigation exists.
- [x] Evidence-state distinctions are visible.
- [x] Discovery Markdown export works.
- [x] Open-source licence is present.
- [ ] Public code repository URL.
- [ ] Latest commit published to the challenge-compatible live URL.
- [ ] Official WebMCP environment test on the deployed version.
- [ ] Public under-three-minute demo video with audio.
- [ ] Final third-party asset and submission review.
