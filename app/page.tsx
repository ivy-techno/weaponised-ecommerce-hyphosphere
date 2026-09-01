'use client';

import {
  Archive,
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Compass,
  Database,
  Download,
  Eye,
  FileText,
  Filter,
  GitBranch,
  Globe2,
  Layers2,
  Link2,
  Map,
  Network,
  PanelRight,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Waypoints,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type View = 'thread' | 'map' | 'terrain' | 'evidence' | 'compare';
type EvidenceState = 'verified' | 'supported' | 'inferred' | 'disputed';

type ResearchNode = {
  id: string;
  label: string;
  kind: string;
  source: string;
  meta: string;
  evidence: EvidenceState;
  x: number;
  y: number;
  preview: string;
  subtext: string;
  accent: string;
};

type ResearchEdge = {
  id: string;
  from: string;
  to: string;
  label: string;
  evidence: EvidenceState;
  rationale: string;
};

const nodes: ResearchNode[] = [
  {
    id: 'northline',
    label: 'Northline cohort',
    kind: 'CASE',
    source: 'Field notes · 2024',
    meta: '3 related cases',
    evidence: 'verified',
    x: 14,
    y: 28,
    preview: 'A repeated onboarding pattern across two regional cases.',
    subtext: 'Case 04 / fieldwork',
    accent: 'teal',
  },
  {
    id: 'lantern',
    label: 'Lantern House',
    kind: 'CASE',
    source: 'Interview log · 2023',
    meta: '4 supporting sources',
    evidence: 'supported',
    x: 17,
    y: 72,
    preview: 'A structurally similar activity with a different public story.',
    subtext: 'Case 11 / fieldwork',
    accent: 'teal',
  },
  {
    id: 'service',
    label: 'Atlas Relay',
    kind: 'COMMERCIAL SERVICE',
    source: 'Service record · 2024',
    meta: 'linked through service',
    evidence: 'supported',
    x: 45,
    y: 43,
    preview: 'The ordinary infrastructure element hiding in plain sight.',
    subtext: 'Hosted workflow / commercial',
    accent: 'amber',
  },
  {
    id: 'greybox',
    label: 'Greybox traces',
    kind: 'DATASET',
    source: 'Research dataset · v2.1',
    meta: 'appears in 2 datasets',
    evidence: 'verified',
    x: 69,
    y: 25,
    preview: 'A recurrence pattern invisible at the level of individual cases.',
    subtext: '38 rows / 2021–2024',
    accent: 'violet',
  },
  {
    id: 'longarc',
    label: 'The Long Arc',
    kind: 'REPORTING',
    source: 'Archive capture · 2022',
    meta: 'archived source available',
    evidence: 'supported',
    x: 76,
    y: 59,
    preview: 'A public account that adds sequence, but not direct proof.',
    subtext: 'Archived webpage / capture 18',
    accent: 'coral',
  },
  {
    id: 'invite',
    label: 'Invite fragment',
    kind: 'PLATFORM ARTEFACT',
    source: 'Screenshot · 2023',
    meta: 'earlier occurrence available',
    evidence: 'inferred',
    x: 48,
    y: 77,
    preview: 'A small artefact that extends the trail backwards.',
    subtext: 'Screenshot / platform artefact',
    accent: 'pink',
  },
  {
    id: 'harbor',
    label: 'Quiet Harbor CDN',
    kind: 'INFRASTRUCTURE',
    source: 'DNS observation · 2024',
    meta: 'conflicting evidence',
    evidence: 'disputed',
    x: 83,
    y: 82,
    preview: 'A possible shared layer; one source contradicts the match.',
    subtext: 'Infrastructure record / disputed',
    accent: 'slate',
  },
];

const edges: ResearchEdge[] = [
  {
    id: 'northline-service',
    from: 'northline',
    to: 'service',
    label: 'uses',
    evidence: 'supported',
    rationale: 'A service record and a field note share the same account identifier.',
  },
  {
    id: 'lantern-service',
    from: 'lantern',
    to: 'service',
    label: 'resembles',
    evidence: 'inferred',
    rationale: 'The pattern is similar, but the direct service link is not verified.',
  },
  {
    id: 'service-greybox',
    from: 'service',
    to: 'greybox',
    label: 'recurs in',
    evidence: 'verified',
    rationale: 'Atlas Relay appears in 11 rows of the Greybox traces dataset.',
  },
  {
    id: 'greybox-longarc',
    from: 'greybox',
    to: 'longarc',
    label: 'corroborates',
    evidence: 'verified',
    rationale: 'The dataset timeframe overlaps the archived reporting sequence.',
  },
  {
    id: 'service-invite',
    from: 'service',
    to: 'invite',
    label: 'appears in',
    evidence: 'inferred',
    rationale: 'The interface fragment has a visual signature consistent with the service.',
  },
  {
    id: 'invite-lantern',
    from: 'invite',
    to: 'lantern',
    label: 'precedes',
    evidence: 'supported',
    rationale: 'Capture date places the fragment before the Lantern House interview.',
  },
  {
    id: 'longarc-harbor',
    from: 'longarc',
    to: 'harbor',
    label: 'may share',
    evidence: 'disputed',
    rationale: 'A DNS observation suggests a match, while the archive metadata disagrees.',
  },
];

const threadSequence = ['northline', 'service', 'greybox', 'invite'] as const;

const terrainItems = [
  { label: 'Reporting', count: 3, detail: 'headlines + archive captures', color: 'coral', icon: FileText },
  { label: 'Archived webpages', count: 2, detail: 'capture dates + origin', color: 'amber', icon: Archive },
  { label: 'Datasets', count: 1, detail: '38 rows · 6 fields', color: 'violet', icon: Database },
  { label: 'Platform artefacts', count: 4, detail: 'screenshots + fragments', color: 'pink', icon: Layers2 },
  { label: 'Commercial services', count: 2, detail: 'service records', color: 'teal', icon: Globe2 },
  { label: 'Infrastructure', count: 1, detail: 'DNS observation', color: 'slate', icon: Network },
];

const evidenceCopy: Record<EvidenceState, { label: string; color: string; note: string }> = {
  verified: { label: 'Verified', color: 'teal', note: 'directly observed or reproducible' },
  supported: { label: 'Supported', color: 'amber', note: 'backed by more than one source' },
  inferred: { label: 'Inferred', color: 'violet', note: 'a reasoned connection, not proof' },
  disputed: { label: 'Disputed', color: 'coral', note: 'sources disagree or provenance is weak' },
};

const nodeById = (id: string) => nodes.find((node) => node.id === id) ?? nodes[0];

function EvidencePill({ state }: { state: EvidenceState }) {
  const copy = evidenceCopy[state];
  return <span className={`evidence-pill evidence-${copy.color}`}>{copy.label}</span>;
}

function NodeIcon({ kind }: { kind: string }) {
  if (kind === 'DATASET') return <Database size={15} strokeWidth={1.8} />;
  if (kind === 'REPORTING') return <FileText size={15} strokeWidth={1.8} />;
  if (kind === 'COMMERCIAL SERVICE') return <Globe2 size={15} strokeWidth={1.8} />;
  if (kind === 'INFRASTRUCTURE') return <Network size={15} strokeWidth={1.8} />;
  if (kind === 'PLATFORM ARTEFACT') return <Layers2 size={15} strokeWidth={1.8} />;
  return <Target size={15} strokeWidth={1.8} />;
}

function AppMark() {
  return <div className="app-mark" aria-hidden="true"><span /><span /><span /></div>;
}

export default function Home() {
  const [view, setView] = useState<View>('thread');
  const [selectedId, setSelectedId] = useState('service');
  const [evidenceOnly, setEvidenceOnly] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState('');
  const [agentMessage, setAgentMessage] = useState('');
  const [search, setSearch] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const webmcpReady = typeof document !== 'undefined' && Boolean((document as Document & { modelContext?: unknown }).modelContext);
  const [trail, setTrail] = useState([
    { label: 'Northline cohort', detail: 'starting point', time: '09:14', active: false },
    { label: 'Atlas Relay', detail: 'relationship selected', time: '09:16', active: true },
  ]);
  const stateRef = useRef({ view, evidenceOnly, selectedId, followed, saved });

  useEffect(() => {
    stateRef.current = { view, evidenceOnly, selectedId, followed, saved };
  }, [evidenceOnly, followed, saved, selectedId, view]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const selected = nodeById(selectedId);
  const visibleNodeIds = useMemo(() => {
    const ids = new Set(['northline', 'lantern', 'service', 'greybox', 'longarc']);
    if (followed) {
      ids.add('invite');
      ids.add('harbor');
    }
    return ids;
  }, [followed]);

  const filteredNodes = useMemo(
    () =>
      nodes.filter((node) => {
        const matchesSearch = `${node.label} ${node.kind} ${node.source}`.toLowerCase().includes(search.toLowerCase());
        const matchesEvidence = !evidenceOnly || node.evidence === 'verified';
        return matchesSearch && matchesEvidence;
      }),
    [evidenceOnly, search],
  );

  const filteredEdges = useMemo(() => edges.filter((edge) => !evidenceOnly || edge.evidence === 'verified'), [evidenceOnly]);

  const pushToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3600);
  }, []);

  const announce = useCallback((message: string) => {
    setAgentMessage(message);
    pushToast(message);
  }, [pushToast]);

  const followNode = useCallback((id = 'service') => {
    const target = nodeById(id);
    setSelectedId(id);
    setFollowed(true);
    setTrail((current) => [...current.map((item) => ({ ...item, active: false })), { label: target.label, detail: 'path followed · 2 objects revealed', time: '09:18', active: true }]);
    setAgentMessage(`Followed ${target.label}. Two related objects entered the terrain.`);
    pushToast(`Path extended through ${target.label}`);
  }, [pushToast]);

  const openEvidence = useCallback((id?: string) => {
    const targetId = id ?? stateRef.current.selectedId;
    setSelectedId(targetId);
    setEvidenceOpen(true);
    setAgentMessage(`Evidence drawer opened for ${nodeById(targetId).label}.`);
  }, []);

  const toggleVerified = useCallback(() => {
    setEvidenceOnly((current) => {
      const next = !current;
      setAgentMessage(next ? 'Showing verified evidence only.' : 'Showing the full evidence terrain.');
      return next;
    });
  }, []);

  const inspectTerrain = useCallback((label: string) => {
    announce(`${label} layer selected. The investigation remains anchored to the shared trail.`);
  }, [announce]);

  const saveDiscovery = useCallback(() => {
    setSaved(true);
    setAgentMessage('Discovery saved with its trail, evidence classes, and provenance.');
    pushToast('Discovery saved to your notebook');
  }, [pushToast]);

  const exportDiscovery = useCallback(() => {
    const markdown = `# The service beneath the surface\n\nSaved from Hyphosphere on 31 August 2026.\n\n## Finding\nAtlas Relay appears across the Northline cohort and the Greybox traces dataset. The service connection is supported; the extension to Invite fragment remains inferred.\n\n## Evidence state\n- Verified: Greybox traces recurrence\n- Supported: Northline cohort → Atlas Relay\n- Inferred: Atlas Relay → Invite fragment\n- Disputed: The Long Arc → Quiet Harbor CDN\n\n## Investigation trail\nNorthline cohort → Atlas Relay → Greybox traces → Invite fragment\n\n## Source classes\nReporting · archived webpages · dataset · platform artefacts · commercial services · infrastructure records\n`;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'hyphosphere-discovery.md';
    anchor.click();
    URL.revokeObjectURL(url);
    pushToast('Markdown export downloaded');
  }, [pushToast]);

  const runAgentAction = useCallback((action: string, input: Record<string, unknown> = {}) => {
    if (action === 'follow_relationship') {
      followNode(typeof input.nodeId === 'string' ? input.nodeId : 'service');
      return { ok: true, action, result: 'relationship followed', revealed: ['invite', 'harbor'] };
    }
    if (action === 'get_evidence') {
      openEvidence(typeof input.nodeId === 'string' ? input.nodeId : stateRef.current.selectedId);
      return { ok: true, action, result: 'evidence drawer opened' };
    }
    if (action === 'set_evidence_threshold') {
      const verifiedOnly = input.verifiedOnly !== false;
      if (stateRef.current.evidenceOnly !== verifiedOnly) toggleVerified();
      return { ok: true, action, verifiedOnly };
    }
    if (action === 'save_discovery') {
      saveDiscovery();
      return { ok: true, action, result: 'discovery saved' };
    }
    if (action === 'show_terrain') {
      setView('terrain');
      setAgentMessage('Terrain view opened: source ecology is now in focus.');
      return { ok: true, action, view: 'terrain' };
    }
    return { ok: false, error: 'Unknown action' };
  }, [followNode, openEvidence, saveDiscovery, toggleVerified]);

  useEffect(() => {
    const documentWithModelContext = document as Document & {
      modelContext?: {
        registerTool: (
          definition: { name: string; description: string; inputSchema: Record<string, unknown> },
          handler: (input: Record<string, unknown>) => unknown,
        ) => void;
      };
    };
    const modelContext = documentWithModelContext.modelContext;
    if (!modelContext?.registerTool) return;

    modelContext.registerTool({ name: 'follow_relationship', description: 'Follow a relationship in the active Hyphosphere investigation and reveal the next research objects.', inputSchema: { type: 'object', properties: { nodeId: { type: 'string', description: 'The node to follow.' } } } }, (input) => runAgentAction('follow_relationship', input));
    modelContext.registerTool({ name: 'get_evidence', description: 'Open the evidence drawer for a research object or relationship.', inputSchema: { type: 'object', properties: { nodeId: { type: 'string', description: 'The node to inspect.' } } } }, (input) => runAgentAction('get_evidence', input));
    modelContext.registerTool({ name: 'set_evidence_threshold', description: 'Change the evidence threshold for the shared investigation state.', inputSchema: { type: 'object', properties: { verifiedOnly: { type: 'boolean', description: 'Only show verified relationships.' } } } }, (input) => runAgentAction('set_evidence_threshold', input));
    modelContext.registerTool({ name: 'show_terrain', description: 'Switch the shared investigation to the source Terrain view.', inputSchema: { type: 'object', properties: {} } }, () => runAgentAction('show_terrain'));
    modelContext.registerTool({ name: 'save_discovery', description: 'Save the active finding with its trail and evidence distinctions.', inputSchema: { type: 'object', properties: {} } }, () => runAgentAction('save_discovery'));
  }, [runAgentAction]);

  const changeView = (nextView: View) => {
    setView(nextView);
    setEvidenceOpen(false);
    setMobileNavOpen(false);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup"><AppMark /><div><div className="brand-name">hyphosphere</div></div></div>
        <div className="topbar-center"><div className="command-search"><Search size={16} /><input ref={searchInputRef} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the terrain" aria-label="Search the terrain" /><span className="keycap">⌘ K</span></div></div>
        <div className="topbar-actions"><span className={`connection-dot ${webmcpReady ? 'is-ready' : ''}`} title={webmcpReady ? 'WebMCP ready' : 'WebMCP awaiting compatible browser'} /><span className="topbar-status">{webmcpReady ? 'agent link ready' : 'local corpus'}</span><div className="controls-wrap"><button className="avatar-button" onClick={() => setControlsOpen((open) => !open)} aria-expanded={controlsOpen} aria-label="Open Hyphosphere controls"><Compass size={15} /></button>{controlsOpen && <div className="controls-popover" aria-live="polite"><span>HYPHOSPHERE CONTROLS</span><strong>{webmcpReady ? 'WebMCP connection ready' : 'Deterministic corpus active'}</strong><button onClick={() => { setControlsOpen(false); announce('Controls closed. Your investigation remains in focus.'); }}>Close</button></div>}</div></div>
        <button className="mobile-menu" onClick={() => setMobileNavOpen((open) => !open)} aria-label="Toggle navigation"><PanelRight size={18} /></button>
      </header>

      <div className="workspace-grid">
        <aside className={`sidebar ${mobileNavOpen ? 'is-open' : ''}`}>
          <div className="sidebar-scroll">
            <div className="sidebar-heading">SURFACES</div>
            <nav className="view-nav" aria-label="Research surfaces">
              <button className={view === 'thread' ? 'is-active' : ''} onClick={() => changeView('thread')}><Waypoints size={16} /> <span>Thread</span><small>01</small></button>
              <button className={view === 'map' ? 'is-active' : ''} onClick={() => changeView('map')}><Map size={16} /> <span>Map</span><small>02</small></button>
              <button className={view === 'terrain' ? 'is-active' : ''} onClick={() => changeView('terrain')}><Compass size={16} /> <span>Terrain</span><small>03</small></button>
              <button className={view === 'evidence' ? 'is-active' : ''} onClick={() => changeView('evidence')}><ShieldCheck size={16} /> <span>Evidence</span><small>04</small></button>
              <button className={view === 'compare' ? 'is-active' : ''} onClick={() => changeView('compare')}><GitBranch size={16} /> <span>Compare</span><small>05</small></button>
            </nav>
            <div className="sidebar-divider" /><div className="sidebar-heading">INVESTIGATIONS</div>
            <div className="investigation-list"><button className="investigation-item is-current" onClick={() => changeView('thread')} aria-label="Open investigation: A service beneath"><span className="mini-spark" /><span><strong>A service beneath</strong><small>active · 7 objects</small></span></button><button className="investigation-item" onClick={() => announce('Unfinished threads are not loaded in this deterministic demo corpus.')} aria-label="Open unfinished threads"><span className="mini-ring" /><span><strong>Unfinished threads</strong><small>2 saved paths</small></span></button></div>
            <div className="sidebar-divider" /><div className="sidebar-heading">NOTEBOOK</div>
            <button className="notebook-link" onClick={() => announce(saved ? 'Saved discovery is available in the notebook card.' : 'No saved discoveries yet. Save the current finding to begin.') }><Bookmark size={15} /> <span>Saved discoveries</span><small>{saved ? '01' : '00'}</small></button><button className="notebook-link" onClick={() => announce('The source shelf is represented by the six source classes in Terrain.') }><Archive size={15} /> <span>Source shelf</span><small>12</small></button>
          </div>
          <div className="sidebar-footer"><div className="demo-label"><span className="demo-dot" /> DEMO CORPUS</div><p>Deterministic material for a guided investigation.</p><div className="agent-brief"><span>HUMAN + AGENT</span><p>You choose what to follow. An agent can operate the same terrain controls and surface evidence; you decide what counts.</p></div></div>
        </aside>

        <section className="main-stage">
          <div className="stage-heading"><div><div className="eyebrow"><span>INVESTIGATION 01</span><span className="eyebrow-line" /><span>GUIDED DEMO</span></div><h1>Follow one clue across many sources.</h1><p>Hyphosphere helps you test whether the same ordinary service appears in different cases. Here, Atlas Relay is compared across Northline cohort, Lantern House, Greybox traces, and archived reporting.</p></div><div className="stage-heading-actions"><button className={`quiet-button ${evidenceOnly ? 'is-selected' : ''}`} onClick={toggleVerified}><Filter size={15} /> {evidenceOnly ? 'Verified only' : 'Full terrain'}</button><button className="primary-button" onClick={saveDiscovery}><Bookmark size={15} /> {saved ? 'Saved' : 'Save discovery'}</button></div></div>
          <div className="orientation-panel"><div className="orientation-copy"><span className="eyebrow-label">WHAT ARE WE CHARTING?</span><strong>{followed ? 'The shared layer is now visible.' : 'A stack of ordinary layers around a case.'}</strong><p>{followed ? 'Atlas Relay has revealed two more objects. Check what supports each connection before you save the finding.' : '“Stack” means the services, platforms, datasets, reports, and infrastructure around a case. The point is to see whether one layer recurs across otherwise different cases.'}</p><span className="orientation-agent-note">HUMAN + AGENT · one shared investigation state</span></div><div className="orientation-steps"><div><b>01</b><span>Choose a clue<small>Atlas Relay is selected</small></span></div><div><b>02</b><span>Follow it<small>Reveal related objects</small></span></div><div><b>03</b><span>Check evidence<small>Keep uncertainty visible</small></span></div><div><b>04</b><span>Save a finding<small>Export the trail</small></span></div></div><button className="orientation-cta" onClick={() => { setView('thread'); followNode('service'); }}>{followed ? 'Continue the path' : 'Start guided investigation'} <ChevronRight size={15} /></button></div>
          <div className="view-switcher" role="tablist" aria-label="Investigation views">{(['thread', 'map', 'terrain', 'evidence', 'compare'] as View[]).map((tab) => <button key={tab} className={view === tab ? 'is-active' : ''} onClick={() => changeView(tab)} role="tab" aria-selected={view === tab}>{tab}</button>)}<span className="view-switcher-hint"><Sparkles size={13} /> one investigation, many ways to see it</span></div>
          <div className="stage-content">
            {view === 'terrain' ? <TerrainView onFollow={() => followNode('service')} onInspect={inspectTerrain} followed={followed} /> : view === 'evidence' ? <EvidenceView selected={selected} edges={edges} onOpen={openEvidence} evidenceOnly={evidenceOnly} /> : view === 'compare' ? <CompareView onFollow={() => followNode('service')} onSelectCase={(id) => { setSelectedId(id); announce(`${nodeById(id).label} selected for comparison.`); }} /> : view === 'thread' ? <ThreadView selectedId={selectedId} followed={followed} evidenceOnly={evidenceOnly} onSelect={setSelectedId} onFollow={followNode} onOpenEvidence={openEvidence} onToggleVerified={toggleVerified} /> : <MapView nodes={filteredNodes} edges={filteredEdges} selectedId={selectedId} visibleNodeIds={visibleNodeIds} followed={followed} evidenceOnly={evidenceOnly} onSelect={setSelectedId} onFollow={followNode} onOpenEvidence={openEvidence} onToggleVerified={toggleVerified} />}
            <aside className="trail-panel"><div className="panel-overline"><span>INVESTIGATION TRAIL</span><span className="trail-count">{trail.length.toString().padStart(2, '0')}</span></div><div className="trail-line" /><div className="trail-items">{trail.map((item, index) => <div key={`${item.label}-${index}`} className={`trail-item ${item.active ? 'is-active' : ''}`}><span className="trail-node" /><div><strong>{item.label}</strong><small>{item.detail}</small></div><time>{item.time}</time></div>)}</div><div className="trail-next"><div className="next-kicker"><ArrowUpRight size={13} /> POSSIBLE NEXT DIRECTION</div><p>{followed ? 'Where else does this service appear?' : 'Follow the selected relationship to reveal what is next.'}</p><button onClick={() => followNode(selectedId)}>{followed ? 'Trace backwards' : 'Follow this'} <ChevronRight size={15} /></button></div><div className="agent-note"><div className="agent-note-heading"><span className="agent-pulse" /> AGENT EXTENSION</div><p>{agentMessage || 'An agent can extend the path through structured tools while you keep the evidentiary judgement.'}</p></div></aside>
          </div>
        </section>
      </div>

      {evidenceOpen && <dialog open className="evidence-drawer" aria-label="Evidence inspection"><div className="drawer-head"><div><span className="eyebrow-label">WHY IS THIS CONNECTED?</span><h2>{selected.label}</h2></div><button className="icon-button" onClick={() => setEvidenceOpen(false)} aria-label="Close evidence drawer"><X size={17} /></button></div><div className="drawer-object"><div className={`object-icon object-${selected.accent}`}><NodeIcon kind={selected.kind} /></div><div><span>{selected.kind}</span><strong>{selected.source}</strong></div><EvidencePill state={selected.evidence} /></div><div className="drawer-section"><span className="drawer-label">BASIS</span><p>{selected.preview} {selected.evidence === 'disputed' ? 'This connection needs inspection before it can carry the investigation forward.' : 'The trail keeps this distinction visible as it expands.'}</p></div><div className="drawer-section"><span className="drawer-label">SUPPORTING MATERIAL</span><div className="source-stack"><div><FileText size={15} /><span>Research object preview<strong>{selected.source}</strong></span><span className="source-state">local corpus</span></div><div><Clock3 size={15} /><span>Capture context<strong>{selected.subtext}</strong></span><span className="source-state">retained</span></div></div></div><div className="drawer-section"><span className="drawer-label">PROVENANCE NOTE</span><div className="provenance-note"><CircleHelp size={15} /><p>Evidence class is preserved from the demo corpus. Inference is not promoted to verification by following the path.</p></div></div><div className="drawer-footer"><button className="quiet-button" onClick={() => followNode(selected.id)}><Link2 size={15} /> Follow this</button><button className="primary-button" onClick={saveDiscovery}><Bookmark size={15} /> Save discovery</button></div></dialog>}
      {toast && <output className="toast"><Check size={15} /> {toast}</output>}
      {saved && <div className="saved-card"><div className="saved-card-top"><span><Bookmark size={14} /> SAVED DISCOVERY</span><button onClick={() => setSaved(false)} aria-label="Dismiss saved discovery"><X size={14} /></button></div><strong>The service beneath the surface</strong><p>7 objects · 4 evidence states · trail preserved</p><button onClick={exportDiscovery}><Download size={14} /> Export Markdown</button></div>}
    </main>
  );
}

