# WebMCP implementation

Hyphosphere registers page tools with `document.modelContext.registerTool(...)` in `app/page.tsx`. Human controls and agent tools call the same React domain actions, so an agent operation produces a visible change that the researcher can inspect and, where appropriate, reverse.

## Registered tools

| Tool | Visible or inspectable result |
| --- | --- |
| `follow_relationship` | Extends the active investigation and reveals related objects. |
| `get_evidence` | Opens the evidence drawer for an object or relationship. |
| `set_evidence_threshold` | Switches between full terrain and verified-only evidence. |
| `show_terrain` | Opens the source-ecology page. |
| `save_discovery` | Saves the active finding with its trail and evidence distinctions. |
| `draft_possible_output` | Opens and returns a cautious cluster summary and micro case-study draft. |
| `list_source_collections` | Returns linked sources, optionally filtered by ecommerce-stack level. |
| `search_research` | Searches the deterministic corpus, linked source index, or both. |
| `run_research_brief` | Places a compact, reviewable candidate brief on screen. |
| `save_agent_brief` | Saves the retained brief to the device-local notebook. |
| `publish_signal_feed` | Publishes agent-supplied, HTTPS-linked current leads into the visible feed. |
| `save_signal_feed_item` | Saves a selected feed item to the notebook. |

## Why this is a strong WebMCP use case

Research into information operations crosses incompatible evidence forms: public posts, platform reporting, datasets, investigative databases, commercial services, interfaces, domains, hosting, and infrastructure. A conventional page can display these materials, but it cannot easily let an agent operate the same evidentiary surface while preserving the researcher’s control over inclusion and interpretation.

WebMCP enables a division of labour:

- the agent can find candidates, structure them, apply source and stack labels, follow declared relationships, and populate visible research surfaces;
- the page keeps actions inspectable through evidence drawers, citations, filters, feed controls, and the notebook; and
- the human decides which leads to inspect, retain, compare, cite, or reject.

## Current-signal boundary

`publish_signal_feed` is the bridge for live research. The connected agent performs the current search and supplies a constrained array containing a headline, source title, HTTPS URL, optional source type, freshness note, information-warfare label, ecommerce-stack levels, and relevance note. The page validates the required fields and renders the result for review.

This design avoids claiming that the browser page independently fetched or verified a live source. It also makes the result auditable: every accepted item retains its direct link and can be saved individually.

## Persistence and privacy

The prototype notebook uses browser `localStorage`. Saved discoveries, agent briefs, and signal leads persist on that device and are not uploaded to a production research database. Markdown export provides a portable research note. Production accounts, collaborative storage, and authenticated private corpora are explicitly future work.
