# Hyphosphere

Hyphosphere is a deterministic research-terrain prototype for the OpenAI WebMCP Challenge. It lets a researcher follow a relationship across heterogeneous source objects, inspect its evidence status, compare cases, switch to a source Terrain view, and save a durable Discovery.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## WebMCP testing

The app registers these tools through `document.modelContext.registerTool(...)` when opened in a WebMCP-compatible environment:

- `follow_relationship` — extend the active investigation and reveal the next objects.
- `get_evidence` — open the evidence drawer for a research object.
- `set_evidence_threshold` — switch between the full terrain and verified-only evidence.
- `show_terrain` — open the source ecology view.
- `save_discovery` — save the active finding with its trail and evidence states.
- `search_research` — search local research objects and the curated external source index.

The human controls and WebMCP handlers use the same deterministic domain actions. The demo corpus and external source index are intentionally curated and reproducible; the source cards link to original datasets, databases, and reports without making the judging demo depend on live search, authentication, or an unstable API.

## Implemented in this prototype

- Distinctive research-terrain visual language.
- Thread, Map, Terrain, Evidence, and Compare views over shared investigation state.
- Signature `Follow this` interaction with progressive reveal and Investigation Trail updates.
- Verified, supported, inferred, and disputed evidence states.
- Evidence inspection drawer with basis and provenance notes.
- Deterministic demo corpus with reporting, archived webpages, datasets, platform artefacts, commercial services, and infrastructure records.
- Curated external source index with original links, source descriptions, and inclusion rationales.
- Saved Discovery state and Markdown export.
- Responsive layout and reduced-motion support.

## Planned for the larger Hyphosphere Observatory

Live corpus ingestion, authenticated private research materials, richer source previews, collaborative notebooks, production persistence, automatic external archive imports, and the wider Observatory research roadmap are future work. They are not represented as implemented in this prototype.

## Release checklist

- See [DEMO-SCRIPT.md](./DEMO-SCRIPT.md) for the timed walkthrough and [RELEASE-CHECKLIST.md](./RELEASE-CHECKLIST.md) for submission readiness.

- [x] Local build succeeds.
- [x] Human interface and WebMCP actions share domain logic.
- [x] Deterministic principal investigation exists.
- [x] Evidence-state distinctions are visible.
- [x] Discovery Markdown export works.
- [ ] Public repository and challenge-compatible live URL.
- [ ] Official WebMCP environment test on the deployed version.
- [ ] Public under-three-minute demo video with audio.
- [ ] Final third-party asset and submission review.