function ThreadView({ selectedId, followed, evidenceOnly, onSelect, onFollow, onOpenEvidence, onToggleVerified }: { selectedId: string; followed: boolean; evidenceOnly: boolean; onSelect: (id: string) => void; onFollow: (id: string) => void; onOpenEvidence: (id: string) => void; onToggleVerified: () => void }) {
  const ids = followed ? threadSequence : threadSequence.slice(0, 3);
  const shown = ids.map((id) => nodeById(id)).filter((node) => !evidenceOnly || node.evidence === 'verified');

  return <div className="thread-view"><div className="surface-header"><div><span className="eyebrow-label">THREAD VIEW</span><h2>Read the investigation in order.</h2><p>This is the path of the current hypothesis, from case to service to supporting material. It is deliberately linear so the user can tell what was found, what was followed, and what remains uncertain.</p></div><div className="surface-header-meta"><strong>{shown.length.toString().padStart(2, '0')}</strong><span>steps in view</span></div></div><div className="thread-toolbar"><span><span className="live-dot" /> RESEARCH THREAD</span><span>{evidenceOnly ? 'verified steps only' : 'full evidence trail'}</span><button onClick={onToggleVerified} aria-pressed={evidenceOnly}><Eye size={14} /> {evidenceOnly ? 'Show all' : 'Verified only'}</button></div><div className="thread-path">{shown.map((node, index) => { const previous = shown[index - 1]; const relation = previous ? edges.find((edge) => (edge.from === previous.id && edge.to === node.id) || (edge.to === previous.id && edge.from === node.id)) : undefined; const isSelected = selectedId === node.id; return <div className="thread-step-wrap" key={node.id}>{index > 0 && <div className="thread-connection"><span>{relation?.label ?? 'continues to'}</span><i className={`connection-line connection-${relation?.evidence ?? 'supported'}`} /></div>}<article className={`thread-step ${isSelected ? 'is-selected' : ''}`}><div className="thread-step-index">{(index + 1).toString().padStart(2, '0')}</div><button className="thread-step-card" onClick={() => onSelect(node.id)} aria-label={`Select ${node.label} in the investigation thread`}><div className="thread-step-top"><span>{node.kind}</span><EvidencePill state={node.evidence} /></div><strong>{node.label}</strong><span>{node.source} · {node.meta}</span><p>{node.preview}</p></button><button className="thread-inspect" onClick={() => onOpenEvidence(node.id)}>Inspect evidence <ChevronRight size={14} /></button></article></div>; })}</div><div className="thread-footer"><div><span className="eyebrow-label">WHAT THIS VIEW IS FOR</span><p>Use Thread to follow sequence and provenance. Switch to Map when you want to see all relationships and possible branches at once.</p></div><button className="follow-button" onClick={() => onFollow(selectedId)}><span className="follow-glyph"><ArrowUpRight size={16} /></span>{followed ? 'Follow deeper' : 'Follow this'}<ChevronRight size={16} /></button></div></div>;
}

