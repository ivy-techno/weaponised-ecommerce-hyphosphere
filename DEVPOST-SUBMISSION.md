# Devpost submission draft

## Project name

**Hyphosphere: Weaponised Ecommerce Observatory**

## One-line tagline

A human–agent research terrain for tracing the commercial infrastructure behind online information operations.

## Short description

Hyphosphere helps researchers move beyond the visible post, advert, or takedown and investigate the services, datasets, platforms, interfaces, and infrastructure that may enable an information operation. WebMCP lets an AI agent search, structure, and operate the same visible research terrain as the human, while direct citations, evidence states, and a selective notebook keep interpretation and retention under researcher control.

## Inspiration and problem

Reporting on information operations usually concentrates on the most visible layer: a message, account, campaign, or platform response. The enabling commercial stack is far less visible. Relevant evidence is scattered across reports, datasets, archives, registries, investigative databases, platform disclosures, and infrastructure observations.

The problem is not merely finding more material. Researchers need a way to connect heterogeneous traces without losing provenance, flattening uncertainty, or allowing an automated system to decide what counts as evidence. Hyphosphere treats the stack as an enabling assemblage and gives people a structured place to test relationships across it.

## What it does

- Guides a visitor through a reproducible investigation of a service appearing across different cases.
- Keeps verified, supported, inferred, and disputed relationships visibly distinct.
- Connects artifacts to original citations, inclusion rationales, and positions across six ecommerce-stack levels.
- Lets an agent search the curated terrain and linked source index, then place a compact brief on screen for review.
- Accepts current, HTTPS-linked leads from an agent into a moving signal feed that the researcher can pause and inspect.
- Saves chosen discoveries, briefs, and signal leads into a device-local notebook for comparison and Markdown export.
- Shows possible downstream outputs including research notes, timelines, micro case studies, and network visualisations.

## Why WebMCP is the right fit

The value is not a chatbot beside a static research website. The agent and researcher operate one shared, inspectable interface. An agent can reveal a relationship, open evidence, apply a threshold, search by stack layer, assemble a brief, or publish current linked signals. Each operation changes visible page state, and the researcher can examine the sources before deciding what to retain.

This creates a better experience than copying results between search, chat, spreadsheets, browser tabs, and notes. Assistance remains embedded in the evidentiary workflow, with provenance and uncertainty attached.

## What people and agents can do together

An agent can gather and structure candidate material faster than a person working source by source. A person can recognise context, contest relevance, and make evidentiary judgements that should not be delegated. Together they can:

1. search curated records and linked collections by ecommerce-stack position;
2. produce a small, visible candidate brief rather than an opaque answer;
3. bring current link-backed reporting into the page through the signal-feed tool;
4. inspect the original citation and evidence basis;
5. retain only selected material in a reusable notebook; and
6. turn a reviewed cluster into cautious research notes or a case-study draft.

## How WebMCP was implemented

The React application registers twelve tools through `document.modelContext.registerTool(...)`. The handlers call the same state-changing domain functions as the human interface. Tools cover relationship traversal, evidence inspection, evidence thresholds, source terrain, discovery saving, source listing, stack-filtered search, research briefs, possible-output drafting, current-signal publishing, and selective notebook capture.

The principal Atlas Relay path uses a deterministic corpus so judges can reproduce it. Current research is deliberately agent-mediated: the agent supplies constrained, HTTPS-linked results through `publish_signal_feed`, and the page validates and displays them. This avoids pretending that the page performed an independent live crawl.

## Challenges

The central design challenge was balancing agent initiative with evidentiary caution. If automation silently assembled a polished conclusion, the tool would undermine the research method it was meant to support. Hyphosphere therefore makes agent actions visible, labels uncertainty, keeps citations attached, and asks the human to decide what enters the notebook.

A second challenge was turning a complex research concept into an interface that newcomers could understand. The resulting tabbed terrain uses a guided example, a six-level stack model, progressive disclosure, and repeatable visual cues rather than requiring prior familiarity with the thesis.

## Accomplishments

- Twelve non-trivial WebMCP tools operate visible shared state.
- The deterministic path and agent-mediated live path coexist without being confused.
- Every external lead can retain a direct citation, stack position, and reason for inclusion.
- The notebook captures discoveries, agent briefs, and current signals in one place.
- The distinctive visual system communicates branching relationships and layered infrastructure.

## What was learned

Building the instrument became part of the discovery. Designing agent actions exposed where research assistance is genuinely valuable—finding, structuring, and comparing—and where human judgement must remain explicit. It also demonstrated that the commercial infrastructure of information operations can be made legible without reducing it to another dashboard of visible troll activity.

## What is next

The challenge prototype is a first glimpse of a larger online Observatory. Future work includes authenticated research collections, production persistence, collaborative notebooks, richer temporal and geographic analysis, automated archive ingestion, a reusable case-study database, and researcher-contributed records.

## Testing instructions

1. Open the live URL in ChatGPT’s in-app browser or Chrome with WebMCP enabled.
2. Begin with **Investigation paths** and open the Atlas Relay example.
3. Ask the agent: **“Use this site’s tools to open the evidence for Atlas Relay, then show only verified evidence.”**
4. Ask: **“Search both curated and linked sources for platform infrastructure, prepare a research brief, and leave it visible for my review.”**
5. For the current feed, ask the agent to find two recent, relevant, directly linked reports and publish them with infowar and ecommerce-stack labels.
6. Pause the signal feed, inspect a citation, save one lead, and open **Saved notebook**.

## Submission URLs

- Live project: `https://hyphosphere.site` — **verify that the final commit is deployed before submission**
- Public repository: **TO ADD**
- Public YouTube demo: **TO ADD**

## Suggested screenshots

1. Thesis proof-of-concept introduction and research-area ribbon.
2. Agent-created research brief with stack filtering visible.
3. Agent-mediated signal feed showing citations and stack labels.
4. Atlas Relay evidence drawer with evidence state and provenance.
5. Saved notebook containing a discovery, retained brief, and saved signal lead.

## Final compliance reminders

- Keep the video below three minutes and include spoken audio explaining the functioning WebMCP implementation.
- Use only original or properly licensed music, graphics, and other third-party material.
- Ensure the public repository contains all source code, assets, run instructions, and the visible open-source licence.
- Ensure judges can access the project free of charge throughout judging.
- Verify the final requirements and deadline against the official Devpost page before submitting.