function MapView({ nodes: visibleNodes, edges: visibleEdges, selectedId, visibleNodeIds, followed, evidenceOnly, onSelect, onFollow, onOpenEvidence, onToggleVerified }: { nodes: ResearchNode[]; edges: ResearchEdge[]; selectedId: string; visibleNodeIds: Set<string>; followed: boolean; evidenceOnly: boolean; onSelect: (id: string) => void; onFollow: (id: string) => void; onOpenEvidence: (id: string) => void; onToggleVerified: () => void }) {
  return <div className="map-view"><div className="surface-header"><div><span className="eyebrow-label">MAP VIEW</span><h2>See the relationships at once.</h2><p>This is the spatial view: cases, services, datasets, archives, and infrastructure share one field so you can spot recurrences and branches before deciding what they mean.</p></div><div className="surface-header-meta"><strong>{visibleNodes.length.toString().padStart(2, '0')}</strong><span>objects visible</span></div></div><div className="research-canvas map-mode"><div className="canvas-toolbar"><span><span className="live-dot" /> ACTIVE TERRAIN</span><span className="toolbar-divider" /><span>{visibleNodes.length} objects / {visibleEdges.length} relationships</span><span className="canvas-toolbar-spacer" /><button onClick={onToggleVerified} aria-pressed={evidenceOnly}><Eye size={14} /> {evidenceOnly ? 'verified layer' : 'all layers'}</button></div><div className="terrain-grid" /><div className="terrain-label terrain-label-a">FIELDWORK / 04</div><div className="terrain-label terrain-label-b">COMMERCIAL LAYER</div><div className="terrain-label terrain-label-c">ARCHIVE EDGE</div><svg className="map-edges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{visibleEdges.map((edge) => { const from = nodeById(edge.from); const to = nodeById(edge.to); const dimmed = !visibleNodeIds.has(edge.from) || !visibleNodeIds.has(edge.to); return <g key={edge.id} className={`edge-group edge-${edge.evidence} ${dimmed ? 'is-dimmed' : ''} ${edge.from === selectedId || edge.to === selectedId ? 'is-connected' : ''}`}><line x1={from.x} y1={from.y} x2={to.x} y2={to.y} /><text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 1.8}>{edge.label}</text></g>; })}</svg>{visibleNodes.map((node) => { const hidden = !visibleNodeIds.has(node.id); const isSelected = selectedId === node.id; const placement = `${node.x > 60 ? 'card-left' : 'card-right'} ${node.y > 60 ? 'card-up' : 'card-down'}`; return <button key={node.id} className={`research-node node-${node.accent} ${isSelected ? 'is-selected' : ''} ${hidden ? 'is-hidden' : ''}`} style={{ left: `${node.x}%`, top: `${node.y}%` }} onClick={() => onSelect(node.id)} aria-label={`Select ${node.label}`}><span className="node-orbit" /><span className="node-marker"><NodeIcon kind={node.kind} /></span><span className={`node-card ${placement} ${isSelected ? 'is-expanded' : 'is-compact'}`}>{isSelected ? <><span className="node-card-top"><span>{node.kind}</span><EvidencePill state={node.evidence} /></span><strong>{node.label}</strong><small>{node.meta}</small><em>{node.preview}</em></> : <><strong>{node.label}</strong><small>{node.kind}</small></>}</span></button>; })}<div className="canvas-legend"><div><span className="legend-line legend-solid" /> verified</div><div><span className="legend-line legend-light" /> supported</div><div><span className="legend-line legend-dashed" /> inferred</div><div><span className="legend-dot legend-disputed" /> disputed</div></div><div className="canvas-callout"><span className="callout-index">01</span><div><strong>{followed ? 'The pattern extends' : 'Start with the ordinary'}</strong><p>{followed ? 'Atlas Relay appears across multiple source classes.' : 'Select a node, then follow the relationship.'}</p></div><button onClick={() => onOpenEvidence(selectedId)} aria-label="Open evidence"><CircleHelp size={16} /></button></div><div className="canvas-action"><button className="follow-button" onClick={() => onFollow(selectedId)}><span className="follow-glyph"><ArrowUpRight size={16} /></span>{followed ? 'Follow deeper' : 'Follow this'}<ChevronRight size={16} /></button><span>leaves judgement with you</span></div></div></div>;
}

function TerrainView({ onFollow, onInspect, followed }: { onFollow: () => void; onInspect: (label: string) => void; followed: boolean }) {
  return <div className="terrain-view"><div className="terrain-view-intro"><div><span className="eyebrow-label">SOURCE TERRAIN</span><h2>See the ecology behind the pattern.</h2><p>One investigation, six kinds of material. The terrain makes heterogeneity visible before the evidence is interpreted.</p></div><div className="terrain-total"><strong>13</strong><span>research objects</span></div></div><div className="terrain-mosaic">{terrainItems.map((item) => { const Icon = item.icon; return <button type="button" key={item.label} className={`terrain-tile tile-${item.color}`} onClick={() => onInspect(item.label)} aria-label={`Inspect ${item.label} source layer`}><div className="tile-icon"><Icon size={19} /></div><div><span>{item.label}</span><strong>{item.count.toString().padStart(2, '0')}</strong><small>{item.detail}</small></div><ArrowUpRight size={16} /></button>; })}</div><div className="terrain-note"><div className="terrain-note-icon"><Sparkles size={17} /></div><div><span>THE SCENE CHANGED</span><p>{followed ? 'Atlas Relay connects sources that do not usually appear in the same investigation.' : 'Follow Atlas Relay to reveal the platform artefact and disputed infrastructure record.'}</p></div><button onClick={onFollow}>{followed ? 'Trace the path' : 'Follow Atlas Relay'} <ChevronRight size={15} /></button></div></div>;
}

function EvidenceView({ selected, edges: allEdges, onOpen, evidenceOnly }: { selected: ResearchNode; edges: ResearchEdge[]; onOpen: (id: string) => void; evidenceOnly: boolean }) {
  const shown = evidenceOnly ? allEdges.filter((edge) => edge.evidence === 'verified') : allEdges;
  return <div className="evidence-view"><div className="evidence-view-head"><div><span className="eyebrow-label">EVIDENCE LAYER</span><h2>Keep the distinction visible.</h2><p>Every connection has a status, a basis, and a place to inspect.</p></div><div className="evidence-summary"><span>current focus</span><strong>{selected.label}</strong><EvidencePill state={selected.evidence} /></div></div><div className="evidence-table"><div className="evidence-table-head"><span>RELATIONSHIP</span><span>STATUS</span><span>BASIS</span><span>INSPECT</span></div>{shown.map((edge) => { const from = nodeById(edge.from); const to = nodeById(edge.to); return <button key={edge.id} className="evidence-row" onClick={() => onOpen(edge.from === selected.id ? edge.to : edge.from)}><span><strong>{from.label}</strong><small>{edge.label}</small><strong>{to.label}</strong></span><EvidencePill state={edge.evidence} /><span>{edge.rationale}</span><ChevronRight size={16} /></button>; })}</div><div className="evidence-footnote"><CircleHelp size={15} /><span>Verified only removes attractive-looking connections that do not yet have direct support. That disappearance is a discovery too.</span></div></div>;
}

function CompareView({ onFollow, onSelectCase }: { onFollow: () => void; onSelectCase: (id: string) => void }) {
  return <div className="compare-view"><div className="compare-head"><div><span className="eyebrow-label">STRUCTURAL COMPARISON</span><h2>What is shared, and what is not?</h2><p>Comparison keeps similarity from becoming certainty.</p></div><button className="quiet-button" onClick={onFollow}><Link2 size={15} /> Follow shared layer</button></div><div className="compare-grid"><button type="button" className="case-panel case-a" onClick={() => onSelectCase('northline')} aria-label="Select Northline cohort for comparison"><div className="case-panel-top"><span className="case-index">A</span><div><span>CASE 04</span><strong>Northline cohort</strong></div><EvidencePill state="verified" /></div><p>Repeated onboarding pattern across two regional cases.</p><div className="compare-list"><div><Check size={14} /><span>Atlas Relay<strong>service record</strong></span></div><div><Check size={14} /><span>Greybox traces<strong>11 matching rows</strong></span></div><div className="is-muted"><X size={14} /><span>Invite fragment<strong>not observed directly</strong></span></div></div></button><div className="compare-middle"><span>SHARED</span><div className="shared-pill"><Globe2 size={15} /> Atlas Relay</div><div className="compare-connector" /><span>STRUCTURE</span></div><button type="button" className="case-panel case-b" onClick={() => onSelectCase('lantern')} aria-label="Select Lantern House for comparison"><div className="case-panel-top"><span className="case-index">B</span><div><span>CASE 11</span><strong>Lantern House</strong></div><EvidencePill state="supported" /></div><p>Similar activity with a different public story.</p><div className="compare-list"><div><Check size={14} /><span>Atlas Relay<strong>visual match</strong></span></div><div><Check size={14} /><span>Invite fragment<strong>earlier occurrence</strong></span></div><div className="is-muted"><X size={14} /><span>Greybox traces<strong>not yet linked</strong></span></div></div></button></div><div className="compare-warning"><CircleHelp size={15} /><span>The shared service is supported across cases. The underlying relationship remains an investigative proposition, not a conclusion.</span></div></div>;
}
