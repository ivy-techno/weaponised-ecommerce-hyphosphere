'use client';

/* oxlint-disable jsx-a11y/prefer-tag-over-role, next/no-html-link-for-pages, react/no-unescaped-entities -- Semantic grouping and native homepage anchors are intentional in this Vinext single-page interface. */

import {
  Archive,
  ArrowDown,
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
  ExternalLink,
  FileText,
  Filter,
  GitBranch,
  Globe2,
  Layers2,
  Link2,
  Map,
  Network,
  Pause,
  Play,
  Search,
  Sparkles,
  Target,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { type MouseEvent as ReactMouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

type View = 'concept-demo' | 'investigations' | 'thread' | 'map' | 'terrain' | 'evidence' | 'compare' | 'concepts' | 'artifacts' | 'outputs';
type EvidenceState = 'verified' | 'supported' | 'inferred' | 'disputed';
type StackLayer = 'Visible story / reporting' | 'Platforms & distribution' | 'Commercial services' | 'Data & brokerage' | 'Interfaces & operations' | 'Infrastructure';
type SearchScope = 'web' | 'curated' | 'both';
type AgentBriefRecord = { id: string; title: string; kind: string; provider: string; description: string; stackLayers: StackLayer[]; signal: string; source?: ResearchSource; node?: ResearchNode };
type AgentBriefRequest = { query: string; scope: SearchScope; stackFilter: StackLayer | 'all'; requestId: number };
type AgentBriefSnapshot = { query: string; scope: SearchScope; stackFilter: StackLayer | 'all'; records: Array<{ id: string; title: string; kind: string; provider: string; stackLayers: StackLayer[]; signal: string; sourceId?: string; nodeId?: string }>; keptIds: string[] };
type SavedAgentBrief = AgentBriefSnapshot & { id: string; savedAt: string };
type SignalFeedItem = {
  id: string;
  headline: string;
  sourceTitle: string;
  sourceKind: string;
  sourceUrl: string;
  sourceId?: string;
  freshness: string;
  infowarLabel: string;
  stackLayers: StackLayer[];
  relevance: string;
};
type SavedSignalItem = SignalFeedItem & { savedAt: string };

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
  inclusionReason: string;
  subtext: string;
  accent: string;
  stackLayers: StackLayer[];
};

type ResearchSource = {
  id: string;
  title: string;
  provider: string;
  kind: string;
  description: string;
  whyIncluded: string;
  access: string;
  url: string;
  tags: string[];
  example: ResearchExample;
};

type ResearchExample = {
  label: string;
  title: string;
  text: string;
  fields: Array<{ label: string; value: string }>;
  note: string;
  accent: string;
};

const viewSlugs: Record<View, string> = {
  'concept-demo': 'demo',
  investigations: 'investigations',
  thread: 'thread',
  map: 'map',
  terrain: 'terrain',
  evidence: 'evidence',
  compare: 'compare',
  concepts: 'concepts',
  artifacts: 'artifacts',
  outputs: 'outputs',
};

const viewFromLocation = (): View => {
  if (typeof window === 'undefined') return 'concept-demo';
  const area = new URLSearchParams(window.location.search).get('area');
  const match = (Object.entries(viewSlugs) as Array<[View, string]>).find(([, slug]) => slug === area || slug === area?.replace(/^\//, ''));
  return match?.[0] ?? 'concept-demo';
};

const notebookFromLocation = () => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('area') === 'notebook';

const viewHref = (view: View) => view === 'concept-demo' ? '/' : `/?area=${viewSlugs[view]}`;


type ResearchEdge = {
  id: string;
  from: string;
  to: string;
  label: string;
  evidence: EvidenceState;
  rationale: string;
  scale: 'local' | 'regional' | 'transnational' | 'not yet mapped';
  scaleFrame: 'micro' | 'meso' | 'macro' | 'unresolved';
  timeWindow: string;
  temporalSignal: string;
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
    inclusionReason: 'Included as a case anchor: it gives the investigation a concrete repeated pattern to begin from.',
    subtext: 'Case 04 / fieldwork',
    accent: 'teal',
    stackLayers: ['Visible story / reporting'],
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
    inclusionReason: 'Included as a comparison case: its different public story tests whether the pattern recurs.',
    subtext: 'Case 11 / fieldwork',
    accent: 'teal',
    stackLayers: ['Visible story / reporting'],
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
    inclusionReason: 'Included as a service record: it is the ordinary commercial layer that may connect otherwise separate cases.',
    subtext: 'Hosted workflow / commercial',
    accent: 'amber',
    stackLayers: ['Commercial services', 'Interfaces & operations'],
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
    inclusionReason: 'Included as a dataset: repeated rows test whether the service appears beyond a single case.',
    subtext: '38 rows / 2021–2024',
    accent: 'violet',
    stackLayers: ['Data & brokerage'],
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
    inclusionReason: 'Included as reporting: it supplies public sequence and context while remaining indirect evidence.',
    subtext: 'Archived webpage / capture 18',
    accent: 'coral',
    stackLayers: ['Visible story / reporting'],
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
    inclusionReason: 'Included as a platform artefact: the capture may extend the trail to an earlier occurrence.',
    subtext: 'Screenshot / platform artefact',
    accent: 'pink',
    stackLayers: ['Platforms & distribution', 'Interfaces & operations'],
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
    inclusionReason: 'Included as infrastructure: it tests whether the visible pattern reaches a deeper technical layer, while keeping the match disputed.',
    subtext: 'Infrastructure record / disputed',
    accent: 'slate',
    stackLayers: ['Infrastructure'],
  },
];

const externalSources: ResearchSource[] = [
  {
    id: 'ira-troll-archive',
    title: 'Russian Troll Tweets archive',
    provider: 'FiveThirtyEight / Clemson University',
    kind: 'PUBLIC DATASET',
    description: 'Nearly three million tweets from accounts connected to the Internet Research Agency, covering 2012–2018.',
    whyIncluded: 'A public-facing influence-operation layer: it makes visible the scale and persistence of coordinated online activity.',
    access: 'Open repository',
    url: 'https://github.com/fivethirtyeight/russian-troll-tweets',
    tags: ['political trolls', 'influence operations', 'twitter', 'ira', 'social media'],
    example: {
      label: 'ILLUSTRATIVE RECORD',
      title: 'The post is the visible trace',
      text: 'A short political message can look like an isolated utterance. The archive makes it possible to inspect the account, timestamp, language, and surrounding activity that turn that surface into a research object.',
      fields: [{ label: 'surface', value: 'post + reply activity' }, { label: 'inspect', value: 'account · time · language' }, { label: 'question', value: 'what carried it outward?' }],
      note: 'This is an explanatory preview, not a quoted tweet. Open the original repository to inspect the records.',
      accent: 'coral',
    },
  },
  {
    id: 'occrp-aleph',
    title: 'OCCRP Aleph',
    provider: 'Organized Crime and Corruption Reporting Project',
    kind: 'INVESTIGATIVE DATABASE',
    description: 'A platform for searching public records, documents, leaks, and entity data, with relationship and timeline views.',
    whyIncluded: 'A model for the future observatory backend: it can connect companies, people, documents, and investigations across heterogeneous sources.',
    access: 'Public interface; some material requires access',
    url: 'https://aleph.occrp.org/',
    tags: ['occrp', 'aleph', 'companies', 'leaks', 'public records', 'investigative reporting'],
    example: {
      label: 'ILLUSTRATIVE QUERY',
      title: 'A name becomes a trail',
      text: 'A company, person, document, or address can become a starting point. Relationship and timeline views help a researcher move from a single record toward the wider network around it.',
      fields: [{ label: 'start with', value: 'entity or document' }, { label: 'follow', value: 'people · companies · records' }, { label: 'question', value: 'which links recur?' }],
      note: 'This preview explains the research use of Aleph; the external database remains the source of record.',
      accent: 'amber',
    },
  },
  {
    id: 'ocp-data-registry',
    title: 'OCP Data Registry / OCDS',
    provider: 'Open Contracting Partnership',
    kind: 'DATA REGISTRY',
    description: 'Public procurement datasets made available in the Open Contracting Data Standard format.',
    whyIncluded: 'A route into the commercial and infrastructure layer: vendors, contracts, projects, and organisations can become mappable research objects.',
    access: 'Open downloads',
    url: 'https://ocp-data-registry.readthedocs.io/en/latest/',
    tags: ['ocp', 'open contracting', 'procurement', 'vendors', 'contracts', 'infrastructure'],
    example: {
      label: 'ILLUSTRATIVE CONTRACT TRACE',
      title: 'The commercial layer leaves paperwork',
      text: 'A procurement record can look mundane on its own. Linked vendors, buyers, dates, and project descriptions make the commercial infrastructure around an activity available for comparison.',
      fields: [{ label: 'record', value: 'buyer + vendor + award' }, { label: 'connect', value: 'contract · project · date' }, { label: 'question', value: 'what infrastructure repeats?' }],
      note: 'The card is a reading aid, not a claim about a particular contract. Open the registry for original records.',
      accent: 'violet',
    },
  },
  {
    id: 'social-links-crimewall',
    title: 'SL Crimewall',
    provider: 'Social Links',
    kind: 'COMMERCIAL OSINT PLATFORM',
    description: 'A commercial OSINT workspace combining structured source access, link analysis, graph/table/map views, automation, monitoring, and reporting.',
    whyIncluded: 'Makes the commercial investigation-tool layer visible: a useful model of how data access, entity resolution, visualisation, workflow, and reporting can be packaged into one service.',
    access: 'Public product overview; commercial platform',
    url: 'https://sociallinks.io/products/sl-crimewall',
    tags: ['social links', 'crimewall', 'osint', 'link analysis', 'graph analysis', 'data access', 'automation', 'monitoring', 'reporting', 'commercial tooling'],
    example: {
      label: 'ILLUSTRATIVE TOOL VIEW',
      title: 'The investigator’s interface is part of the stack',
      text: 'A platform can collect, connect, visualise, monitor, and report on open-source traces in one workspace. That capability is relevant here as a model of the commercial tooling layer—not as evidence that a particular operation used it.',
      fields: [{ label: 'source access', value: 'open data + entities' }, { label: 'workbench', value: 'graph · table · map' }, { label: 'question', value: 'what does the tool make legible?' }],
      note: 'This preview summarises the product’s public description; it is not a screenshot and does not imply the platform was used in any case.',
      accent: 'teal',
    },
  },
  {
    id: 'meta-cib-pakistan',
    title: 'Pakistan-based CIB network indicators',
    provider: 'Meta Threat Research',
    kind: 'PLATFORM INDICATORS',
    description: 'Public indicators for a coordinated inauthentic behaviour network involving accounts, Pages, Instagram assets, and paid ads.',
    whyIncluded: 'Connects campaign reporting to concrete platform artefacts and commercial distribution signals such as advertising spend.',
    access: 'Open indicators',
    url: 'https://github.com/facebook/threat-research/blob/main/indicators/meta-h1-2026-pakistan-based-cib-network.md',
    tags: ['meta', 'cib', 'influence operations', 'facebook', 'instagram', 'advertising'],
    example: {
      label: 'ILLUSTRATIVE AD TRAIL',
      title: 'The advert is only the surface',
      text: 'A paid post may look like an ordinary advert. Accounts, Pages, Instagram assets, and distribution signals can show how a public message sits inside a larger coordination pattern.',
      fields: [{ label: 'surface', value: 'post + paid placement' }, { label: 'inspect', value: 'account · Page · audience' }, { label: 'question', value: 'which service enabled reach?' }],
      note: 'This is a stylised example, not a reproduced Meta asset. Open the original report for documented indicators.',
      accent: 'pink',
    },
  },
  {
    id: 'graphika-cheap-tricks',
    title: 'Cheap Tricks',
    provider: 'Graphika Research',
    kind: 'RESEARCH REPORT',
    description: 'A report on AI-enabled influence operations, including cross-platform cases, attribution indicators, and network analysis.',
    whyIncluded: 'Adds the reporting and analytical layer needed to interpret platform traces without treating a visual match as proof.',
    access: 'Public summary; full material may be gated',
    url: 'https://www.graphika.com/reports/cheap-tricks',
    tags: ['graphika', 'reporting', 'ai', 'influence operations', 'network analysis', 'attribution'],
    example: {
      label: 'ILLUSTRATIVE REPORT VIEW',
      title: 'Reporting connects the fragments',
      text: 'A research report can bring platform traces, timing, attribution indicators, and cross-platform movement into one interpretable account without making every connection equally certain.',
      fields: [{ label: 'combine', value: 'traces + timing + context' }, { label: 'compare', value: 'platforms · accounts · narratives' }, { label: 'question', value: 'what is established?' }],
      note: 'The preview describes the report’s analytical role; use the original publication for its findings and caveats.',
      accent: 'teal',
    },
  },
  {
    id: 'amazon-copurchase-network',
    title: 'Amazon co-purchasing network',
    provider: 'Stanford SNAP',
    kind: 'COMMERCE NETWORK DATASET',
    description: 'A product network built from Amazon’s “customers who bought this item also bought” relationships.',
    whyIncluded: 'A commerce-stack baseline: it helps distinguish ordinary commercial network structure from a claim about information operations.',
    access: 'Open dataset',
    url: 'https://newsnap.stanford.edu/data/com-Amazon.html',
    tags: ['amazon', 'ecommerce', 'commerce stack', 'product network', 'stanford'],
    example: {
      label: 'ILLUSTRATIVE COMMERCE GRAPH',
      title: 'Recommendation is a network too',
      text: '“Customers who bought this item also bought” turns an ordinary shopping interface into a visible network of products and behaviour—the kind of stack that can surround a much smaller information-operation trace.',
      fields: [{ label: 'surface', value: 'product recommendation' }, { label: 'connect', value: 'item → related item' }, { label: 'question', value: 'what does the stack make visible?' }],
      note: 'The example paraphrases the dataset’s relationship type; open Stanford SNAP for the original data and methodology.',
      accent: 'amber',
    },
  },
  {
    id: 'ecommerce-dark-patterns',
    title: 'Dark patterns in e-commerce',
    provider: 'Yuki Yada and collaborators',
    kind: 'RELATED DATASET',
    description: 'A text-based dataset for identifying interface patterns that steer people toward actions they did not intend.',
    whyIncluded: 'A useful adjacent layer for examining how commercial interfaces shape attention, choice, and behaviour.',
    access: 'Open repository',
    url: 'https://github.com/yamanalab/ec-darkpattern',
    tags: ['ecommerce', 'dark patterns', 'interfaces', 'persuasion', 'user behaviour'],
    example: {
      label: 'ILLUSTRATIVE INTERFACE TRACE',
      title: 'A choice can be designed before it is made',
      text: 'A brightly framed button, a preselected option, or a hurried checkout can steer behaviour without looking like an information operation. This adjacent dataset helps keep the commercial interface layer in view.',
      fields: [{ label: 'surface', value: 'button · prompt · checkout' }, { label: 'inspect', value: 'choice architecture' }, { label: 'question', value: 'who benefits from the design?' }],
      note: 'This is an explanatory mock-up, not a captured interface. Open the repository for the dataset and coding approach.',
      accent: 'coral',
    },
  },
  {
    id: 'disinfodex',
    title: 'Disinfodex',
    provider: 'Historical platform takedown index',
    kind: 'HISTORICAL INDEX',
    description: 'A historical index of platform disclosures and takedowns across services including Facebook, Twitter, Google/YouTube, and Reddit.',
    whyIncluded: 'Keeps the visible moderation and takedown layer in view while inviting the researcher to ask what wider infrastructure made each operation possible.',
    access: 'Historical snapshots via Internet Archive; current domain is not treated as authoritative',
    url: 'https://web.archive.org/web/*/https://disinfodex.org/',
    tags: ['disinfodex', 'takedowns', 'platforms', 'moderation', 'cib', 'influence operations', 'historical archive'],
    example: {
      label: 'ILLUSTRATIVE TAKEDOWN RECORD',
      title: 'The removal is the visible event',
      text: 'A platform disclosure can name accounts, narratives, dates, and policy actions. That public event is an important surface trace; the observatory question is what services and supply chains surrounded it.',
      fields: [{ label: 'surface', value: 'accounts + takedown' }, { label: 'inspect', value: 'actor · narrative · date' }, { label: 'question', value: 'what remains unseen?' }],
      note: 'This is an explanatory preview, not a reproduced takedown record. The link opens historical snapshots rather than treating the current domain as a live database.',
      accent: 'coral',
    },
  },
  {
    id: 'tactical-tech-influence-industry',
    title: 'The Influence Industry',
    provider: 'Tactical Tech · Our Data Our Selves',
    kind: 'RESEARCH PROJECT',
    description: 'A research project mapping the global business of using personal data and digital influence in elections through practices, actors, and country contexts.',
    whyIncluded: 'Provides a bridge between visible political messaging and the commercial ecosystem of data brokers, consultants, platforms, targeting, and persuasion.',
    access: 'Open project overview and related reporting',
    url: 'https://ourdataourselves.tacticaltech.org/posts/influence-industry/',
    tags: ['tactical tech', 'influence industry', 'data brokers', 'political advertising', 'elections', 'platforms', 'cambridge analytica'],
    example: {
      label: 'ILLUSTRATIVE INDUSTRY MAP',
      title: 'The campaign has a supply chain',
      text: 'A political message sits inside an ecosystem of data, analysis, targeting, persuasion, consultants, start-ups, and platforms. The point is not to collapse them into one actor, but to make the enabling field inspectable.',
      fields: [{ label: 'practice', value: 'profile → target → persuade' }, { label: 'actors', value: 'brokers · consultants · platforms' }, { label: 'question', value: 'where does value move?' }],
      note: 'This is a visual reading aid based on the project’s organising questions, not a quotation from the source.',
      accent: 'violet',
    },
  },
  {
    id: 'fbi-labor-trafficking-scam-alert',
    title: 'False job ads & scam-compound labour',
    provider: 'FBI Internet Crime Complaint Center',
    kind: 'OFFICIAL ALERT',
    description: 'An official alert on false online job advertisements linked to labour trafficking at Southeast Asia-based scam compounds, where victims may be coerced into online fraud.',
    whyIncluded: 'Adds a human-labour perspective to the enabling stack: recruitment, coercion, digital work, commercial fraud, and operational infrastructure can meet in one reported pathway.',
    access: 'Open official alert',
    url: 'https://www.ic3.gov/PSA/2023/psa230522',
    tags: ['human trafficking', 'forced labour', 'digital labour', 'false job ads', 'scam compounds', 'recruitment', 'online fraud'],
    example: {
      label: 'OFFICIAL ALERT',
      title: 'A job offer becomes an operational doorway',
      text: 'False online job advertisements can recruit people into scam compounds where they are coerced into performing digital fraud.',
      fields: [{ label: 'entry point', value: 'false job advertisement' }, { label: 'labour condition', value: 'coercion / forced criminality' }, { label: 'visible output', value: 'online investment fraud' }],
      note: 'This example shows a reported recruitment pathway; it does not map the people or services in this demo to a trafficking operation.',
      accent: 'coral',
    },
  },
];

const sourceStackLayers = (source: ResearchSource): StackLayer[] => {
  if (source.id === 'ira-troll-archive') return ['Visible story / reporting', 'Platforms & distribution', 'Data & brokerage'];
  if (source.id === 'occrp-aleph') return ['Data & brokerage', 'Interfaces & operations'];
  if (source.id === 'ocp-data-registry') return ['Commercial services', 'Data & brokerage'];
  if (source.id === 'social-links-crimewall') return ['Commercial services', 'Data & brokerage', 'Interfaces & operations'];
  if (source.id === 'meta-cib-pakistan') return ['Platforms & distribution', 'Interfaces & operations'];
  if (source.id === 'graphika-cheap-tricks') return ['Visible story / reporting'];
  if (source.id === 'amazon-copurchase-network') return ['Platforms & distribution', 'Data & brokerage'];
  if (source.id === 'ecommerce-dark-patterns') return ['Commercial services', 'Interfaces & operations'];
  if (source.id === 'disinfodex') return ['Visible story / reporting', 'Platforms & distribution'];
  if (source.id === 'fbi-labor-trafficking-scam-alert') return ['Visible story / reporting', 'Platforms & distribution', 'Interfaces & operations'];
  return ['Commercial services', 'Data & brokerage', 'Interfaces & operations'];
};

const researchQueryTerms = (query: string) => {
  const stopWords = new Set(['about', 'after', 'again', 'also', 'and', 'are', 'for', 'from', 'how', 'into', 'latest', 'more', 'new', 'show', 'that', 'the', 'this', 'what', 'where', 'which', 'with']);
  return query.toLowerCase().split(/[^a-z0-9]+/).filter((term) => term.length > 2 && !stopWords.has(term));
};

const matchesResearchQuery = (text: string, query: string) => {
  const terms = researchQueryTerms(query);
  if (!terms.length) return true;
  const haystack = text.toLowerCase();
  return terms.some((term) => haystack.includes(term));
};

const signalFeedItems: SignalFeedItem[] = [
  {
    id: 'signal-meta-cib',
    headline: 'Platform indicators make a Pakistan-based CIB network inspectable.',
    sourceTitle: 'Pakistan-based CIB network indicators',
    sourceKind: 'PLATFORM INDICATORS',
    sourceUrl: externalSources.find((source) => source.id === 'meta-cib-pakistan')?.url ?? '',
    sourceId: 'meta-cib-pakistan',
    freshness: 'source lead · disclosure record',
    infowarLabel: 'CIB / influence operations',
    stackLayers: ['Platforms & distribution', 'Interfaces & operations'],
    relevance: 'public disclosure → platform artefacts → paid distribution',
  },
  {
    id: 'signal-tactical-tech',
    headline: 'The Influence Industry maps the commercial business of digital persuasion.',
    sourceTitle: 'The Influence Industry',
    sourceKind: 'RESEARCH PROJECT',
    sourceUrl: externalSources.find((source) => source.id === 'tactical-tech-influence-industry')?.url ?? '',
    sourceId: 'tactical-tech-influence-industry',
    freshness: 'source lead · project overview',
    infowarLabel: 'political influence',
    stackLayers: ['Commercial services', 'Data & brokerage', 'Platforms & distribution'],
    relevance: 'data → targeting → platforms → persuasion',
  },
  {
    id: 'signal-occrp',
    headline: 'OCCRP Aleph turns public records into linked entity trails.',
    sourceTitle: 'OCCRP Aleph',
    sourceKind: 'INVESTIGATIVE DATABASE',
    sourceUrl: externalSources.find((source) => source.id === 'occrp-aleph')?.url ?? '',
    sourceId: 'occrp-aleph',
    freshness: 'source lead · searchable collection',
    infowarLabel: 'investigative method',
    stackLayers: ['Data & brokerage', 'Interfaces & operations'],
    relevance: 'entities → documents → relationships',
  },
  {
    id: 'signal-fbi-labour',
    headline: 'False online job ads can lead into scam-compound digital labour.',
    sourceTitle: 'False job ads & scam-compound labour',
    sourceKind: 'OFFICIAL ALERT',
    sourceUrl: externalSources.find((source) => source.id === 'fbi-labor-trafficking-scam-alert')?.url ?? '',
    sourceId: 'fbi-labor-trafficking-scam-alert',
    freshness: 'source lead · official alert',
    infowarLabel: 'digital labour / coercion',
    stackLayers: ['Visible story / reporting', 'Platforms & distribution', 'Interfaces & operations'],
    relevance: 'recruitment → coerced labour → online fraud',
  },
  {
    id: 'signal-graphika',
    headline: 'Cheap Tricks follows AI-enabled influence operations across platforms.',
    sourceTitle: 'Cheap Tricks',
    sourceKind: 'RESEARCH REPORT',
    sourceUrl: externalSources.find((source) => source.id === 'graphika-cheap-tricks')?.url ?? '',
    sourceId: 'graphika-cheap-tricks',
    freshness: 'source lead · research report',
    infowarLabel: 'AI-enabled influence',
    stackLayers: ['Visible story / reporting'],
    relevance: 'cases → timing → attribution signals',
  },
  {
    id: 'signal-amazon',
    headline: 'Amazon co-purchasing data reveals an ordinary recommendation network.',
    sourceTitle: 'Amazon co-purchasing network',
    sourceKind: 'COMMERCE NETWORK DATASET',
    sourceUrl: externalSources.find((source) => source.id === 'amazon-copurchase-network')?.url ?? '',
    sourceId: 'amazon-copurchase-network',
    freshness: 'source lead · commerce baseline',
    infowarLabel: 'commercial baseline',
    stackLayers: ['Platforms & distribution', 'Data & brokerage'],
    relevance: 'recommendation → products → behavioural graph',
  },
];

const sourceManifest = () => externalSources.map((source) => ({ id: source.id, title: source.title, provider: source.provider, kind: source.kind, access: source.access, resourceUrl: source.url, stackLayers: sourceStackLayers(source), tags: source.tags, linkedOnly: true }));

function SourceCitationCard({ source, compact = false }: { source: ResearchSource; compact?: boolean }) {
  return <div className={`source-citation-card ${compact ? 'source-citation-card-compact' : ''}`}><span className="source-citation-mark"><FileText size={compact ? 15 : 18} /></span><span className="source-citation-copy"><span>DIRECT SOURCE CITATION</span><strong>{source.title}</strong><small>{source.provider} · {source.kind}</small></span><span className="source-citation-arrow"><ExternalLink size={compact ? 13 : 15} /></span></div>;
}

type CollectionProfile = {
  scope: string;
  dateRange: string;
  recordShape: string;
  limitations: string;
  researchQuestion: string;
};

const collectionProfiles: Record<string, CollectionProfile> = {
  'ira-troll-archive': {
    scope: 'Publicly released tweets and account metadata associated with Internet Research Agency-linked accounts.',
    dateRange: '2012–2018',
    recordShape: 'Posts, account identifiers, timestamps, language, and engagement traces.',
    limitations: 'Archive provenance and platform context vary by record; it shows the public trace, not the full enabling supply chain.',
    researchQuestion: 'What services, audiences, and distribution pathways sit behind a visible post?',
  },
  'occrp-aleph': {
    scope: 'Public records, documents, leaks, entities, and relationships gathered for investigative research.',
    dateRange: 'Varies by record and collection',
    recordShape: 'Entities, documents, company records, people, places, dates, and linked relationships.',
    limitations: 'Coverage, access, and document provenance differ across collections; a link is a lead for inspection, not a finding.',
    researchQuestion: 'Which commercial entities, documents, and relationships recur around a case?',
  },
  'ocp-data-registry': {
    scope: 'Public procurement datasets published in or mapped to the Open Contracting Data Standard.',
    dateRange: 'Varies by publisher and jurisdiction',
    recordShape: 'Buyers, vendors, awards, contracts, projects, values, and dates.',
    limitations: 'Fields and completeness depend on the publishing authority; procurement presence alone does not indicate misuse.',
    researchQuestion: 'What ordinary vendors, contracts, or infrastructure layers become visible when records are linked?',
  },
  'social-links-crimewall': {
    scope: 'A commercial OSINT investigation workspace combining structured source access, link analysis, visualisation, automation, monitoring, and report export.',
    dateRange: 'Current product overview; features may change',
    recordShape: 'Search results, entity links, graph/table/map views, monitoring outputs, and exports.',
    limitations: 'Vendor-described capabilities; access, coverage, pricing, and reproducibility require independent checking. Product marketing is not evidence of a particular operation.',
    researchQuestion: 'What does a commercial investigation platform make visible, and what does its interface or data access leave opaque?',
  },
  'meta-cib-pakistan': {
    scope: 'Platform indicators describing accounts, Pages, Instagram assets, and paid-ad signals in a disclosed network.',
    dateRange: 'Report-specific disclosure period',
    recordShape: 'Asset identifiers, platform types, network descriptions, and policy or ad-distribution signals.',
    limitations: 'The platform’s disclosure is a bounded account of one network; indicators do not reveal every service or actor around it.',
    researchQuestion: 'How does a documented platform network connect to commercial distribution and operational services?',
  },
  'graphika-cheap-tricks': {
    scope: 'Research reporting on AI-enabled influence operations, cross-platform movement, and attribution indicators.',
    dateRange: 'Report publication-specific',
    recordShape: 'Cases, narratives, timelines, indicators, platform traces, and analytical interpretation.',
    limitations: 'Reporting selects and interprets available traces; claims should be read with the report’s methods and caveats.',
    researchQuestion: 'What becomes legible when fragments are assembled across platforms and time?',
  },
  'amazon-copurchase-network': {
    scope: 'Product-to-product relationships derived from Amazon’s “customers who bought this item also bought” interface.',
    dateRange: 'Dataset snapshot-specific',
    recordShape: 'Products and co-purchase edges forming a commerce network.',
    limitations: 'This is a commerce baseline, not an influence-operation dataset; relationships describe recommendation structure, not intent.',
    researchQuestion: 'What does an ordinary recommendation network teach us about the scale and visibility of commercial infrastructure?',
  },
  'ecommerce-dark-patterns': {
    scope: 'Coded examples of interface patterns that can steer users toward actions they did not intend.',
    dateRange: 'Dataset release-specific',
    recordShape: 'Interface text, pattern categories, prompts, buttons, and choice-architecture annotations.',
    limitations: 'Coding categories and examples are bounded by the dataset’s method; adjacency to an IO is a research question, not a conclusion.',
    researchQuestion: 'At which interface thresholds can ordinary commercial design shape attention, choice, or behaviour?',
  },
  disinfodex: {
    scope: 'Historical platform disclosures and takedown records gathered across several online services.',
    dateRange: 'Historical snapshots; capture period varies',
    recordShape: 'Accounts, narratives, dates, platform actions, and disclosure references.',
    limitations: 'The current link points to archived snapshots; historical platform disclosures are partial views of each operation.',
    researchQuestion: 'What remains unseen around the public moment of disclosure or removal?',
  },
  'tactical-tech-influence-industry': {
    scope: 'Research mapping the business of personal data, political influence, targeting, and persuasion.',
    dateRange: 'Project and country context-specific',
    recordShape: 'Practices, actors, companies, services, country contexts, and explanatory case material.',
    limitations: 'It is an organising research project rather than a live exhaustive registry; categories and examples need contextual reading.',
    researchQuestion: 'Where does value move between data, analysis, targeting, platforms, and persuasion?',
  },
  'fbi-labor-trafficking-scam-alert': {
    scope: 'An official public alert describing false online job advertisements linked to labour trafficking at scam compounds in Southeast Asia.',
    dateRange: 'Alert published 2023; reported patterns may span earlier periods',
    recordShape: 'Recruitment pathway, labour conditions, scam-compound operations, and online fraud indicators.',
    limitations: 'The alert addresses specific reported trafficking patterns; it does not establish that any ordinary platform or service is implicated in every case.',
    researchQuestion: 'Where do recruitment, coercion, digital work, and operational infrastructure intersect—and what remains invisible to public reporting?',
  },
};

const collectionProfile = (source: ResearchSource): CollectionProfile => collectionProfiles[source.id] ?? {
  scope: source.description,
  dateRange: 'Not specified',
  recordShape: source.kind,
  limitations: 'Inspect the original source for scope, provenance, and methods.',
  researchQuestion: source.whyIncluded,
};

const possibleOutput = {
  clusterTitle: 'Northline cohort → Atlas Relay → Greybox traces → The Long Arc',
  clusterSummary: 'Suggestive of a recurring enabling layer crossing case material, a commercial service record, a dataset, and public reporting.',
  caseStudyTitle: 'Atlas Relay: a service beneath two public stories',
  caseStudyBody: 'The cluster begins with two cases whose public stories differ. Atlas Relay is the ordinary service layer worth testing between them; Greybox traces provide a structured recurrence, while The Long Arc adds public sequence. Read alongside broader reporting on cross-platform influence operations and the commercial influence industry, the cluster becomes a research lead about the enabling field—not a claim that those sources document Atlas Relay itself.',
  relatedReporting: ['graphika-cheap-tricks', 'tactical-tech-influence-industry'],
  reviewNote: 'Possible output only: a researcher must inspect the linked material, check geography and time, and decide which relationships survive review.',
};

const possibleOutputTypes = [
  { code: '01', label: 'CITED MINI-REPORT', title: 'A short research note', detail: 'Turn a suggested cluster into a readable note for future research writing, with the trail and original sources linked for inspection.', use: 'best for thesis drafting', accent: 'teal' },
  { code: '02', label: 'ACTOR / ASSEMBLAGE TIMELINE', title: 'A sequence across time', detail: 'Chart when an actor, service, or wider assemblage appears, changes scale, or gathers new relationships.', use: 'best for change over time', accent: 'amber' },
  { code: '03', label: 'THRESHOLD ANALYSIS', title: 'A possible line crossed', detail: 'Locate where ordinary commercial infrastructure may have been appropriated for hostile use, while preserving the evidence needed to test that interpretation.', use: 'best for contested transitions', accent: 'coral' },
  { code: '04', label: 'NETWORK VISUALISATION', title: 'A map of the connections', detail: 'Render actors, services, platforms, datasets, and reporting as an inspectable network whose links can be followed and challenged.', use: 'best for structural discovery', accent: 'violet' },
] as const;

type PossibleOutputCode = (typeof possibleOutputTypes)[number]['code'];
type PossibleOutputExample = {
  visual: 'report' | 'timeline' | 'threshold' | 'network';
  eyebrow: string;
  title: string;
  summary: string;
  accent: string;
  sourceIds: string[];
  caveat: string;
  rows?: Array<{ label: string; value: string }>;
  timeline?: Array<{ phase: string; label: string; detail: string; tag: string }>;
  threshold?: Array<{ label: string; detail: string; accent: string }>;
};

const possibleOutputExamples: Record<PossibleOutputCode, PossibleOutputExample> = {
  '01': {
    visual: 'report',
    eyebrow: 'CITED MINI-REPORT',
    title: 'Atlas Relay: a service beneath two public stories',
    summary: 'A short note preserves the hypothesis chain and makes the reason for further investigation legible without treating the cluster as a finding.',
    accent: 'teal',
    rows: [
      { label: 'RESEARCH LEAD', value: 'A recurring service layer may connect otherwise different case material.' },
      { label: 'EVIDENCE CARRIED', value: 'Northline cohort · Atlas Relay · Greybox traces · The Long Arc' },
      { label: 'STATUS', value: 'Suggestive; supported and verified routes remain open to review.' },
    ],
    sourceIds: ['graphika-cheap-tricks', 'tactical-tech-influence-industry'],
    caveat: 'A cited mini-report is a drafting aid. A researcher still checks what each source actually documents, where, and when.',
  },
  '02': {
    visual: 'timeline',
    eyebrow: 'ACTOR / ASSEMBLAGE TIMELINE',
    title: 'Atlas Relay / assemblage sequence',
    summary: 'A timeline places recurrence and reconfiguration in view so a researcher can ask what changed, rather than relying on a single snapshot.',
    accent: 'amber',
    timeline: [
      { phase: '01', label: 'CASE ENTRY', detail: 'Northline cohort establishes the visible starting pattern.', tag: 'surface' },
      { phase: '02', label: 'SERVICE REPEAT', detail: 'Atlas Relay appears as the ordinary layer worth testing between cases.', tag: 'commercial service' },
      { phase: '03', label: 'DATA RECURRENCE', detail: 'Greybox traces add structured repetition across records.', tag: 'dataset' },
      { phase: '04', label: 'PUBLIC SEQUENCE', detail: 'The Long Arc adds reporting context without direct technical proof.', tag: 'reporting' },
    ],
    sourceIds: ['occrp-aleph', 'graphika-cheap-tricks'],
    caveat: 'This is an illustrative sequence assembled from the demo corpus; it does not claim a verified chronology for an external actor.',
  },
  '03': {
    visual: 'threshold',
    eyebrow: 'THRESHOLD ANALYSIS',
    title: 'From ordinary service to hostile appropriation?',
    summary: 'A threshold analysis marks the moment that deserves closer review: when ordinary infrastructure may be serving targeting, coordination, or persistence.',
    accent: 'coral',
    threshold: [
      { label: 'ORDINARY USE', detail: 'Commercial service, routine delivery, ordinary workflow.', accent: 'teal' },
      { label: 'THRESHOLD TO TEST', detail: 'Repeated coordination + targeting + persistence across layers.', accent: 'amber' },
      { label: 'HYPOTHESIS', detail: 'Possible hostile appropriation; intent and responsibility remain unresolved.', accent: 'coral' },
    ],
    sourceIds: ['graphika-cheap-tricks', 'tactical-tech-influence-industry'],
    caveat: 'Crossing a threshold is a research question, not an automated verdict. The evidence must support the transition itself.',
  },
  '04': {
    visual: 'network',
    eyebrow: 'NETWORK VISUALISATION',
    title: 'A map of the connections',
    summary: 'A network view can make a small shared service legible inside the larger stack, with every link available for inspection and challenge.',
    accent: 'violet',
    sourceIds: ['ira-troll-archive', 'occrp-aleph', 'graphika-cheap-tricks'],
    caveat: 'The lines show relationships represented in this demo. They do not prove common control, intent, or causation.',
  },
};

const edges: ResearchEdge[] = [
  {
    id: 'northline-service',
    from: 'northline',
    to: 'service',
    label: 'uses',
    evidence: 'supported',
    rationale: 'A service record and a field note share the same account identifier.',
    scale: 'regional',
    scaleFrame: 'meso',
    timeWindow: '2024',
    temporalSignal: 'recurs across two regional cases',
  },
  {
    id: 'lantern-service',
    from: 'lantern',
    to: 'service',
    label: 'resembles',
    evidence: 'inferred',
    rationale: 'The pattern is similar, but the direct service link is not verified.',
    scale: 'regional',
    scaleFrame: 'meso',
    timeWindow: '2023–2024',
    temporalSignal: 'reappears as a comparison echo',
  },
  {
    id: 'service-greybox',
    from: 'service',
    to: 'greybox',
    label: 'appears in',
    evidence: 'verified',
    rationale: 'Atlas Relay appears in 11 rows of the Greybox traces dataset.',
    scale: 'not yet mapped',
    scaleFrame: 'unresolved',
    timeWindow: '2021–2024',
    temporalSignal: 'recurs in dataset rows',
  },
  {
    id: 'greybox-longarc',
    from: 'greybox',
    to: 'longarc',
    label: 'corroborates',
    evidence: 'verified',
    rationale: 'The dataset timeframe overlaps the archived reporting sequence.',
    scale: 'not yet mapped',
    scaleFrame: 'unresolved',
    timeWindow: '2022–2024',
    temporalSignal: 'overlaps in time; no growth inferred',
  },
  {
    id: 'service-invite',
    from: 'service',
    to: 'invite',
    label: 'appears in',
    evidence: 'inferred',
    rationale: 'The interface fragment has a visual signature consistent with the service.',
    scale: 'local',
    scaleFrame: 'micro',
    timeWindow: '2023–2024',
    temporalSignal: 'candidate extension of the trace',
  },
  {
    id: 'invite-lantern',
    from: 'invite',
    to: 'lantern',
    label: 'precedes',
    evidence: 'supported',
    rationale: 'Capture date places the fragment before the Lantern House interview.',
    scale: 'regional',
    scaleFrame: 'meso',
    timeWindow: '2023–2024',
    temporalSignal: 'earlier occurrence extends the sequence',
  },
  {
    id: 'longarc-harbor',
    from: 'longarc',
    to: 'harbor',
    label: 'may share',
    evidence: 'disputed',
    rationale: 'A DNS observation suggests a match, while the archive metadata disagrees.',
    scale: 'not yet mapped',
    scaleFrame: 'unresolved',
    timeWindow: '2022–2024',
    temporalSignal: 'conflict persists across records',
  },
];

const threadSequence = ['northline', 'service', 'greybox', 'invite'] as const;

const stackLineExamples = [
  {
    id: 'traceable-route',
    number: '01',
    label: 'TRACEABLE ROUTE',
    title: 'Northline → Atlas Relay → Greybox → The Long Arc',
    detail: 'A supported and verified route across a case, commercial service, dataset, and public reporting.',
    confidence: 'supported + verified',
    accent: 'teal',
    nodeIds: ['northline', 'service', 'greybox', 'longarc'],
    edgeIds: ['northline-service', 'service-greybox', 'greybox-longarc'],
  },
  {
    id: 'candidate-extension',
    number: '02',
    label: 'CANDIDATE EXTENSION',
    title: 'Lantern House → Invite fragment → Atlas Relay',
    detail: 'A comparison echo worth inspecting, with one inferred link kept visible rather than smoothed over.',
    confidence: 'supported + inferred',
    accent: 'violet',
    nodeIds: ['lantern', 'invite', 'service'],
    edgeIds: ['invite-lantern', 'service-invite'],
  },
];

const conceptRecords = [
  { label: 'Recurrence', detail: 'A layer appears in more than one case.', note: 'Pattern to test, not a conclusion.', accent: 'teal', question: 'Does the same service, identifier, or procedure appear across otherwise different cases?', example: 'Atlas Relay appears in the Northline cohort and in the Lantern House comparison, despite their different public stories.', next: 'Compare cases, datasets, and service records for the same trace.' },
  { label: 'Shared layer', detail: 'An ordinary service or platform sits beneath different public stories.', note: 'The connective proposition in this demo.', accent: 'amber', question: 'What ordinary commercial layer connects stories that look separate at the surface?', example: 'A hosted workflow can be legitimate business infrastructure and still become an important threshold for investigation when it recurs.', next: 'Use the map and Source layers to locate the connective service in the wider stack.' },
  { label: 'Evidence state', detail: 'Verified, supported, inferred, and disputed remain visibly different.', note: 'Uncertainty travels with the relationship.', accent: 'violet', question: 'How strong is this connection, and what kind of material carries it?', example: 'A repeated dataset row may be verified while the leap from that recurrence to coordinated action remains inferred.', next: 'Inspect the evidence drawer and preserve the distinction when saving a finding.' },
  { label: 'Structural comparison', detail: 'Cases can resemble one another without being the same case.', note: 'Similarity is not proof of a shared cause.', accent: 'coral', question: 'What is genuinely shared, and what only looks similar because the public story is incomplete?', example: 'Northline and Lantern House share an apparent service layer, but they do not automatically share an operator, intent, or cause.', next: 'Open Compare to place shared, absent, and unresolved material side by side.' },
  { label: 'Scale + change', detail: 'A relationship has reach and a history.', note: 'Micro/local · meso/regional · macro/transnational.', accent: 'pink', question: 'Is this link local, regional, or transnational—and does it recur, expand, or change form over time?', example: 'A trace may begin as a local interface event, recur across regional cases, and later become transnational as actors, services, or platforms connect. This demo marks unresolved geography rather than guessing.', next: 'Read the scale and temporal signal beside each evidence relationship.' },
];

const stackLayerDetails: Array<{ layer: StackLayer; shortLabel: string; detail: string; significance: string; accent: string }> = [
  { layer: 'Visible story / reporting', shortLabel: 'Visible story', detail: 'Posts, adverts, headlines, takedowns, and public narratives—the small layer most people encounter first.', significance: 'This is where an information operation becomes legible, but it is rarely the whole operation.', accent: 'coral' },
  { layer: 'Platforms & distribution', shortLabel: 'Platforms', detail: 'Social networks, marketplaces, ad delivery, recommendation, and account systems that carry content to people.', significance: 'A platform can be ordinary infrastructure while shaping who sees what, when, and at what scale.', accent: 'pink' },
  { layer: 'Commercial services', shortLabel: 'Commercial services', detail: 'Hosting, SaaS, account services, targeting, payment, and other businesses that support routine or harmful activity.', significance: 'This is the connective layer being tested in the Atlas Relay example.', accent: 'amber' },
  { layer: 'Data & brokerage', shortLabel: 'Data & brokerage', detail: 'Datasets, audience segments, identity signals, procurement records, and material used to find or classify targets.', significance: 'Data can make a pattern visible across cases even when individual stories do not connect.', accent: 'violet' },
  { layer: 'Interfaces & operations', shortLabel: 'Interfaces & operations', detail: 'Dashboards, templates, automation, invitations, campaign tooling, and workflows that turn access into action.', significance: 'This is where coordination can become repeatable without appearing in the final public story.', accent: 'teal' },
  { layer: 'Infrastructure', shortLabel: 'Infrastructure', detail: 'Domains, DNS, CDNs, cloud, and other technical rails that can make an operation persistent or harder to see.', significance: 'Infrastructure offers deeper traces, but a technical match still needs corroboration and careful attribution.', accent: 'slate' },
];

type TerrainLayer = {
  label: string;
  count: number;
  detail: string;
  color: string;
  icon: typeof FileText;
  description: string;
  role: string;
  objectIds: string[];
  sourceIds: string[];
};

const terrainItems: TerrainLayer[] = [
  { label: 'Reporting', count: 3, detail: 'headlines + archive captures', color: 'coral', icon: FileText, description: 'Public accounts and investigative narratives: the visible layer that gives a case its sequence and context.', role: 'Reporting tells us what became legible to the public; it is a starting point, not the enabling stack itself.', objectIds: ['longarc'], sourceIds: ['graphika-cheap-tricks', 'tactical-tech-influence-industry'] },
  { label: 'Archived webpages', count: 2, detail: 'capture dates + origin', color: 'amber', icon: Archive, description: 'Captured pages preserve what a source or interface looked like at a particular moment.', role: 'Archives let a researcher inspect origin, timing, and disappearance rather than relying on memory.', objectIds: ['longarc'], sourceIds: ['disinfodex'] },
  { label: 'Datasets', count: 1, detail: '38 rows · 6 fields', color: 'violet', icon: Database, description: 'Structured rows let recurring entities, dates, and relationships be compared across cases.', role: 'A dataset can surface recurrence that is hard to see in one public story.', objectIds: ['greybox'], sourceIds: ['ira-troll-archive', 'ocp-data-registry', 'amazon-copurchase-network', 'ecommerce-dark-patterns'] },
  { label: 'Platform artefacts', count: 4, detail: 'screenshots + fragments', color: 'pink', icon: Layers2, description: 'Screenshots, fragments, ads, and platform disclosures show what users actually encountered.', role: 'These are the visible traces an operation leaves on a platform, not an explanation of the whole system.', objectIds: ['invite'], sourceIds: ['meta-cib-pakistan', 'disinfodex'] },
  { label: 'Commercial services', count: 3, detail: 'service records + tooling', color: 'teal', icon: Globe2, description: 'Service records point to ordinary commercial layers that can recur beneath very different public stories.', role: 'The shared service is the small connective layer being tested in this proof of concept.', objectIds: ['service'], sourceIds: ['tactical-tech-influence-industry', 'amazon-copurchase-network', 'social-links-crimewall'] },
  { label: 'Infrastructure', count: 1, detail: 'DNS observation', color: 'slate', icon: Network, description: 'DNS and hosting observations reach underneath a visible platform or message.', role: 'Infrastructure is where the investigation can test the deeper ecommerce stack without treating a match as proof.', objectIds: ['harbor'], sourceIds: [] },
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

function RelationshipContext({ edge }: { edge: ResearchEdge }) {
  const scaleLabel = edge.scale === 'not yet mapped' ? 'scale not yet mapped' : `${edge.scaleFrame} / ${edge.scale}`;
  return <span className={`relationship-context relationship-context-${edge.scaleFrame}`}><b>{scaleLabel}</b><small>{edge.timeWindow} · {edge.temporalSignal}</small></span>;
}

function NodeIcon({ kind }: { kind: string }) {
  if (kind === 'DATASET') return <Database size={15} strokeWidth={1.8} />;
  if (kind === 'REPORTING') return <FileText size={15} strokeWidth={1.8} />;
  if (kind === 'COMMERCIAL SERVICE') return <Globe2 size={15} strokeWidth={1.8} />;
  if (kind === 'INFRASTRUCTURE') return <Network size={15} strokeWidth={1.8} />;
  if (kind === 'PLATFORM ARTEFACT') return <Layers2 size={15} strokeWidth={1.8} />;
  return <Target size={15} strokeWidth={1.8} />;
}

function StackLayerPills({ layers }: { layers: StackLayer[] }) {
  const total = stackLayerDetails.length;
  const numberedLayers = layers.map((layer) => ({ layer, number: stackLayerDetails.findIndex((item) => item.layer === layer) + 1 }));
  return <span className="stack-layer-pills" aria-label={`Ecommerce stack position: ${numberedLayers.map(({ layer, number }) => `level ${number} of ${total}, ${layer}`).join('; ')}`}>{numberedLayers.map(({ layer, number }) => <span className="stack-layer-pill" key={layer}><b>{number.toString().padStart(2, '0')} / {total.toString().padStart(2, '0')}</b><span>{layer}</span></span>)}</span>;
}

function makeAgentBriefSnapshot(query: string, scope: SearchScope, stackFilter: StackLayer | 'all', records: AgentBriefRecord[], keptIds: string[]): AgentBriefSnapshot {
  return {
    query,
    scope,
    stackFilter,
    records: records.map((record) => ({
      id: record.id,
      title: record.title,
      kind: record.kind,
      provider: record.provider,
      stackLayers: record.stackLayers,
      signal: record.signal,
      ...(record.source ? { sourceId: record.source.id } : {}),
      ...(record.node ? { nodeId: record.node.id } : {}),
    })),
    keptIds,
  };
}

function AgentBriefNotebookDialog({ briefs, signalItems, discoverySaved, onClose, onCompare }: { briefs: SavedAgentBrief[]; signalItems: SavedSignalItem[]; discoverySaved: boolean; onClose: () => void; onCompare: (id: string) => void }) {
  return <dialog open className="agent-brief-notebook-dialog" aria-label="Saved research notebook"><div className="agent-brief-notebook-card"><div className="notebook-dialog-head"><div><span className="eyebrow-label">NOTEBOOK · SAVED RESEARCH</span><h2>Your investigation notebook</h2><p>Review retained discoveries, agent scans, and current-signal leads in one place.</p></div><button className="icon-button" onClick={onClose} aria-label="Close research notebook"><X size={17} /></button></div>{discoverySaved && <section className="agent-brief-notebook-signals"><div className="agent-brief-notebook-signals-head"><span className="eyebrow-label">SAVED FINDING</span><small>local demo corpus</small></div><div className="agent-brief-notebook-signal-list"><article><div><strong>The service beneath the surface</strong><small>Northline cohort → Atlas Relay → Greybox traces → Invite fragment</small><StackLayerPills layers={['Commercial services', 'Data & brokerage', 'Interfaces & operations']} /></div></article></div></section>}{briefs.length > 0 && <div className="agent-brief-notebook-list">{briefs.map((brief) => <article className="agent-brief-notebook-entry" key={brief.id}><div className="agent-brief-notebook-entry-copy"><span>{brief.scope === 'web' ? 'WEB INDEX' : brief.scope === 'curated' ? 'CURATED RECORDS' : 'LOCAL + LINKED'} · {brief.stackFilter === 'all' ? 'ALL SIX LEVELS' : `LEVEL ${(stackLayerDetails.findIndex((item) => item.layer === brief.stackFilter) + 1).toString().padStart(2, '0')}`}</span><strong>{brief.query}</strong><small>{brief.keptIds.length} retained · {brief.records.length} candidates · {new Date(brief.savedAt).toLocaleDateString()}</small></div><button className="quiet-button" onClick={() => onCompare(brief.id)}>Compare with active assets <GitBranch size={13} /></button></article>)}</div>}{signalItems.length > 0 && <section className="agent-brief-notebook-signals"><div className="agent-brief-notebook-signals-head"><span className="eyebrow-label">SAVED SIGNAL LEADS</span><small>{signalItems.length} retained</small></div><div className="agent-brief-notebook-signal-list">{signalItems.map((item) => <article key={item.id}><div><strong>{item.headline}</strong><small>{item.sourceTitle} · {item.infowarLabel}</small><StackLayerPills layers={item.stackLayers} /></div><a href={item.sourceUrl} target="_blank" rel="noreferrer">Open source <ExternalLink size={12} /></a></article>)}</div></section>}<div className="agent-brief-notebook-note"><CircleHelp size={15} /><p>Notebook entries are device-local in this proof of concept. A shared observatory would eventually add durable storage, provenance, and collaborative review.</p></div><div className="notebook-dialog-actions"><button className="quiet-button" onClick={onClose}>Close notebook</button></div></div></dialog>;
}

function AgentBriefCompareDialog({ brief, onClose }: { brief: SavedAgentBrief; onClose: () => void }) {
  const retained = brief.records.filter((record) => brief.keptIds.includes(record.id));
  const retainedLayers = Array.from(new Set(retained.flatMap((record) => record.stackLayers)));
  const matchingAssets = nodes.filter((node) => node.stackLayers.some((layer) => retainedLayers.includes(layer))).slice(0, 6);
  const assetList = matchingAssets.length ? matchingAssets : nodes.slice(0, 6);
  return <dialog open className="agent-brief-compare-dialog" aria-label="Compare saved agent brief"><div className="agent-brief-compare-card"><div className="notebook-dialog-head"><div><span className="eyebrow-label">NOTEBOOK · COMPARISON</span><h2>Put the scan beside the terrain.</h2><p>Compare what the agent retained with the current demo assets without merging them into one claim.</p></div><button className="icon-button" onClick={onClose} aria-label="Close comparison"><X size={17} /></button></div><div className="agent-brief-compare-query"><span>RETAINED QUERY</span><strong>{brief.query}</strong><small>{brief.scope === 'web' ? 'Linked web index' : brief.scope === 'curated' ? 'Curated local records' : 'Local + linked cross-check'} · {brief.stackFilter === 'all' ? 'all six stack levels' : brief.stackFilter}</small></div><div className="agent-brief-compare-grid"><section className="agent-brief-compare-column agent-brief-compare-agent"><div className="agent-brief-compare-column-head"><span>01 · AGENT RETAINED</span><small>{retained.length} records</small></div>{retained.length ? retained.map((record) => <article key={record.id}><strong>{record.title}</strong><small>{record.kind} · {record.provider}</small><StackLayerPills layers={record.stackLayers} /><span>signal: {record.signal}</span></article>) : <p>No records retained in this scan.</p>}</section><section className="agent-brief-compare-column agent-brief-compare-assets"><div className="agent-brief-compare-column-head"><span>02 · EXISTING ASSETS</span><small>{assetList.length} shown</small></div>{assetList.map((node) => <article key={node.id}><strong>{node.label}</strong><small>{node.kind} · {node.source}</small><StackLayerPills layers={node.stackLayers} /><span>{node.preview}</span></article>)}</section></div><div className="agent-brief-compare-shared"><div><span>SHARED STACK POSITIONS</span><div>{retainedLayers.length ? retainedLayers.map((layer) => <span key={layer}>{(stackLayerDetails.findIndex((item) => item.layer === layer) + 1).toString().padStart(2, '0')} · {stackLayerDetails.find((item) => item.layer === layer)?.shortLabel}</span>) : <span>No shared layer retained</span>}</div></div><p>Overlap is a prompt for further checking. It does not establish a common actor, intent, or causal link.</p></div><div className="notebook-dialog-actions"><button className="quiet-button" onClick={onClose}>Close comparison</button></div></div></dialog>;
}

function AgentPresentationDialog({ snapshot, onClose }: { snapshot: AgentBriefSnapshot; onClose: () => void }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const retained = snapshot.records.filter((record) => snapshot.keptIds.includes(record.id));
  const retainedLayers = new Set(retained.flatMap((record) => record.stackLayers));
  const linkedRecords = snapshot.records.filter((record) => record.sourceId);
  const slides = ['field', 'stack', 'outputs'] as const;

  useEffect(() => {
    if (!autoPlay) return;
    const timer = window.setInterval(() => setSlideIndex((current) => (current + 1) % slides.length), 5200);
    return () => window.clearInterval(timer);
  }, [autoPlay, slides.length]);

  useEffect(() => {
    if (!musicEnabled || typeof window === 'undefined') return;
    const AudioContextConstructor = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return;
    const audioContext = new AudioContextConstructor();
    const masterGain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    const now = audioContext.currentTime;
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.exponentialRampToValueAtTime(0.017, now + 1.8);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1100, now);
    masterGain.connect(filter);
    filter.connect(audioContext.destination);
    const voices: Array<{ frequency: number; type: OscillatorType; level: number; detune?: number }> = [
      { frequency: 146.83, type: 'sine', level: 0.42 },
      { frequency: 220, type: 'sine', level: 0.3, detune: -4 },
      { frequency: 293.66, type: 'triangle', level: 0.12, detune: 4 },
    ];
    const oscillators = voices.map((voice) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = voice.type;
      oscillator.frequency.setValueAtTime(voice.frequency, now);
      oscillator.detune.setValueAtTime(voice.detune ?? 0, now);
      gain.gain.setValueAtTime(voice.level, now);
      oscillator.connect(gain);
      gain.connect(masterGain);
      oscillator.start(now);
      return oscillator;
    });
    void audioContext.resume();
    return () => {
      const fadeNow = audioContext.currentTime;
      masterGain.gain.cancelScheduledValues(fadeNow);
      masterGain.gain.setValueAtTime(0.017, fadeNow);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, fadeNow + 0.9);
      oscillators.forEach((oscillator) => oscillator.stop(fadeNow + 0.95));
      window.setTimeout(() => void audioContext.close(), 1000);
    };
  }, [musicEnabled]);

  const slide = slides[slideIndex];
  const moveSlide = (direction: number) => setSlideIndex((current) => (current + direction + slides.length) % slides.length);
  return <dialog open className="agent-presentation-dialog" aria-label="Show the full research brief presentation"><div className="agent-presentation-card"><div className="agent-presentation-head"><div><span className="eyebrow-label">POSSIBLE OUTPUT · FULL FIELD PRESENTATION</span><h2>Show me the lot together.</h2><p>A compact animated compilation of the retained scan, its stack positions, and the research directions it opens.</p></div><button className="icon-button" onClick={onClose} aria-label="Close full field presentation"><X size={17} /></button></div><div className="agent-presentation-progress" aria-label={`Presentation slide ${slideIndex + 1} of ${slides.length}`}>{slides.map((name, index) => <button type="button" className={slideIndex === index ? 'is-active' : ''} key={name} onClick={() => setSlideIndex(index)} aria-label={`Show presentation slide ${index + 1}`}>{(index + 1).toString().padStart(2, '0')} <span>{name === 'field' ? 'field scan' : name === 'stack' ? 'stack view' : 'possible outputs'}</span></button>)}</div><div className={`agent-presentation-slide agent-presentation-slide-${slide}`} key={`${snapshot.query}-${slideIndex}`}>{slide === 'field' && <><div className="agent-presentation-slide-kicker"><span>01 · RETAINED FIELD SCAN</span><small>{snapshot.scope === 'both' ? 'local + linked' : snapshot.scope === 'web' ? 'linked web index' : 'curated records'} · {retained.length} retained</small></div><h3>{snapshot.query}</h3><div className="agent-presentation-montage">{snapshot.records.map((record, index) => <article className={`agent-presentation-record ${snapshot.keptIds.includes(record.id) ? 'is-retained' : ''}`} key={record.id}><span><b>{(index + 1).toString().padStart(2, '0')}</b><small>{record.kind}</small></span><strong>{record.title}</strong><StackLayerPills layers={record.stackLayers} /><p>{record.sourceId ? externalSources.find((source) => source.id === record.sourceId)?.description : record.nodeId ? nodeById(record.nodeId).preview : 'Candidate record retained for researcher review.'}</p></article>)}</div><div className="agent-presentation-caption"><Sparkles size={14} /><span>Selected records stay visibly marked. The montage is a lead surface: recurrence invites inspection, not attribution.</span></div></>}{slide === 'stack' && <><div className="agent-presentation-slide-kicker"><span>02 · THE ENABLING ASSEMBLAGE</span><small>{retainedLayers.size} of 6 levels represented by retained records</small></div><h3>Where does the scan land in the stack?</h3><div className="agent-presentation-stack-board">{stackLayerDetails.map((item, index) => { const hits = retained.filter((record) => record.stackLayers.includes(item.layer)); return <div className={`agent-presentation-stack-level stack-learning-${item.accent} ${hits.length ? 'is-hit' : ''}`} key={item.layer}><span><b>{(index + 1).toString().padStart(2, '0')}</b><small>{hits.length ? `${hits.length} retained` : 'not represented'}</small></span><strong>{item.shortLabel}</strong><p>{item.detail}</p>{hits.length > 0 && <div>{hits.map((record) => <span key={record.id}>{record.title}</span>)}</div>}</div>; })}</div><div className="agent-presentation-caption"><Network size={14} /><span>The stack view keeps ordinary business infrastructure in frame while asking where a visible operation touches it.</span></div></>}{slide === 'outputs' && <><div className="agent-presentation-slide-kicker"><span>03 · WHAT THIS CAN BECOME</span><small>next research moves, with provenance retained</small></div><h3>From a retained cluster to a research note.</h3><div className="agent-presentation-output-grid">{['Mini report', 'Timeline', 'Threshold note', 'Network map'].map((option, index) => <article key={option}><span>{(index + 1).toString().padStart(2, '0')}</span><strong>{option}</strong><p>{option === 'Mini report' ? 'A concise note with citations and uncertainty.' : option === 'Timeline' ? 'A sequence showing an actor or assemblage forming.' : option === 'Threshold note' ? 'A record of where ordinary use may become hostile appropriation.' : 'A visual account of links across stack levels.'}</p></article>)}</div><div className="agent-presentation-sources"><div><span>LINKED COLLECTIONS IN THIS SCAN</span><small>{linkedRecords.length} original source links remain available.</small></div><div>{linkedRecords.map((record) => <a href={externalSources.find((source) => source.id === record.sourceId)?.url} target="_blank" rel="noreferrer" key={record.id}>{record.title}<ExternalLink size={12} /></a>)}</div></div><div className="agent-presentation-caption"><CircleHelp size={14} /><span>These are possible outputs for researcher review. A presentation can make the relationship legible; it cannot make the relationship proven.</span></div></>}</div><div className="agent-presentation-controls"><button type="button" className="quiet-button" onClick={() => moveSlide(-1)} aria-label="Previous presentation slide"><ChevronRight size={15} className="agent-presentation-prev" /> Previous</button><span>{(slideIndex + 1).toString().padStart(2, '0')} / {slides.length.toString().padStart(2, '0')}</span><button type="button" className="quiet-button" onClick={() => moveSlide(1)}>Next <ChevronRight size={15} /></button><button type="button" className="presentation-control-button" onClick={() => setAutoPlay((playing) => !playing)}>{autoPlay ? <Pause size={13} /> : <Play size={13} />} {autoPlay ? 'Pause slides' : 'Play slides'}</button><button type="button" className={`presentation-control-button ${musicEnabled ? 'is-on' : ''}`} onClick={() => setMusicEnabled((enabled) => !enabled)}>{musicEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />} {musicEnabled ? 'Soundtrack on' : 'Soundtrack off'}</button></div></div></dialog>;
}

function PossibleOutputPanel({ onOpenArtifacts }: { onOpenArtifacts: () => void }) {
  const reporting = possibleOutput.relatedReporting.map((id) => externalSources.find((source) => source.id === id)).filter((source): source is ResearchSource => Boolean(source));
  return <section className="possible-output-panel" aria-label="Possible WebMCP research output"><div className="possible-output-head"><div><span className="eyebrow-label">WEBMCP OUTPUTS · DRAFT FOR RESEARCHER REVIEW</span><h3>What might the instrument produce?</h3><p>A candidate cluster can be summarised without collapsing it into a conclusion, then expanded into a short case study with linked reporting for context.</p></div><span className="possible-output-status">POSSIBLE OUTPUT</span></div><div className="possible-output-grid"><article className="possible-output-card possible-output-cluster"><span className="possible-output-label">01 · SUGGESTED CLUSTER</span><strong>{possibleOutput.clusterTitle}</strong><p>{possibleOutput.clusterSummary}</p><div className="possible-output-meta"><span>LEAD STATUS</span><b>suggestive · supported + verified</b></div></article><article className="possible-output-card possible-output-case"><span className="possible-output-label">02 · MICRO CASE STUDY DRAFT</span><strong>{possibleOutput.caseStudyTitle}</strong><p>{possibleOutput.caseStudyBody}</p><div className="possible-output-links"><span>RELATED REPORTING FOR CONTEXT</span>{reporting.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer">{source.title} · {source.provider} <ExternalLink size={12} /></a>)}</div></article></div><div className="possible-output-footer"><p><CircleHelp size={14} /> {possibleOutput.reviewNote}</p><button className="quiet-button" onClick={onOpenArtifacts}><Archive size={14} /> Inspect research artifacts <ChevronRight size={13} /></button></div></section>;
}

function PossibleOutputCatalogue({ onOpenExample }: { onOpenExample: (code: PossibleOutputCode) => void }) {
  return <section className="possible-output-catalog" aria-labelledby="possible-output-catalog-title"><div className="possible-output-catalog-head"><div><span className="eyebrow-label">OUTPUT FORMS</span><h3 id="possible-output-catalog-title">What else might the observatory return?</h3><p>These are reusable research notes, not automated verdicts. Select a form to see a concrete example with its sources, limits, and next research move.</p></div><span className="possible-output-catalog-count">04 forms</span></div><div className="possible-output-type-grid">{possibleOutputTypes.map((item) => <button type="button" className={`possible-output-type-card possible-output-type-card-${item.accent}`} key={item.code} onClick={() => onOpenExample(item.code)} aria-label={`Open example of ${item.label.toLowerCase()}`}><div className="possible-output-type-top"><span className={`possible-output-type-icon possible-output-type-${item.accent}`}>{item.code}</span><span className="possible-output-type-label">{item.label}</span></div><h4>{item.title}</h4><p>{item.detail}</p><small>{item.use}</small><span className="possible-output-type-action">Open example <ChevronRight size={13} /></span></button>)}</div></section>;
}

function PossibleOutputsView({ onOpenArtifacts, onOpenConcepts, onOpenExample }: { onOpenArtifacts: () => void; onOpenConcepts: () => void; onOpenExample: (code: PossibleOutputCode) => void }) {
  return <div className="possible-outputs-view"><div className="surface-header"><div><span className="eyebrow-label">POSSIBLE OUTPUTS</span><h2>From a cluster to a research lead.</h2><p>This linked page shows one possible WebMCP output: a suggested cluster becomes a cautious micro case study, with related reporting linked for context. It is a drafting surface, not a findings register.</p></div><div className="surface-header-meta"><strong>01</strong><span>draft output</span></div></div><PossibleOutputPanel onOpenArtifacts={onOpenArtifacts} /><PossibleOutputCatalogue onOpenExample={onOpenExample} /><section className="possible-output-method"><div><span className="eyebrow-label">HOW THE OUTPUT IS MADE</span><h3>Discovery first, interpretation second.</h3></div><div className="possible-output-method-grid"><div><b>01</b><strong>Suggest a cluster</strong><p>Group recurring objects and relationships that warrant attention.</p></div><div><b>02</b><strong>Link context</strong><p>Link reporting or datasets that help explain why the cluster matters.</p></div><div><b>03</b><strong>Review the draft</strong><p>Check provenance, geography, time, and uncertainty before treating it as research.</p></div></div><div className="possible-output-method-actions"><button className="quiet-button" onClick={onOpenConcepts}><Sparkles size={14} /> Return to concepts</button><button className="primary-button" onClick={onOpenArtifacts}><Archive size={14} /> Inspect source artifacts</button></div></section></div>;
}

function PossibleOutputExampleDialog({ example, onClose, onOpenArtifacts }: { example: PossibleOutputExample; onClose: () => void; onOpenArtifacts: () => void }) {
  const sourceLinks = example.sourceIds.map((id) => externalSources.find((source) => source.id === id)).filter((source): source is ResearchSource => Boolean(source));
  return <dialog open className="possible-output-dialog" aria-label={`Example output: ${example.title}`}><div className="possible-output-dialog-card"><div className="possible-output-dialog-head"><div><span className={`eyebrow-label possible-output-dialog-eyebrow possible-output-dialog-${example.accent}`}>EXAMPLE OUTPUT · {example.eyebrow}</span><h2 id="possible-output-dialog-title">{example.title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close possible output example"><X size={17} /></button></div><p className="possible-output-dialog-intro">{example.summary}</p>{example.visual === 'report' && <div className="possible-output-report"><div className="possible-output-report-label"><FileText size={15} /><span>DRAFT RESEARCH NOTE · CITATIONS LINKED</span></div>{example.rows?.map((row) => <div className="possible-output-report-row" key={row.label}><span>{row.label}</span><strong>{row.value}</strong></div>)}<p className="possible-output-report-body">The draft keeps the visible story, the enabling service, the structured recurrence, and the reporting context in one inspectable note. Its purpose is to give a researcher something precise to verify, extend, or reject.</p></div>}{example.visual === 'timeline' && <div className="possible-output-timeline" aria-label="Illustrative actor and assemblage timeline">{example.timeline?.map((item) => <div className="possible-output-timeline-row" key={item.phase}><span className="possible-output-timeline-phase">{item.phase}</span><div><span className="possible-output-timeline-label">{item.label}</span><strong>{item.detail}</strong></div><small>{item.tag}</small></div>)}</div>}{example.visual === 'threshold' && <div className="possible-output-threshold" aria-label="Illustrative threshold analysis">{example.threshold?.map((item, index) => <div className={`possible-output-threshold-step possible-output-threshold-${item.accent}`} key={item.label}><span>{(index + 1).toString().padStart(2, '0')}</span><div><small>{item.label}</small><strong>{item.detail}</strong></div>{index < (example.threshold?.length ?? 0) - 1 && <ChevronRight size={15} />}</div>)}</div>}{example.visual === 'network' && <div className="possible-output-network-wrap"><div className="possible-output-network-heading"><span>ILLUSTRATIVE CONNECTIONS</span><small>follow a line back to its record</small></div><svg className="possible-output-network" viewBox="0 0 560 218" aria-label="Illustrative network linking a public story, service, dataset, reporting, platform and infrastructure"><path className="output-network-edge output-network-edge-strong" d="M90 78 L210 52 M90 78 L210 162 M210 52 L350 80 M210 162 L350 80 M350 80 L470 48 M350 80 L470 166" /><circle className="output-network-node output-network-node-coral" cx="90" cy="78" r="22" /><circle className="output-network-node output-network-node-amber" cx="210" cy="52" r="22" /><circle className="output-network-node output-network-node-violet" cx="210" cy="162" r="22" /><circle className="output-network-node output-network-node-teal" cx="350" cy="80" r="22" /><circle className="output-network-node output-network-node-pink" cx="470" cy="48" r="22" /><circle className="output-network-node output-network-node-slate" cx="470" cy="166" r="22" /><text x="90" y="115">VISIBLE STORY</text><text x="210" y="24">SERVICE</text><text x="210" y="201">DATASET</text><text x="350" y="117">SHARED LAYER</text><text x="470" y="20">REPORTING</text><text x="470" y="205">INFRASTRUCTURE</text></svg><div className="possible-output-network-note"><span>What this demonstrates</span><p>A small shared service can sit between what the public sees and several deeper layers. The network makes that proposition inspectable; it does not settle who controlled what.</p></div></div>}<div className="possible-output-dialog-sources"><div><span className="eyebrow-label">LINKED SOURCES</span><p>Open the original collection or report to inspect its scope and provenance.</p></div><div className="possible-output-dialog-source-list">{sourceLinks.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer"><span><strong>{source.title}</strong><small>{source.provider} · {source.kind}</small></span><ExternalLink size={14} /></a>)}</div></div><div className="possible-output-dialog-caveat"><CircleHelp size={15} /><span>{example.caveat}</span></div><div className="possible-output-dialog-actions"><button className="quiet-button" onClick={onClose}>Close example</button><button className="primary-button" onClick={onOpenArtifacts}><Archive size={14} /> Inspect research artifacts <ChevronRight size={14} /></button></div></div></dialog>;
}

function AppMark() {
  return <div className="app-mark" aria-hidden="true"><svg viewBox="0 0 32 32" role="presentation"><circle className="app-mark-orbit" cx="16" cy="16" r="13.5" /><g className="app-mark-network"><path className="app-mark-line app-mark-line-1" d="M16 16 L7 8" /><path className="app-mark-line app-mark-line-2" d="M16 16 L9 25" /><path className="app-mark-line app-mark-line-3" d="M16 16 L25 9" /><path className="app-mark-line app-mark-line-4" d="M16 16 L26 23" /><path className="app-mark-line app-mark-line-5" d="M7 8 L25 9" /><path className="app-mark-line app-mark-line-6" d="M9 25 L26 23" /><circle className="app-mark-node app-mark-node-core" cx="16" cy="16" r="2.5" /><circle className="app-mark-node app-mark-node-1" cx="7" cy="8" r="1.8" /><circle className="app-mark-node app-mark-node-2" cx="9" cy="25" r="1.8" /><circle className="app-mark-node app-mark-node-3" cx="25" cy="9" r="1.8" /><circle className="app-mark-node app-mark-node-4" cx="26" cy="23" r="1.8" /></g></svg></div>;
}

function BranchField() {
  return <svg className="branch-field" viewBox="0 0 260 120" aria-hidden="true"><path className="branch-field-line branch-field-line-1" d="M18 92 C61 90 77 61 114 64 S181 46 240 24" /><path className="branch-field-line branch-field-line-2" d="M62 79 C95 76 105 103 145 96 S207 94 242 109" /><path className="branch-field-line branch-field-line-3" d="M114 64 C122 39 145 26 176 29" /><path className="branch-field-line branch-field-line-4" d="M145 96 C162 77 182 69 211 72" /><circle className="branch-field-node branch-field-node-core" cx="114" cy="64" r="4" /><circle className="branch-field-node branch-field-node-1" cx="18" cy="92" r="2.5" /><circle className="branch-field-node branch-field-node-2" cx="240" cy="24" r="2.5" /><circle className="branch-field-node branch-field-node-3" cx="242" cy="109" r="2.5" /><circle className="branch-field-node branch-field-node-4" cx="176" cy="29" r="2.5" /><circle className="branch-field-node branch-field-node-5" cx="211" cy="72" r="2.5" /></svg>;
}

function PatchworkAreaRibbon({ view, savedCount, notebookOpen, onChangeView, onOpenNotebook }: { view: View; savedCount: number; notebookOpen: boolean; onChangeView: (view: View) => void; onOpenNotebook: () => void }) {
  const panels: Array<{ view?: View; label: string; detail: string; action: string; activeViews?: View[] }> = [
    { view: 'concept-demo', label: 'Curated demo', detail: 'orientation + definitions', action: 'Open the search demo' },
    { view: 'investigations', label: 'Investigation paths', detail: 'one problem · many readings', action: 'Choose a path', activeViews: ['investigations', 'thread', 'map', 'evidence', 'compare'] },
    { view: 'terrain', label: 'Source ecology', detail: 'six enabling levels', action: 'Explore the layers' },
    { view: 'concepts', label: 'Concepts & theories', detail: 'ideas to test', action: 'Open the lenses' },
    { view: 'artifacts', label: 'Research artifacts', detail: 'sources to inspect', action: 'Inspect the records' },
    { view: 'outputs', label: 'Possible outputs', detail: 'notes to make', action: 'See what can emerge' },
    { label: 'Saved notebook', detail: savedCount ? `${savedCount} saved trail${savedCount === 1 ? '' : 's'}` : 'retain a trail', action: 'Open saved work' },
  ];
  return (
    <nav className="patchwork-area-ribbon" aria-label="Hyphosphere research areas">
      <div className="patchwork-area-head"><span><Sparkles size={13} /> RESEARCH AREAS</span><small>stable pages · choose how to continue</small></div>
      <div className="patchwork-area-track" role="tablist" aria-label="Stable research area pages">
        {panels.map((panel, index) => {
          const active = panel.view ? (panel.activeViews ?? [panel.view]).includes(view) : notebookOpen;
          const href = panel.view ? viewHref(panel.view) : '/?area=notebook';
          const handleClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
            if (!panel.view || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            onChangeView(panel.view);
            if (panel.view === 'concept-demo') window.requestAnimationFrame(() => document.querySelector('.agent-brief-surface')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
          };
          return <a href={href} key={panel.label} className={`patchwork-area-panel patchwork-area-panel-${index + 1} ${active ? 'is-active' : ''}`} onClick={panel.view ? handleClick : (event) => { if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); onOpenNotebook(); }} aria-label={`${panel.label}: ${panel.action}`} aria-selected={active} role="tab"><span className="patchwork-area-panel-shade" /><span className="patchwork-area-panel-copy"><b>{index.toString().padStart(2, '0')}</b><strong>{panel.label}</strong><small>{panel.detail}</small><em>{panel.action} <ChevronRight size={12} /></em></span></a>;
        })}
      </div>
    </nav>
  );
}

const AGENT_RESEARCH_INSTRUCTION = 'Act as a careful research assistant. First use the source catalogue and stack filter when they help narrow the question; then search the linked data collections and current reporting for a focused question about information warfare and the ecommerce stack. Return a small candidate set and state the source URL, access or download note, date or recurrence signal, geography, stack position, evidence status, and why each item is relevant. Keep direct observation, support, inference, and dispute separate. Ask the researcher which records to retain, then offer a mini report, timeline, threshold note, or network map. Do not infer coordination, attribution, or responsibility from shared infrastructure. In this proof of concept, treat external links as starting points: they are not downloaded or independently verified records.';

function ConceptFramingCards() {
  const stackLayers = ['platforms & distribution', 'commercial services', 'data & brokerage', 'interfaces & operations', 'domains, cloud & infrastructure'];
  return <section className="concept-framing" aria-label="Concept framing: information warfare and the ecommerce stack"><div className="concept-framing-head"><strong>Two working ideas, one research junction.</strong></div><div className="concept-framing-grid"><article className="concept-framing-card concept-framing-information"><span>01 · WORKING CONCEPT</span><h3>Information warfare</h3><p><strong>In brief:</strong> the deliberate use of information and digital systems to influence belief, attention, or action.</p><small>Start with visible posts, adverts, accounts, headlines, and takedowns — then ask what traces they leave behind.</small></article><article className="concept-framing-card concept-framing-junction"><div className="concept-junction-core"><div className="concept-framing-icon"><Link2 size={15} /></div><div><span className="eyebrow-label">THE RESEARCH JUNCTION</span><h3>Where the two fields meet.</h3></div></div><p>Follow how a visible information operation touches the ordinary commercial systems that help it travel, scale, or persist.</p><small>This is the research focus: a connection to investigate. A starting point, not a conclusion.</small></article><article className="concept-framing-card concept-framing-stack"><span>02 · WORKING CONCEPT</span><h3>The ecommerce stack</h3><p>The layered commercial infrastructure through which digital activity is hosted, distributed, targeted, automated, and measured.</p><div className="concept-framing-layers" aria-label="Broad ecommerce stack categories">{stackLayers.map((layer) => <span key={layer}>{layer}</span>)}</div><small>Use the stack model below to ask where ordinary infrastructure may enable, conceal, or scale activity.</small></article></div></section>;
}

function InvestigationsView({ onOpenThread, onOpenMap }: { onOpenThread: () => void; onOpenMap: () => void }) {
  const [selectedThread, setSelectedThread] = useState<'active' | 'unfinished'>('active');
  const [futurePath, setFuturePath] = useState<'provider' | 'reporting'>('provider');
  return (
    <div className="investigations-view">
      <div className="surface-header"><div><span className="eyebrow-label">INVESTIGATIONS</span><h2>Choose a path to continue.</h2><p>This is the home for current and future investigations. Select a path to see what it is for, then open the surface that can carry the work forward.</p></div><div className="surface-header-meta"><strong>02</strong><span>paths in view</span></div></div>
      <div className="investigation-tabs" role="tablist" aria-label="Available investigations"><button type="button" className={`investigation-tab ${selectedThread === 'active' ? 'is-active' : ''}`} onClick={() => setSelectedThread('active')} role="tab" aria-selected={selectedThread === 'active'}><span className="mini-spark" /><span><strong>A service beneath</strong><small>active · 7 objects · 7 relationships</small></span><ChevronRight size={15} /></button><button type="button" className={`investigation-tab ${selectedThread === 'unfinished' ? 'is-active' : ''}`} onClick={() => setSelectedThread('unfinished')} role="tab" aria-selected={selectedThread === 'unfinished'}><span className="mini-ring" /><span><strong>Unfinished threads</strong><small>preview · 2 future paths</small></span><ChevronRight size={15} /></button></div>
      {selectedThread === 'active' ? (
        <section className="investigation-detail investigation-detail-active">
          <div className="investigation-detail-copy"><span className="eyebrow-label">ACTIVE INVESTIGATION · 01</span><h3>A service beneath</h3><p>Atlas Relay appears across two different cases. Follow the relationship, inspect the supporting material, and keep the distinction between what is observed, supported, inferred, and disputed.</p><div className="investigation-detail-tags"><span>Atlas Relay</span><span>two cases</span><span>evidence trail</span></div><div className="investigation-stack-preview"><div className="investigation-stack-preview-head"><span>ATLAS RELAY STACK LENS</span><small>two routes · six levels available</small></div><div className="investigation-stack-preview-cards">{stackLineExamples.map((line) => <button type="button" className={`investigation-stack-card stack-learning-${line.accent}`} key={line.id} onClick={onOpenMap} aria-label={`Open ${line.label} in the relationship map`}><div className="investigation-stack-card-top"><span>{line.number}</span><small>{line.label}</small><em>{line.confidence}</em></div><strong>{line.title}</strong><p>{line.detail}</p><span className="investigation-stack-card-action">Open in relationship map <ChevronRight size={12} /></span></button>)}</div><p className="investigation-stack-preview-note">These routes make the Atlas Relay proposition inspectable: recurrence can open a lead without becoming a claim about coordination or responsibility.</p></div></div>
          <div className="investigation-detail-actions"><button type="button" className="primary-button" onClick={onOpenThread}>Open followed path <ChevronRight size={14} /></button><button type="button" className="quiet-button" onClick={onOpenMap}>Open relationship map <Map size={14} /></button></div>
        </section>
      ) : (
        <section className="investigation-detail investigation-detail-future"><div className="investigation-detail-copy"><span className="eyebrow-label">UNFINISHED THREADS · FUTURE WORK</span><h3>Questions waiting for more evidence.</h3><p>These are not dormant buttons or findings. They are prompts for the larger observatory: choose one to see the kind of material a future investigation would gather.</p><div className="future-path-tabs" role="tablist" aria-label="Future investigation prompts"><button type="button" className={futurePath === 'provider' ? 'is-active' : ''} onClick={() => setFuturePath('provider')} role="tab" aria-selected={futurePath === 'provider'}><strong>Commercial provider</strong><small>Trace a service across cases, contracts, and infrastructure.</small></button><button type="button" className={futurePath === 'reporting' ? 'is-active' : ''} onClick={() => setFuturePath('reporting')} role="tab" aria-selected={futurePath === 'reporting'}><strong>Reporting recurrence</strong><small>Compare public accounts with platform and dataset traces.</small></button></div><div className="future-path-detail"><span>{futurePath === 'provider' ? 'PROMPT 01' : 'PROMPT 02'}</span><strong>{futurePath === 'provider' ? 'Where does the same commercial provider recur?' : 'What becomes visible when reporting is placed beside the enabling stack?'}</strong><p>{futurePath === 'provider' ? 'Begin with vendor records, service descriptions, domains, and infrastructure observations; then check whether recurrence survives comparison.' : 'Begin with reporting collections, platform indicators, and datasets; then trace which ordinary services and distribution layers sit beneath the visible account.'}</p></div></div><div className="investigation-detail-actions"><button type="button" className="primary-button" onClick={onOpenThread}>Open active path <ChevronRight size={14} /></button><span>Future paths will become live as the observatory corpus grows.</span></div></section>
      )}
      <div className="investigations-note"><CircleHelp size={15} /><p>A path is a research container, not a conclusion. This proof of concept has one active route; the remaining prompts show how a larger observatory could hold questions ready for new sources.</p></div>
    </div>
  );
}

function AgentBriefSurface({ onOpenExample, onOpenCollection, onOpenEvidence, onOpenOutputs, onSaveBrief, onOpenPresentation, agentRequest, onBriefStateChange }: { onOpenExample: (sourceId: string) => void; onOpenCollection: (sourceId: string) => void; onOpenEvidence: (nodeId: string) => void; onOpenOutputs: () => void; onSaveBrief: (snapshot: AgentBriefSnapshot) => void; onOpenPresentation: (snapshot: AgentBriefSnapshot) => void; agentRequest?: AgentBriefRequest | null; onBriefStateChange?: (snapshot: AgentBriefSnapshot) => void }) {
  const [query, setQuery] = useState('');
  const [searchScope, setSearchScope] = useState<SearchScope>('both');
  const [stackFilter, setStackFilter] = useState<StackLayer | 'all'>('all');
  const [brief, setBrief] = useState<AgentBriefRecord[] | null>(null);
  const [kept, setKept] = useState<string[]>([]);
  const [outputChoice, setOutputChoice] = useState('');
  const lastAgentRequestRef = useRef<number | null>(null);
  const searchScopes: Array<{ id: SearchScope; label: string; detail: string }> = [{ id: 'web', label: 'Search web', detail: 'linked web index · live import future' }, { id: 'curated', label: 'Search curated records', detail: 'local demo corpus · reproducible' }, { id: 'both', label: 'Search both', detail: 'cross-check local + linked sources' }];
  const stackFilters: Array<{ id: StackLayer | 'all'; label: string }> = [{ id: 'all', label: 'All levels' }, ...stackLayerDetails.map((item) => ({ id: item.layer, label: item.shortLabel }))];
  const localRecords = useMemo<AgentBriefRecord[]>(() => nodes.map((node) => ({ id: `node:${node.id}`, title: node.label, kind: node.kind, provider: node.source, description: node.preview, stackLayers: node.stackLayers, signal: node.meta, node })), []);
  const linkedRecords = useMemo<AgentBriefRecord[]>(() => externalSources.map((source) => ({ id: `source:${source.id}`, title: source.title, kind: source.kind, provider: source.provider, description: source.description, stackLayers: sourceStackLayers(source), signal: source.example.fields.find((field) => /date|time|period|range|year|observed|capture/i.test(field.label))?.value ?? 'recurrence to check in original source', source })), []);
  const runBrief = useCallback((requestedQuery: string, requestedScope = searchScope, requestedStackFilter: StackLayer | 'all' = stackFilter) => {
    const nextQuery = requestedQuery.trim() || 'latest information warfare and ecommerce stack';
    const terms = nextQuery.toLowerCase().split(/[^a-z0-9]+/).filter((term) => term.length > 2);
    const pool = requestedScope === 'web' ? linkedRecords : requestedScope === 'curated' ? localRecords : [...localRecords, ...linkedRecords];
    const scopedPool = requestedStackFilter === 'all' ? pool : pool.filter((record) => record.stackLayers.includes(requestedStackFilter));
    const rankedPool = scopedPool.map((record, index) => { const haystack = [record.title, record.provider, record.kind, record.description, ...record.stackLayers, record.signal].join(' ').toLowerCase(); const score = terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0); return { record, score, index }; }).sort((left, right) => right.score - left.score || left.index - right.index).map(({ record }) => record);
    const mixed = requestedScope === 'both' ? [rankedPool.find((record) => record.node), rankedPool.find((record) => record.source), ...rankedPool].filter((record): record is AgentBriefRecord => Boolean(record)) : rankedPool;
    const ranked = Array.from(new globalThis.Map(mixed.map((record) => [record.id, record])).values()).slice(0, 4);
    setSearchScope(requestedScope);
    setStackFilter(requestedStackFilter);
    setQuery(nextQuery);
    setBrief(ranked);
    setKept(ranked.slice(0, Math.min(3, ranked.length)).map((record) => record.id));
    setOutputChoice('');
  }, [linkedRecords, localRecords, searchScope, stackFilter]);
  const toggleKept = (recordId: string) => setKept((current) => current.includes(recordId) ? current.filter((id) => id !== recordId) : [...current, recordId]);
  useEffect(() => {
    if (brief && onBriefStateChange) onBriefStateChange(makeAgentBriefSnapshot(query, searchScope, stackFilter, brief, kept));
  }, [brief, kept, onBriefStateChange, query, searchScope, stackFilter]);
  useEffect(() => {
    if (!agentRequest || lastAgentRequestRef.current === agentRequest.requestId) return;
    lastAgentRequestRef.current = agentRequest.requestId;
    runBrief(agentRequest.query, agentRequest.scope, agentRequest.stackFilter);
  }, [agentRequest, runBrief]);
  const suggestions = ['latest info war + ecommerce stack', 'human trafficking + digital labour', 'OCCRP + infrastructure'];
  const outputOptions = ['Mini report', 'Timeline', 'Threshold note', 'Network map'];
  return <section className="agent-brief-surface" aria-label="Agent-assisted research brief"><div className="agent-brief-head"><div><span className="eyebrow-label">WEBMCP RESEARCH BRIEF · CURATED DEMO</span><h2>Ask the wider field a question.</h2><p>Ask a question or choose a starting prompt. The prototype searches its curated records and linked source index, then returns a small candidate set to inspect, retain, and turn into a possible output.</p></div><div className="agent-brief-status"><Network size={18} /><span>LOCAL + LINKED SOURCES</span><small>Live imports are future observatory work.</small></div></div><details className="agent-instruction"><summary><span>AGENT INSTRUCTION</span><strong>How the research brief is composed</strong><ChevronRight size={14} /></summary><p>{AGENT_RESEARCH_INSTRUCTION}</p></details><form className="agent-brief-form" onSubmit={(event) => { event.preventDefault(); runBrief(query); }}><label className="agent-brief-field" htmlFor="terrain-search"><span>RUN A RESEARCH SCAN</span><small>ask a question across selected sources and stack levels</small></label><p className="agent-brief-distinction"><strong>Different from the quick index above:</strong> this scan assembles a candidate set for inspection; it does not simply jump to a known record.</p><div className="agent-brief-scope" role="group" aria-label="Research scan scope"><span>SCAN SCOPE</span><div>{searchScopes.map((scope) => <button type="button" className={`agent-brief-scope-option ${searchScope === scope.id ? 'is-selected' : ''}`} key={scope.id} onClick={() => setSearchScope(scope.id)} aria-pressed={searchScope === scope.id}>{scope.label}</button>)}</div><small>{searchScopes.find((scope) => scope.id === searchScope)?.detail}</small></div><div className="agent-brief-stack-filter" role="group" aria-label="Filter research scan by ecommerce stack level"><span>STACK FILTER</span><div>{stackFilters.map((filter) => <button type="button" className={`agent-brief-stack-option ${stackFilter === filter.id ? 'is-selected' : ''}`} key={filter.id} onClick={() => setStackFilter(filter.id)} aria-pressed={stackFilter === filter.id}>{filter.id === 'all' ? 'ALL' : `${(stackLayerDetails.findIndex((item) => item.layer === filter.id) + 1).toString().padStart(2, '0')} · ${filter.label}`}</button>)}</div><small>{stackFilter === 'all' ? 'search every level of the enabling assemblage' : `show records tagged ${stackFilter}`}</small></div><div className="agent-brief-controls"><input id="terrain-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ask: what is the latest on info war + ecommerce?" aria-label="Ask a research question for the agent scan" /><button type="submit" className="primary-button"><Search size={14} /> Run scan</button><button type="button" className="quiet-button" onClick={() => runBrief('')}><Sparkles size={14} /> I’m feeling lucky</button></div><div className="agent-brief-suggestions" aria-label="Suggested research questions">{suggestions.map((suggestion) => <button type="button" className="agent-brief-suggestion" key={suggestion} onClick={() => runBrief(suggestion)}>{suggestion}<ChevronRight size={12} /></button>)}</div></form>{brief && <div className="agent-brief-results" aria-live="polite"><div className="agent-brief-results-head"><div><span className="eyebrow-label">RAPID FIELD SCAN · {searchScope === 'web' ? 'LINKED WEB INDEX' : searchScope === 'curated' ? 'CURATED RECORDS' : 'LOCAL + LINKED SOURCES'}</span><h3>{query}</h3></div><span>{brief.length} candidate records · {kept.length} retained</span></div>{searchScope === 'web' && <p className="agent-brief-scope-note"><Globe2 size={13} /> Live web import is not connected in this proof of concept; these are link-ready web sources from the curated index.</p>}{searchScope === 'curated' && <p className="agent-brief-scope-note"><Archive size={13} /> These results come from the reproducible local demonstration corpus.</p>}{searchScope === 'both' && <p className="agent-brief-scope-note"><Network size={13} /> This cross-check pairs local demonstration records with the linked source index; it does not imply a live web fetch.</p>}<p className="agent-brief-scope-note"><Layers2 size={13} /> Stack filter: {stackFilter === 'all' ? 'all six levels' : `level ${(stackLayerDetails.findIndex((item) => item.layer === stackFilter) + 1).toString().padStart(2, '0')} · ${stackFilter}`}</p><div className="agent-brief-result-layout"><div className="agent-brief-visual" aria-label={`Illustrative stack lens showing ${brief.length} candidate records`}><div className="agent-brief-visual-core"><Network size={22} /><span>STACK LENS</span><strong>{kept.length} retained</strong><small>of {brief.length} candidates</small></div><div className="agent-brief-visual-links">{brief.map((record, index) => <div className="agent-brief-visual-link" key={record.id}><b>{(index + 1).toString().padStart(2, '0')}</b><span><strong>{record.title}</strong><small>{record.stackLayers[0]}</small></span></div>)}</div><p>Illustrative connections across source types — a lead to inspect, not an inferred causal chain.</p></div><div className="agent-brief-result-list">{brief.map((record, index) => { const isKept = kept.includes(record.id); return <div className={`agent-brief-result-row ${isKept ? 'is-kept' : ''}`} key={record.id}><button type="button" className="agent-brief-result-main" onClick={() => toggleKept(record.id)} aria-pressed={isKept}><span className="agent-brief-result-main-head"><b>{(index + 1).toString().padStart(2, '0')}</b><small>{record.kind} · {record.provider}</small><em>{isKept ? 'RETAINED' : 'SELECT TO RETAIN'}</em></span><strong>{record.title}</strong><StackLayerPills layers={record.stackLayers} /><span className="agent-brief-result-signal"><Clock3 size={12} /><span>signal: {record.signal}</span></span></button><div className="agent-brief-result-actions">{record.source ? <><button type="button" onClick={() => onOpenExample(record.source?.id ?? '')}>Citation</button><button type="button" onClick={() => onOpenCollection(record.source?.id ?? '')}>Profile</button><a href={record.source.url} target="_blank" rel="noreferrer" aria-label={`Open original source for ${record.title}`}><ExternalLink size={12} /></a></> : <button type="button" onClick={() => onOpenEvidence(record.node?.id ?? '')}>Inspect</button>}</div></div>; })}</div></div><div className="agent-brief-followup"><div><span className="eyebrow-label">WHAT SHOULD THIS BECOME?</span><p>Retain the records you want to carry forward, then choose the form of the next research note.</p></div><div className="agent-output-options">{outputOptions.map((option) => <button type="button" className={`agent-output-option ${outputChoice === option ? 'is-selected' : ''}`} key={option} onClick={() => { setOutputChoice(option); onOpenOutputs(); }}>{option}<ChevronRight size={12} /></button>)}<button type="button" className="agent-output-option agent-output-presentation" onClick={() => { setOutputChoice('Show me the lot together'); onOpenPresentation(makeAgentBriefSnapshot(query, searchScope, stackFilter, brief, kept)); }}><Sparkles size={12} /> Show me the lot together</button><button type="button" className="agent-output-option" onClick={() => { setOutputChoice('Saved to notebook'); onSaveBrief(makeAgentBriefSnapshot(query, searchScope, stackFilter, brief, kept)); }}>Save brief to notebook <Bookmark size={12} /></button>{outputChoice && <small className="agent-output-choice">{outputChoice} selected</small>}</div></div><p className="agent-brief-caveat"><CircleHelp size={14} /> The scan surfaces candidates for review. It does not import every record or establish coordination.</p></div>}</section>;
}

function SignalFeed({ items, savedIds, active, paused, status, onToggleActive, onSave, onOpenExample }: { items: SignalFeedItem[]; savedIds: string[]; active: boolean; paused: boolean; status: string; onToggleActive: () => void; onSave: (item: SignalFeedItem) => void; onOpenExample: (sourceId: string) => void }) {
  const renderedItems = items.length ? [...items, ...items] : [];
  const agentSupplied = status.startsWith('AGENT SUPPLIED');
  const toggleLabel = !active ? agentSupplied ? 'Start agent feed' : 'Start curated preview' : paused ? 'Resume feed' : 'Pause feed';
  return <section id="live-agent-feed" className={`signal-feed ${active ? 'is-active' : ''} ${paused ? 'is-paused' : ''} ${agentSupplied ? 'is-agent-supplied' : 'is-curated'}`} aria-label="Live agent signal desk">
    <div className="signal-feed-control">
      <span className="eyebrow-label">LIVE AGENT SIGNAL DESK</span>
      <h2>Watch the wider field arrive.</h2>
      <p>A connected agent can publish current, directly linked reporting here and label each lead by information-warfare relevance and ecommerce-stack position.</p>
      <div className="signal-feed-control-status" aria-live="polite"><span className="live-dot" /><strong>{status}</strong><small>{items.length} {agentSupplied ? 'current agent leads ready for review' : 'curated examples showing the live-feed format'}</small></div>
      <button type="button" className="signal-feed-toggle" onClick={onToggleActive} aria-pressed={active && !paused}>{active && !paused ? <Pause size={14} /> : <Play size={14} />}{toggleLabel}</button>
      <details className="signal-feed-agent-help"><summary>Ask the agent to refresh this feed</summary><p>“Find current, directly cited reporting relevant to information warfare and its enabling ecommerce stack, then publish the strongest leads to this page.”</p></details>
      <small className="signal-feed-control-note">Pause—or hover over the newswire—to inspect a citation. Save only the leads you want to carry into the notebook.</small>
    </div>
    <div className="signal-feed-viewport">
      {renderedItems.length ? <div className="signal-feed-track">{renderedItems.map((item, index) => { const duplicate = index >= items.length; const saved = savedIds.includes(item.id); return <article className="signal-feed-item" key={`${item.id}-${index}`} aria-hidden={duplicate || undefined}><div className="signal-feed-item-copy"><div className="signal-feed-item-meta"><span>{item.freshness}</span><span>{item.sourceKind}</span></div><a className="signal-feed-headline" href={item.sourceUrl} target="_blank" rel="noreferrer" tabIndex={duplicate ? -1 : undefined}>{item.headline} <ExternalLink size={12} /></a><div className="signal-feed-tags"><span className="signal-feed-tag signal-feed-tag-infowar">{item.infowarLabel}</span>{item.stackLayers.slice(0, 3).map((layer) => <span className="signal-feed-tag signal-feed-tag-stack" key={layer}>{(stackLayerDetails.findIndex((record) => record.layer === layer) + 1).toString().padStart(2, '0')} / 06 · {layer}</span>)}</div><small className="signal-feed-relevance">{item.relevance}</small></div><div className="signal-feed-item-actions">{item.sourceId && <button type="button" onClick={() => onOpenExample(item.sourceId!)} tabIndex={duplicate ? -1 : undefined}>Citation</button>}<button type="button" onClick={() => onSave(item)} aria-pressed={saved} tabIndex={duplicate ? -1 : undefined}>{saved ? 'Saved' : 'Save lead'} <Bookmark size={12} /></button></div></article>; })}</div> : <div className="signal-feed-empty"><Globe2 size={18} /><strong>No agent leads yet.</strong><span>Activate the feed or ask the connected agent to publish link-backed headlines here.</span></div>}
    </div>
  </section>;
}

function EvidenceRibbon({ onOpenExample, onOpenDatasets }: { onOpenExample: (sourceId: string) => void; onOpenDatasets: () => void }) {
  const ribbonSources = externalSources.slice(0, 6);
  return <section className="evidence-ribbon" aria-label="Illustrative source index ribbon"><div className="evidence-ribbon-head"><span><Sparkles size={12} /> FIELD NOTES · EXPLORE DATASETS</span><span className="evidence-ribbon-head-actions"><small>illustrative index only · select a panel to open the direct citation</small><button type="button" className="evidence-ribbon-more" onClick={onOpenDatasets}>More datasets <ChevronRight size={12} /></button></span></div><div className="evidence-ribbon-track"><div className="evidence-ribbon-art"><div className="evidence-ribbon-hotspots" aria-label="Clickable source panels">{ribbonSources.map((source, index) => <button type="button" className={`evidence-ribbon-hotspot ribbon-hotspot-${index + 1}`} key={source.id} onClick={() => onOpenExample(source.id)} aria-label={`Open direct source citation for ${source.title}`}><span className="evidence-ribbon-hotspot-label"><b>{(index + 1).toString().padStart(2, '0')}</b><span><strong>{source.title}</strong><small>{source.kind}</small></span></span></button>)}</div></div></div></section>;
}

export default function Home() {
  const [view, setView] = useState<View>('concept-demo');
  const [selectedId, setSelectedId] = useState('service');
  const [evidenceOnly, setEvidenceOnly] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [evidenceCardIds, setEvidenceCardIds] = useState<string[]>([]);
  const [stackOpen, setStackOpen] = useState(false);
  const [collectionSourceId, setCollectionSourceId] = useState<string | null>(null);
  const [exampleSourceId, setExampleSourceId] = useState<string | null>(null);
  const [notebookOpen, setNotebookOpen] = useState(false);
  const [agentBriefRequest, setAgentBriefRequest] = useState<AgentBriefRequest | null>(null);
  const [agentBriefSnapshot, setAgentBriefSnapshot] = useState<AgentBriefSnapshot | null>(null);
  const [savedAgentBriefs, setSavedAgentBriefs] = useState<SavedAgentBrief[]>([]);
  const [savedSignalItems, setSavedSignalItems] = useState<SavedSignalItem[]>([]);
  const [browserStateLoaded, setBrowserStateLoaded] = useState(false);
  const [signalFeedEntries, setSignalFeedEntries] = useState<SignalFeedItem[]>(signalFeedItems);
  const [signalFeedActive, setSignalFeedActive] = useState(false);
  const [signalFeedPaused, setSignalFeedPaused] = useState(false);
  const [signalFeedStatus, setSignalFeedStatus] = useState('CURATED STARTERS · ASK AGENT TO REFRESH');
  const [compareBriefId, setCompareBriefId] = useState<string | null>(null);
  const [presentationSnapshot, setPresentationSnapshot] = useState<AgentBriefSnapshot | null>(null);
  const [conceptDetailLabel, setConceptDetailLabel] = useState<string | null>(null);
  const [stackLayerDetailLabel, setStackLayerDetailLabel] = useState<StackLayer | null>(null);
  const [possibleOutputExampleCode, setPossibleOutputExampleCode] = useState<PossibleOutputCode | null>(null);
  const [selectedTerrainLabel, setSelectedTerrainLabel] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState('');
  const [agentMessage, setAgentMessage] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scrollPromptVisible, setScrollPromptVisible] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const stageContentRef = useRef<HTMLDivElement>(null);
  const [connectionStatusOpen, setConnectionStatusOpen] = useState(false);
  const [connectionStatusOrigin] = useState<'top'>('top');
  const soundContextRef = useRef<AudioContext | null>(null);
  const [webmcpReady, setWebmcpReady] = useState(false);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setView(viewFromLocation());
      setNotebookOpen(notebookFromLocation());
      try {
        const storedBriefs = window.localStorage.getItem('hyphosphere-agent-briefs');
        const parsedBriefs = storedBriefs ? JSON.parse(storedBriefs) : [];
        if (Array.isArray(parsedBriefs)) setSavedAgentBriefs(parsedBriefs);
        const storedSignals = window.localStorage.getItem('hyphosphere-saved-signal-items');
        const parsedSignals = storedSignals ? JSON.parse(storedSignals) : [];
        if (Array.isArray(parsedSignals)) setSavedSignalItems(parsedSignals);
        setSoundEnabled(window.localStorage.getItem('hyphosphere-sound-enabled') !== 'false');
      } catch {
        // Browser storage is an enhancement; the local demo remains usable without it.
      }
      setBrowserStateLoaded(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    if (!browserStateLoaded) return;
    try {
      window.localStorage.setItem('hyphosphere-agent-briefs', JSON.stringify(savedAgentBriefs));
    } catch {
      // Notebook entries remain available for this session when storage is unavailable.
    }
  }, [browserStateLoaded, savedAgentBriefs]);
  useEffect(() => {
    if (!browserStateLoaded) return;
    try {
      window.localStorage.setItem('hyphosphere-saved-signal-items', JSON.stringify(savedSignalItems));
    } catch {
      // Signal leads remain available for this session when storage is unavailable.
    }
  }, [browserStateLoaded, savedSignalItems]);
  const stateRef = useRef({ view, evidenceOnly, selectedId, followed, saved });

  useEffect(() => {
    stateRef.current = { view, evidenceOnly, selectedId, followed, saved };
  }, [evidenceOnly, followed, saved, selectedId, view]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setExampleSourceId(null);
        setEvidenceOpen(false);
        setStackOpen(false);
        setCollectionSourceId(null);
        setNotebookOpen(false);
        setConceptDetailLabel(null);
        setStackLayerDetailLabel(null);
        setPossibleOutputExampleCode(null);
        setPresentationSnapshot(null);
        setConnectionStatusOpen(false);
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  useEffect(() => {
    const syncViewFromHistory = () => {
      setView(viewFromLocation());
      setNotebookOpen(notebookFromLocation());
      setConnectionStatusOpen(false);
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    window.addEventListener('popstate', syncViewFromHistory);
    return () => window.removeEventListener('popstate', syncViewFromHistory);
  }, []);

  useEffect(() => {
    const refreshScrollPrompt = () => {
      const documentHeight = document.documentElement.scrollHeight;
      const hasMoreBelow = documentHeight - window.innerHeight > 140;
      const nearBottom = window.scrollY + window.innerHeight >= documentHeight - 70;
      const modalOpen = evidenceOpen || stackOpen || Boolean(collectionSourceId) || Boolean(exampleSourceId) || notebookOpen || Boolean(conceptDetailLabel) || Boolean(stackLayerDetailLabel) || Boolean(possibleOutputExampleCode) || Boolean(presentationSnapshot);
      setScrollPromptVisible(hasMoreBelow && !nearBottom && !modalOpen && !mobileNavOpen);
    };

    refreshScrollPrompt();
    const resizeObserver = new ResizeObserver(refreshScrollPrompt);
    resizeObserver.observe(document.body);
    window.addEventListener('scroll', refreshScrollPrompt, { passive: true });
    window.addEventListener('resize', refreshScrollPrompt);
    const frame = window.requestAnimationFrame(refreshScrollPrompt);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('scroll', refreshScrollPrompt);
      window.removeEventListener('resize', refreshScrollPrompt);
      window.cancelAnimationFrame(frame);
    };
  }, [collectionSourceId, conceptDetailLabel, evidenceOpen, exampleSourceId, mobileNavOpen, notebookOpen, possibleOutputExampleCode, presentationSnapshot, stackLayerDetailLabel, stackOpen, view]);

  const selected = nodeById(selectedId);
  const evidenceCardNodes = useMemo(() => evidenceCardIds.map(nodeById), [evidenceCardIds]);
  const evidenceCardEdges = useMemo(() => evidenceCardIds.slice(1).map((id, index) => edges.find((edge) => (edge.from === evidenceCardIds[index] && edge.to === id) || (edge.to === evidenceCardIds[index] && edge.from === id))).filter((edge): edge is ResearchEdge => Boolean(edge)), [evidenceCardIds]);
  const evidenceStackConnected = evidenceCardIds.length > 1 && evidenceCardEdges.length === evidenceCardIds.length - 1;
  const evidenceStackHasCommonActor = evidenceCardIds.includes('service');
  const evidenceStackHasFullPositions = evidenceCardNodes.every((node) => node.stackLayers.length > 0);
  const evidenceStackLit = evidenceStackConnected && evidenceStackHasCommonActor && evidenceStackHasFullPositions && evidenceCardEdges.every((edge) => edge.evidence === 'verified' || edge.evidence === 'supported');
  const exampleSource = externalSources.find((source) => source.id === exampleSourceId);
  const collectionSource = externalSources.find((source) => source.id === collectionSourceId);
  const collectionProfileData = collectionSource ? collectionProfile(collectionSource) : null;
  const conceptDetail = conceptRecords.find((record) => record.label === conceptDetailLabel);
  const stackLayerDetail = stackLayerDetails.find((record) => record.layer === stackLayerDetailLabel);
  const possibleOutputExample = possibleOutputExampleCode ? possibleOutputExamples[possibleOutputExampleCode] : null;
  const compareBrief = savedAgentBriefs.find((brief) => brief.id === compareBriefId) ?? null;
  const stackLayerNodes = stackLayerDetail ? nodes.filter((node) => node.stackLayers.includes(stackLayerDetail.layer)) : [];
  const stackLayerSources = stackLayerDetail ? externalSources.filter((source) => sourceStackLayers(source).includes(stackLayerDetail.layer)) : [];
  const selectedTerrainLayer = terrainItems.find((item) => item.label === selectedTerrainLabel) ?? null;
  const visibleNodeIds = useMemo(() => {
    const ids = new Set(['northline', 'lantern', 'service', 'greybox', 'longarc']);
    if (followed) {
      ids.add('invite');
      ids.add('harbor');
    }
    return ids;
  }, [followed]);

  const filteredNodes = useMemo(() => nodes.filter((node) => !evidenceOnly || node.evidence === 'verified'), [evidenceOnly]);

  const filteredEdges = useMemo(() => edges.filter((edge) => !evidenceOnly || edge.evidence === 'verified'), [evidenceOnly]);

  const pushToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3600);
  }, []);

  const playUiSound = useCallback((kind: 'click' | 'reveal', force = false) => {
    if ((!soundEnabled && !force) || typeof window === 'undefined') return;
    const AudioContextConstructor = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return;
    const audioContext = soundContextRef.current ?? new AudioContextConstructor();
    soundContextRef.current = audioContext;
    if (audioContext.state === 'suspended') void audioContext.resume();
    const now = audioContext.currentTime;
    const scheduleTone = (frequency: number, start: number, duration: number, peak: number, type: OscillatorType, bend = 1) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency * 0.985, start);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * bend, start + Math.min(0.035, duration * 0.25));
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2600, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(peak, start + 0.009);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(gain);
      gain.connect(filter);
      filter.connect(audioContext.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.025);
    };

    if (kind === 'reveal') {
      // A tiny rising arpeggio makes a newly revealed path feel like a discovery.
      scheduleTone(659.25, now, 0.28, 0.024, 'sine', 1.01);
      scheduleTone(783.99, now + 0.065, 0.31, 0.026, 'triangle', 1.012);
      scheduleTone(1046.5, now + 0.13, 0.42, 0.032, 'sine', 1.006);
      scheduleTone(1318.5, now + 0.135, 0.24, 0.008, 'sine', 1.004);
    } else {
      // A soft paired “spark” keeps ordinary clicks friendly without becoming noisy.
      scheduleTone(523.25, now, 0.14, 0.026, 'triangle', 1.018);
      scheduleTone(783.99, now + 0.018, 0.12, 0.011, 'sine', 1.012);
    }
  }, [soundEnabled]);

  const handleSurfaceClick = useCallback((event: ReactMouseEvent<HTMLElement>) => {
    const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-sound], button, a') : null;
    if (!target || target.dataset.sound === 'none' || target.getAttribute('aria-disabled') === 'true') return;
    const isReveal = target.dataset.sound === 'reveal' || target.matches('.follow-button, .orientation-cta, .terrain-tile, .stack-learning-layer, .stack-step-button, .thread-step-card, .source-citation-button, .source-example-button, .source-profile-button, .search-preview-button, .search-inspect-button, .possible-output-type-card');
    playUiSound(isReveal ? 'reveal' : 'click');
  }, [playUiSound]);

  useEffect(() => () => {
    if (soundContextRef.current) void soundContextRef.current.close();
  }, []);

  const announce = useCallback((message: string) => {
    setAgentMessage(message);
    pushToast(message);
  }, [pushToast]);

  const toggleSound = useCallback(() => {
    const willEnable = !soundEnabled;
    setSoundEnabled(willEnable);
    try {
      window.localStorage.setItem('hyphosphere-sound-enabled', String(willEnable));
    } catch {
      // The control still works for this session when browser storage is unavailable.
    }
    if (willEnable) {
      playUiSound('click', true);
      announce('Interface sounds enabled. Clicks and reveals now have audio cues.');
    } else {
      announce('Interface sounds muted.');
    }
  }, [announce, playUiSound, soundEnabled]);

  const followNode = useCallback((id = 'service') => {
    const target = nodeById(id);
    setSelectedId(id);
    setFollowed(true);
    setAgentMessage(`Followed ${target.label}. Two related objects entered the terrain.`);
    pushToast(`Path extended through ${target.label}`);
  }, [pushToast]);

  const openEvidence = useCallback((id?: string) => {
    const targetId = id ?? stateRef.current.selectedId;
    setSelectedId(targetId);
    setEvidenceCardIds((current) => [...current.filter((cardId) => cardId !== targetId), targetId].slice(-5));
    setEvidenceOpen(true);
    setAgentMessage(`Evidence drawer opened for ${nodeById(targetId).label}.`);
  }, []);

  const selectEvidenceCard = useCallback((id: string) => {
    setSelectedId(id);
    setEvidenceCardIds((current) => [...current.filter((cardId) => cardId !== id), id].slice(-5));
    setAgentMessage(`Evidence card brought to the front for ${nodeById(id).label}.`);
  }, []);

  const openExample = useCallback((sourceId: string) => {
    const source = externalSources.find((item) => item.id === sourceId);
    if (!source) return;
    setExampleSourceId(sourceId);
    setAgentMessage(`Source citation opened for ${source.title}.`);
  }, []);

  const openCollection = useCallback((sourceId: string) => {
    const source = externalSources.find((item) => item.id === sourceId);
    if (!source) return;
    setCollectionSourceId(sourceId);
    setAgentMessage(`Collection profile opened for ${source.title}.`);
  }, []);

  const openConcept = useCallback((label: string) => {
    const concept = conceptRecords.find((record) => record.label === label);
    if (!concept) return;
    setConceptDetailLabel(label);
    setStackLayerDetailLabel(null);
    setAgentMessage(`Research concept opened: ${concept.label}.`);
  }, []);

  const openStackLayer = useCallback((layer: StackLayer) => {
    const detail = stackLayerDetails.find((record) => record.layer === layer);
    if (!detail) return;
    setStackLayerDetailLabel(layer);
    setConceptDetailLabel(null);
    setAgentMessage(`Stack layer opened: ${detail.layer}.`);
  }, []);

  const toggleVerified = useCallback(() => {
    setEvidenceOnly((current) => {
      const next = !current;
      setAgentMessage(next ? 'Showing verified evidence only.' : 'Showing the full evidence terrain.');
      return next;
    });
  }, []);

  const inspectTerrain = useCallback((label: string) => {
    const layer = terrainItems.find((item) => item.label === label);
    setSelectedTerrainLabel(label);
    announce(`${label} layer selected. ${layer?.role ?? 'Inspect the related material below.'}`);
  }, [announce]);

  const openHomeSurface = useCallback((selector: string, message: string) => {
    if (typeof window !== 'undefined') {
      const currentUrl = `${window.location.pathname}${window.location.search}`;
      if (currentUrl !== '/') window.history.pushState({ area: viewSlugs['concept-demo'] }, '', '/');
    }
    setView('concept-demo');
    setEvidenceOpen(false);
    setStackOpen(false);
    setCollectionSourceId(null);
    setExampleSourceId(null);
    setNotebookOpen(false);
    setConceptDetailLabel(null);
    setStackLayerDetailLabel(null);
    setPossibleOutputExampleCode(null);
    setPresentationSnapshot(null);
    setMobileNavOpen(false);
    setAgentMessage(message);
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'start' })));
  }, []);

  const openTerrainAgentSearch = useCallback((query: string) => {
    setAgentBriefRequest({ query: query.trim() || 'latest information warfare and ecommerce stack', scope: 'both', stackFilter: 'all', requestId: Date.now() });
    openHomeSurface('.agent-brief-surface', 'Broader agent search opened from the Source Terrain field.');
  }, [openHomeSurface]);

  const saveDiscovery = useCallback(() => {
    setSaved(true);
    setAgentMessage('Discovery saved with its trail, evidence classes, and provenance.');
    pushToast('Discovery saved to your notebook');
  }, [pushToast]);

  const handleBriefStateChange = useCallback((snapshot: AgentBriefSnapshot) => {
    setAgentBriefSnapshot(snapshot);
  }, []);

  const saveAgentBrief = useCallback((snapshot: AgentBriefSnapshot) => {
    const entry: SavedAgentBrief = { ...snapshot, id: `brief-${Date.now()}`, savedAt: new Date().toISOString() };
    setSavedAgentBriefs((current) => [entry, ...current].slice(0, 12));
    setAgentBriefSnapshot(snapshot);
    setNotebookOpen(true);
    announce('Agent brief saved to your notebook. Compare it with the existing Hyphosphere assets.');
  }, [announce]);

  const saveSignal = useCallback((item: SignalFeedItem) => {
    setSavedSignalItems((current) => current.some((savedItem) => savedItem.id === item.id) ? current : [...current, { ...item, savedAt: new Date().toISOString() }]);
    setAgentMessage(`Signal lead saved: ${item.headline}`);
    pushToast('Signal lead saved to your notebook');
  }, [pushToast]);

  const toggleSignalFeed = useCallback(() => {
    if (!signalFeedActive) {
      setSignalFeedActive(true);
      setSignalFeedPaused(false);
      setAgentMessage('Signal feed activated. Hover or focus the headlines to pause them.');
      return;
    }
    setSignalFeedPaused((current) => {
      const next = !current;
      setAgentMessage(next ? 'Signal feed paused for inspection.' : 'Signal feed resumed.');
      return next;
    });
  }, [signalFeedActive]);

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
    if (action === 'save_agent_brief') {
      if (!agentBriefSnapshot) return { ok: false, action, error: 'Run a research brief and retain at least one candidate before saving.' };
      saveAgentBrief(agentBriefSnapshot);
      return { ok: true, action, result: 'agent brief saved to notebook', query: agentBriefSnapshot.query, retained: agentBriefSnapshot.keptIds.length };
    }
    if (action === 'publish_signal_feed') {
      const rawItems = Array.isArray(input.items) ? input.items : [];
      const validLayers = stackLayerDetails.map((detail) => detail.layer);
      const normalized = rawItems.map((raw, index) => {
        if (!raw || typeof raw !== 'object') return null;
        const record = raw as Record<string, unknown>;
        const headline = typeof record.headline === 'string' ? record.headline.trim() : '';
        const sourceTitle = typeof record.sourceTitle === 'string' ? record.sourceTitle.trim() : '';
        const sourceUrl = typeof record.sourceUrl === 'string' ? record.sourceUrl.trim() : '';
        if (!headline || !sourceTitle || !sourceUrl.startsWith('https://')) return null;
        const stackLayers = Array.isArray(record.stackLayers) ? record.stackLayers.filter((layer): layer is StackLayer => typeof layer === 'string' && validLayers.includes(layer as StackLayer)) : [];
        return {
          id: `agent-signal:${Date.now()}-${index}`,
          headline,
          sourceTitle,
          sourceKind: typeof record.sourceKind === 'string' ? record.sourceKind : 'AGENT SOURCE',
          sourceUrl,
          freshness: typeof record.freshness === 'string' ? record.freshness : 'agent supplied · current fetch',
          infowarLabel: typeof record.infowarLabel === 'string' ? record.infowarLabel : 'information warfare relevance',
          stackLayers: stackLayers.length ? stackLayers : ['Visible story / reporting'],
          relevance: typeof record.relevance === 'string' ? record.relevance : 'agent-ranked lead for researcher review',
        } satisfies SignalFeedItem;
      }).filter((item): item is SignalFeedItem => Boolean(item));
      if (!normalized.length) return { ok: false, action, error: 'Supply at least one HTTPS headline with sourceTitle, sourceUrl, and optional stack labels.' };
      setSignalFeedEntries(normalized);
      setSignalFeedStatus('AGENT SUPPLIED · REVIEW LINKS');
      setSignalFeedActive(true);
      setSignalFeedPaused(false);
      openHomeSurface('#live-agent-feed', `Agent supplied ${normalized.length} signal lead${normalized.length === 1 ? '' : 's'} for review.`);
      return { ok: true, action, status: 'agent-mediated signal feed published', count: normalized.length, visibleSurface: 'live agent signal desk', items: normalized.map((item) => ({ id: item.id, headline: item.headline, sourceTitle: item.sourceTitle, sourceUrl: item.sourceUrl, infowarLabel: item.infowarLabel, stackLayers: item.stackLayers, relevance: item.relevance })) };
    }
    if (action === 'save_signal_feed_item') {
      const itemId = typeof input.itemId === 'string' ? input.itemId : '';
      const item = signalFeedEntries.find((entry) => entry.id === itemId);
      if (!item) return { ok: false, action, error: 'Signal item not found in the active feed.' };
      saveSignal(item);
      return { ok: true, action, result: 'signal lead saved to notebook', item: { headline: item.headline, sourceUrl: item.sourceUrl } };
    }
    if (action === 'draft_possible_output') {
      setView('outputs');
      setConceptDetailLabel(null);
      setAgentMessage('Possible outputs opened: candidate cluster and micro case study are ready for researcher review.');
      return { ok: true, action, status: 'draft for researcher review', cluster: possibleOutput.clusterTitle, summary: possibleOutput.clusterSummary, microCaseStudy: { title: possibleOutput.caseStudyTitle, body: possibleOutput.caseStudyBody }, relatedReporting: possibleOutput.relatedReporting.map((id) => externalSources.find((source) => source.id === id)).filter((source): source is ResearchSource => Boolean(source)).map((source) => ({ title: source.title, provider: source.provider, url: source.url })), caveat: possibleOutput.reviewNote };
    }
    if (action === 'show_terrain') {
      setView('terrain');
      setAgentMessage('Terrain view opened: source ecology is now in focus.');
      return { ok: true, action, view: 'terrain' };
    }
    if (action === 'list_source_collections') {
      const requestedLayer = input.stackLayer;
      const stackLayer = typeof requestedLayer === 'string' && stackLayerDetails.some((item) => item.layer === requestedLayer) ? requestedLayer as StackLayer : 'all';
      const sources = sourceManifest().filter((source) => stackLayer === 'all' || source.stackLayers.includes(stackLayer));
      return { ok: true, action, stackLayer, count: sources.length, note: 'These are link-ready starting points. Hyphosphere has not downloaded or independently verified every record.', sources };
    }
    if (action === 'search_research') {
      const query = typeof input.query === 'string' ? input.query.trim() : '';
      const scope: SearchScope = input.scope === 'web' || input.scope === 'curated' || input.scope === 'both' ? input.scope : 'both';
      const requestedLayer = input.stackLayer;
      const stackLayer = typeof requestedLayer === 'string' && stackLayerDetails.some((item) => item.layer === requestedLayer) ? requestedLayer as StackLayer : 'all';
      const matchingNodes = nodes.filter((node) => (stackLayer === 'all' || node.stackLayers.includes(stackLayer)) && matchesResearchQuery(`${node.label} ${node.kind} ${node.source} ${node.preview} ${node.inclusionReason} ${node.stackLayers.join(' ')}`, query));
      const matchingSources = externalSources.filter((source) => (stackLayer === 'all' || sourceStackLayers(source).includes(stackLayer)) && matchesResearchQuery(`${source.title} ${source.provider} ${source.kind} ${source.description} ${source.whyIncluded} ${source.tags.join(' ')} ${sourceStackLayers(source).join(' ')}`, query));
      setAgentBriefRequest({ query: query || 'latest information warfare and ecommerce stack', scope, stackFilter: stackLayer, requestId: Date.now() });
      openHomeSurface('.agent-brief-surface', `Agent research brief opened for ${scope === 'both' ? 'local and linked sources' : scope === 'web' ? 'linked web sources' : 'curated records'}.`);
      return { ok: true, action, query, scope, stackLayer, visibleSurface: 'agent research brief', scopeNote: scope === 'web' ? 'Live web import is not connected in this proof of concept; use the linked source index as a starting point.' : scope === 'curated' ? 'Results are from the reproducible local demonstration corpus.' : 'Results combine local demonstration records with the linked source index; no live web fetch is implied.', objects: scope === 'web' ? [] : matchingNodes.map((node) => ({ id: node.id, label: node.label, kind: node.kind, source: node.source, stackLayers: node.stackLayers })), externalSources: scope === 'curated' ? [] : matchingSources.map((source) => ({ id: source.id, title: source.title, provider: source.provider, url: source.url, stackLayers: sourceStackLayers(source), access: source.access })) };
    }
    return { ok: false, error: 'Unknown action' };
  }, [agentBriefSnapshot, followNode, openEvidence, openHomeSurface, saveAgentBrief, saveDiscovery, saveSignal, signalFeedEntries, toggleVerified]);

  const runAgentActionRef = useRef(runAgentAction);
  useEffect(() => {
    runAgentActionRef.current = runAgentAction;
  }, [runAgentAction]);
  const webmcpRegistrationStartedRef = useRef(false);

  useEffect(() => {
    type WebMcpToolDefinition = {
      name: string;
      description: string;
      inputSchema: Record<string, unknown>;
      execute: (input?: Record<string, unknown>) => unknown;
    };
    const documentWithModelContext = document as Document & {
      modelContext?: {
        registerTool: (definition: WebMcpToolDefinition) => void | Promise<void>;
      };
    };
    const modelContext = documentWithModelContext.modelContext;
    if (!modelContext?.registerTool || webmcpRegistrationStartedRef.current) return;

    webmcpRegistrationStartedRef.current = true;
    let cancelled = false;
    const register = (definition: WebMcpToolDefinition) => Promise.resolve().then(() => modelContext.registerTool(definition));
    const execute = (action: string) => async (input: Record<string, unknown> = {}) => runAgentActionRef.current(action, input);

    void Promise.all([
      register({ name: 'follow_relationship', description: 'Follow a relationship in the active Hyphosphere investigation and reveal the next research objects.', inputSchema: { type: 'object', properties: { nodeId: { type: 'string', description: 'The node to follow.' } }, additionalProperties: false }, execute: execute('follow_relationship') }),
      register({ name: 'get_evidence', description: 'Open the evidence drawer for a research object or relationship.', inputSchema: { type: 'object', properties: { nodeId: { type: 'string', description: 'The node to inspect.' } }, additionalProperties: false }, execute: execute('get_evidence') }),
      register({ name: 'set_evidence_threshold', description: 'Change the evidence threshold for the shared investigation state.', inputSchema: { type: 'object', properties: { verifiedOnly: { type: 'boolean', description: 'Only show verified relationships.' } }, additionalProperties: false }, execute: execute('set_evidence_threshold') }),
      register({ name: 'show_terrain', description: 'Switch the shared investigation to the source Terrain view.', inputSchema: { type: 'object', properties: {}, additionalProperties: false }, execute: execute('show_terrain') }),
      register({ name: 'save_discovery', description: 'Save the active finding with its trail and evidence distinctions.', inputSchema: { type: 'object', properties: {}, additionalProperties: false }, execute: execute('save_discovery') }),
      register({ name: 'draft_possible_output', description: 'Draft a cautious possible output from the active cluster: a suggestive cluster summary and a micro case study with related reporting links. This does not convert a hypothesis into a verified finding.', inputSchema: { type: 'object', properties: {}, additionalProperties: false }, execute: execute('draft_possible_output') }),
      register({ name: 'list_source_collections', description: 'List every linked database, dataset, report, and repository available in the Hyphosphere research index, optionally filtered to one ecommerce stack level. Returns original resource URLs and access notes; these are linked sources, not downloaded or imported records.', inputSchema: { type: 'object', properties: { stackLayer: { type: 'string', enum: stackLayerDetails.map((item) => item.layer), description: 'Optional ecommerce stack level to filter by.' } }, additionalProperties: false }, execute: execute('list_source_collections') }),
      register({ name: 'search_research', description: 'Search the selected Hyphosphere research scope and optional ecommerce stack level. Choose web for the link-ready web-source index, curated for local demonstration records, or both to cross-check them. Live web/database import is not connected in this proof of concept.', inputSchema: { type: 'object', properties: { query: { type: 'string', description: 'A research term, dataset name, provider, or source type.' }, scope: { type: 'string', enum: ['web', 'curated', 'both'], description: 'Search web, curated records, or both. Defaults to both.' }, stackLayer: { type: 'string', enum: stackLayerDetails.map((item) => item.layer), description: 'Optional stack level filter. Omit to search all six levels.' } }, required: ['query'], additionalProperties: false }, execute: execute('search_research') }),
      register({ name: 'run_research_brief', description: 'Run the visible agent-assisted research brief, placing a small candidate set on screen for the researcher to inspect and retain. Use the source scope and ecommerce stack filter when useful; live import is not connected in this proof of concept.', inputSchema: { type: 'object', properties: { query: { type: 'string', description: 'A focused research question.' }, scope: { type: 'string', enum: ['web', 'curated', 'both'], description: 'Search web, curated records, or both. Defaults to both.' }, stackLayer: { type: 'string', enum: stackLayerDetails.map((item) => item.layer), description: 'Optional stack level filter.' } }, required: ['query'], additionalProperties: false }, execute: execute('search_research') }),
      register({ name: 'save_agent_brief', description: 'Save the retained visible agent research brief to the device-local Hyphosphere notebook so it can be compared with existing demo assets.', inputSchema: { type: 'object', properties: {}, additionalProperties: false }, execute: execute('save_agent_brief') }),
      register({ name: 'publish_signal_feed', description: 'Publish current, link-backed headlines into the visible agent-mediated signal feed. Supply HTTPS source links, information-warfare labels, ecommerce stack positions, and a brief relevance note; the researcher can pause, inspect, and decide what to save.', inputSchema: { type: 'object', properties: { items: { type: 'array', items: { type: 'object', properties: { headline: { type: 'string' }, sourceTitle: { type: 'string' }, sourceKind: { type: 'string' }, sourceUrl: { type: 'string' }, freshness: { type: 'string' }, infowarLabel: { type: 'string' }, stackLayers: { type: 'array', items: { type: 'string', enum: stackLayerDetails.map((item) => item.layer) } }, relevance: { type: 'string' } }, required: ['headline', 'sourceTitle', 'sourceUrl'], additionalProperties: false } } }, required: ['items'], additionalProperties: false }, execute: execute('publish_signal_feed') }),
      register({ name: 'save_signal_feed_item', description: 'Save one item from the active agent signal feed to the device-local notebook for later comparison.', inputSchema: { type: 'object', properties: { itemId: { type: 'string', description: 'The id of the signal item to retain.' } }, required: ['itemId'], additionalProperties: false }, execute: execute('save_signal_feed_item') }),
    ]).then(() => {
      if (!cancelled) setWebmcpReady(true);
    }).catch((error: unknown) => {
      webmcpRegistrationStartedRef.current = false;
      if (!cancelled) setWebmcpReady(false);
      console.error('WebMCP tool registration failed.', error);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const changeView = (nextView: View) => {
    if (typeof window !== 'undefined') {
      const nextUrl = viewHref(nextView);
      const currentUrl = `${window.location.pathname}${window.location.search}`;
      if (currentUrl !== nextUrl) window.history.pushState({ area: viewSlugs[nextView] }, '', nextUrl);
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
    setView(nextView);
    setEvidenceOpen(false);
    setStackOpen(false);
    setCollectionSourceId(null);
    setExampleSourceId(null);
    setNotebookOpen(false);
    setConceptDetailLabel(null);
    setStackLayerDetailLabel(null);
    setPossibleOutputExampleCode(null);
    setPresentationSnapshot(null);
    setMobileNavOpen(false);
  };

  const isActiveInvestigationView = view === 'thread' || view === 'map' || view === 'evidence' || view === 'compare';
  return (
    <main className="app-shell" onClickCapture={handleSurfaceClick}>
      <output className="sr-only" aria-live="polite">{agentMessage}</output>
      <header className="topbar">
        <a className="brand-home-link" href="/" aria-label="Return to the Hyphosphere home page"><div className="brand-lockup"><AppMark /><div><div className="brand-name">hyphosphere</div><div className="brand-caption">research console</div></div></div></a>
         <div className="topbar-center"><a className="topbar-project-title" href="/" aria-label="Return to the Weaponised Ecommerce homepage"><strong>weaponised ecommerce</strong><small>infowar observatory · WebMCP proof of concept</small></a></div>
        <div className="topbar-actions"><button type="button" className={`sound-toggle ${soundEnabled ? 'is-on' : ''}`} onClick={toggleSound} aria-pressed={soundEnabled} aria-label={soundEnabled ? 'Mute interface sounds' : 'Enable interface sounds'} title={soundEnabled ? 'Mute interface sounds' : 'Enable interface sounds'} data-sound="none">{soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}</button><button className={`topbar-status agent-status-link ${webmcpReady ? 'is-ready' : ''}`} onClick={() => setConnectionStatusOpen((open) => !open)} aria-expanded={connectionStatusOpen} aria-controls="hyphosphere-connection-status" aria-label="Open human and agent connection status"><span className={`connection-dot ${webmcpReady ? 'is-ready' : ''}`} /> <span>{webmcpReady ? 'agent link ready' : 'local corpus'}</span></button></div>{connectionStatusOpen && <div id="hyphosphere-connection-status" className={`connection-status-panel connection-status-popover connection-status-origin-${connectionStatusOrigin} ${webmcpReady ? 'is-ready' : ''}`} aria-live="polite"><div className="connection-status-head"><span className="drawer-label">CONNECTION STATUS</span><strong>{webmcpReady ? 'LINKED' : 'LOCAL MODE'}</strong></div><h3>{webmcpReady ? 'An agent can use this field.' : 'This field is running locally.'}</h3><p>{webmcpReady ? 'The agent can use structured actions for follow, evidence, terrain, save, and search. You retain responsibility for judging sources and claims.' : 'No agent is connected in this browser. The investigation still works as a self-contained demo, and a compatible WebMCP-enabled browser may expose these actions.'}</p><button className="connection-status-close" onClick={() => setConnectionStatusOpen(false)}>Close status</button></div>}
      </header>

      <div className="workspace-grid">
        <section className="main-stage">
          <PatchworkAreaRibbon view={view} savedCount={(saved ? 1 : 0) + savedAgentBriefs.length + savedSignalItems.length} notebookOpen={notebookOpen} onChangeView={changeView} onOpenNotebook={() => { setNotebookOpen(true); setMobileNavOpen(false); setAgentMessage(saved || savedAgentBriefs.length || savedSignalItems.length ? 'Notebook opened: saved findings, signal leads, and agent briefs are ready for review.' : 'Notebook opened. Save a discovery, signal lead, or agent brief to keep a trail here.'); }} />
          <div className={`main-stage-identity identity-view-${view}`} aria-hidden="true"><BranchField /></div>
           {view === 'concept-demo' ? <>
          <div className="story-intro">
             <div className="story-intro-title"><span className="story-dot" /><span>00 · THESIS PROOF OF CONCEPT</span></div>
            <div className="story-intro-body">
              <div className="story-intro-copy">
                <div className="story-intro-text">
                  <strong>A student researcher. A challenge…</strong>
                  <p>To find and map the digital infrastructure enabling online information operations. But a purpose built tool was needed to gather diverse traces and begin to understand the links between cases, platforms, services, datasets, and reporting. This is the first glimpse of a larger WebMCP online observatory project mapping digital phenomena: its direction remains open, and building the instrument is already part of the discovery.</p>
                </div>
                <div className="story-intro-why">
                  <span>WHY THIS EXISTS</span>
                  <strong>The visible post is only the surface.</strong>
                  <p>People usually encounter an information operation as a post, advert, headline, or takedown. This proof of concept helps a researcher trace the less visible services, data, platforms, and infrastructure that may enable it.</p>
                  <div className="webmcp-explainer"><span>WHAT WEBMCP ADDS</span><p>WebMCP gives a researcher and an AI agent the same inspectable surface: search, follow, compare, and retain leads while the researcher keeps the judgement.</p></div>
                </div>
              </div>
               <div className="story-intro-side">
                 <div className="story-intro-example"><span>ONE SIMPLE EXAMPLE</span><div className="problem-chain"><span>public advert</span><i>→</i><span>platform trace</span><i>→</i><span>shared service</span><i>→</i><span>deeper stack</span></div><p>Start with the visible trace, then test whether related services, records, and infrastructure recur around it. A match opens a research lead; it does not settle intent or responsibility.</p><button onClick={() => { changeView('investigations'); setMobileNavOpen(false); announce('Atlas Relay example opened in investigation 01.'); }}>Open the Atlas Relay example <ChevronRight size={15} /></button><div className="story-intro-alt-actions"><span>OR</span><button onClick={() => openHomeSurface('#live-agent-feed', 'Live agent signal desk opened.')}>Watch the live signal desk <Globe2 size={13} /></button><button onClick={() => openHomeSurface('.agent-brief-surface', 'Full search demo opened.')}>Go straight to search <ChevronRight size={13} /></button><button onClick={() => { setNotebookOpen(true); setMobileNavOpen(false); setAgentMessage(saved || savedAgentBriefs.length ? 'Notebook opened: saved findings and agent briefs are ready for review.' : 'Notebook opened. Save a discovery or agent brief to keep a trail here.'); }}>See my saved notebook <Bookmark size={13} /></button></div></div>
              </div>
            </div>
          </div>
          <SignalFeed items={signalFeedEntries} savedIds={savedSignalItems.map((item) => item.id)} active={signalFeedActive} paused={signalFeedPaused} status={signalFeedStatus} onToggleActive={toggleSignalFeed} onSave={saveSignal} onOpenExample={openExample} />
          <AgentBriefSurface onOpenExample={openExample} onOpenCollection={openCollection} onOpenEvidence={openEvidence} onOpenOutputs={() => changeView('outputs')} onSaveBrief={saveAgentBrief} onOpenPresentation={setPresentationSnapshot} agentRequest={agentBriefRequest} onBriefStateChange={handleBriefStateChange} />
          <EvidenceRibbon onOpenExample={openExample} onOpenDatasets={() => changeView('artifacts')} />
          </> : <>
           {isActiveInvestigationView && <>
           <div className="view-switcher" role="tablist" aria-label="Ways to read the active investigation">{(['thread', 'map', 'evidence', 'compare'] as View[]).map((tab) => <button key={tab} className={view === tab ? 'is-active' : ''} onClick={() => changeView(tab)} role="tab" aria-selected={view === tab}>{tab === 'thread' ? 'Followed path' : tab === 'map' ? 'Relationship map' : tab === 'evidence' ? 'Evidence' : 'Compare cases'}</button>)}<button type="button" className="view-switcher-source" onClick={() => changeView('terrain')}><Compass size={13} /> Source ecology</button><span className="view-switcher-hint"><Sparkles size={13} /> one problem, many ways to read it</span></div>
           <div className="stage-heading"><div><div className="eyebrow"><span>INVESTIGATION 01</span><span className="eyebrow-line" /><span>START HERE</span></div><h1>Find what is shared.</h1><p>This investigation helps you test whether a service, platform, or infrastructure layer recurs across different cases. Start with Atlas Relay, follow the path, and inspect what supports the connection.</p></div><div className="stage-heading-actions"><button className={`quiet-button ${evidenceOnly ? 'is-selected' : ''}`} onClick={toggleVerified}><Filter size={15} /> {evidenceOnly ? 'Verified only' : 'Full terrain'}</button><button className="primary-button" onClick={saveDiscovery}><Bookmark size={15} /> {saved ? 'Saved' : 'Save discovery'}</button></div></div>
          <div className="orientation-panel"><div className="orientation-copy"><span className="eyebrow-label">START WITH ONE RELATIONSHIP</span><strong>{followed ? 'The shared layer is now visible.' : 'Trace Atlas Relay across two cases.'}</strong><p>{followed ? 'The path now includes related objects. Inspect what supports each connection, then save the finding.' : 'Northline cohort and Lantern House tell different stories. Atlas Relay is the shared service worth checking across both cases.'}</p><span className="orientation-agent-note">RESEARCH CONCEPTS = ideas to test · RESEARCH ARTIFACTS = sources to inspect</span></div><div className="orientation-steps" aria-label="Guided investigation steps"><button type="button" className={`orientation-step ${selectedId === 'service' ? 'is-active' : ''}`} onClick={() => { changeView('map'); setSelectedId('service'); setMobileNavOpen(false); announce('Atlas Relay clue selected in the relationship map.'); }} aria-label="Choose the Atlas Relay clue"><b>01</b><span>Choose a clue<small>Atlas Relay is selected</small><em>Open Atlas Relay in the map</em></span></button><button type="button" className={`orientation-step ${followed ? 'is-complete' : ''}`} onClick={() => { changeView('thread'); followNode('service'); setMobileNavOpen(false); }} aria-label="Follow the Atlas Relay relationship"><b>02</b><span>Follow it<small>{followed ? 'Path opened' : 'Reveal related objects'}</small><em>Open the followed path</em></span></button><button type="button" className={`orientation-step ${evidenceOpen ? 'is-active' : ''}`} onClick={() => { changeView('evidence'); openEvidence('service'); setMobileNavOpen(false); announce('Atlas Relay evidence opened.'); }} aria-label="Check Atlas Relay evidence"><b>03</b><span>Check evidence<small>{evidenceOpen ? 'Evidence drawer open' : 'Keep uncertainty visible'}</small><em>Inspect the evidence record</em></span></button><button type="button" className={`orientation-step ${saved ? 'is-complete' : ''}`} onClick={() => { saveDiscovery(); setNotebookOpen(true); setMobileNavOpen(false); }} aria-label="Save the current finding"><b>04</b><span>Save a finding<small>{saved ? 'Notebook available' : 'Export the trail'}</small><em>Open saved discovery</em></span></button></div><button className="orientation-cta" onClick={() => { if (followed) { changeView('terrain'); } else { changeView('thread'); followNode('service'); } }}>{followed ? 'Open source layers' : 'Start with Atlas Relay'} <ChevronRight size={15} /></button></div>
          </>}
          <div ref={stageContentRef} className="stage-content">
             {view === 'investigations' ? <InvestigationsView onOpenThread={() => changeView('thread')} onOpenMap={() => changeView('map')} /> : view === 'terrain' ? <TerrainView selectedLayer={selectedTerrainLayer} onFollow={() => followNode('service')} onOpenThread={() => changeView('thread')} onInspect={inspectTerrain} onOpenObject={openEvidence} onOpenExample={openExample} onOpenCollection={openCollection} onOpenAgentSearch={openTerrainAgentSearch} followed={followed} /> : view === 'evidence' ? <EvidenceView selected={selected} edges={edges} onOpen={openEvidence} onFollow={followNode} onOpenThread={() => changeView('thread')} followed={followed} evidenceOnly={evidenceOnly} /> : view === 'compare' ? <CompareView followed={followed} selectedId={selectedId} onFollow={() => { if (!followed) followNode('service'); changeView('thread'); }} onSelectCase={(id) => { setSelectedId(id); announce(`${nodeById(id).label} selected for comparison.`); }} /> : view === 'concepts' ? <CorpusView mode="concepts" selectedId={selectedId} onSelect={setSelectedId} onOpenEvidence={openEvidence} onOpenExample={openExample} onOpenCollection={openCollection} onOpenConcept={openConcept} onOpenStackLayer={openStackLayer} onChangeMode={changeView} /> : view === 'artifacts' ? <CorpusView mode="artifacts" selectedId={selectedId} onSelect={setSelectedId} onOpenEvidence={openEvidence} onOpenExample={openExample} onOpenCollection={openCollection} onOpenConcept={openConcept} onOpenStackLayer={openStackLayer} onChangeMode={changeView} /> : view === 'outputs' ? <PossibleOutputsView onOpenArtifacts={() => changeView('artifacts')} onOpenConcepts={() => changeView('concepts')} onOpenExample={setPossibleOutputExampleCode} /> : view === 'thread' ? <ThreadView selectedId={selectedId} followed={followed} evidenceOnly={evidenceOnly} onSelect={setSelectedId} onFollow={followNode} onOpenEvidence={openEvidence} onToggleVerified={toggleVerified} onChangeView={changeView} /> : <MapView nodes={filteredNodes} edges={filteredEdges} selectedId={selectedId} visibleNodeIds={visibleNodeIds} followed={followed} evidenceOnly={evidenceOnly} onSelect={setSelectedId} onFollow={followNode} onOpenThread={() => changeView('thread')} onOpenEvidence={openEvidence} onToggleVerified={toggleVerified} onOpenStack={() => setStackOpen(true)} onOpenStackLayer={openStackLayer} />}
          </div>
          </>}
        </section>
      </div>

      {evidenceOpen && <EvidenceCardStack selected={selected} cardIds={evidenceCardIds} connected={evidenceStackConnected} lit={evidenceStackLit} followed={followed} onSelectCard={selectEvidenceCard} onClose={() => setEvidenceOpen(false)} onFollow={followNode} onSave={saveDiscovery} />}
      {toast && <output className="toast"><Check size={15} /> {toast}</output>}
      {scrollPromptVisible && <button type="button" className="scroll-prompt" onClick={() => { setScrollPromptVisible(false); window.scrollBy({ top: Math.min(window.innerHeight * 0.72, 520), behavior: 'smooth' }); }} aria-label="Scroll for more content"><ArrowDown size={14} /><span>Scroll for more…</span></button>}
      {saved && <div className="saved-card"><div className="saved-card-top"><span><Bookmark size={14} /> SAVED DISCOVERY</span><button onClick={() => setSaved(false)} aria-label="Dismiss saved discovery"><X size={14} /></button></div><strong>The service beneath the surface</strong><p>7 objects · 4 evidence states · trail preserved</p><button onClick={exportDiscovery}><Download size={14} /> Export Markdown</button></div>}
      {exampleSource && <dialog open className="example-dialog" aria-label={`Source citation for ${exampleSource.title}`}><div className="example-dialog-card"><div className="example-dialog-head"><div><span className="eyebrow-label">SOURCE CITATION · {exampleSource.kind}</span><h2>{exampleSource.title}</h2><p>{exampleSource.provider}</p></div><button className="icon-button" onClick={() => setExampleSourceId(null)} aria-label="Close source citation"><X size={17} /></button></div><p className="example-dialog-intro">{exampleSource.description}</p><div className="source-citation-record"><SourceCitationCard source={exampleSource} /><div className="source-citation-meta"><div><span>PUBLISHER / SOURCE</span><strong>{exampleSource.provider}</strong></div><div><span>COLLECTION TYPE</span><strong>{exampleSource.kind}</strong></div><div><span>ACCESS</span><strong>{exampleSource.access}</strong></div></div><div className="source-citation-stack"><span>STACK POSITION IN THIS DEMO</span><StackLayerPills layers={sourceStackLayers(exampleSource)} /><p>This is the level where this collection helps the researcher look for traces; it is not a claim about who used it.</p></div><div className="source-citation-purpose"><span>WHY IT IS CITED HERE</span><p>{exampleSource.whyIncluded}</p></div><div className="source-citation-link"><span>DIRECT ORIGINAL LINK</span><a href={exampleSource.url} target="_blank" rel="noreferrer">{exampleSource.url} <ExternalLink size={13} /></a></div></div><div className="example-dialog-note"><CircleHelp size={15} /><span>This citation view reproduces no source material. The original source remains authoritative, and every record still needs researcher checking.</span></div><div className="example-dialog-actions"><button className="quiet-button" onClick={() => setExampleSourceId(null)}>Close citation</button><a className="primary-button" href={exampleSource.url} target="_blank" rel="noreferrer">Open original source <ExternalLink size={14} /></a></div></div></dialog>}
      {possibleOutputExample && <PossibleOutputExampleDialog example={possibleOutputExample} onClose={() => setPossibleOutputExampleCode(null)} onOpenArtifacts={() => changeView('artifacts')} />}
      {presentationSnapshot && <AgentPresentationDialog snapshot={presentationSnapshot} onClose={() => setPresentationSnapshot(null)} />}
      {stackOpen && <dialog open className="stack-dialog" aria-label="Giant ecommerce stack explainer"><div className="stack-dialog-card"><div className="stack-dialog-head"><div><span className="eyebrow-label">A TEACHING MODEL</span><h2>What is the giant ecommerce stack?</h2></div><button className="icon-button" onClick={() => setStackOpen(false)} aria-label="Close ecommerce stack explainer"><X size={17} /></button></div><p className="stack-dialog-intro">The stack is an assemblage of ordinary layers, not a single hidden machine. Some are legitimate businesses or public platforms that can be bent to misuse; others may be deliberately opaque, opportunistic, or exploitative. This proof of concept marks possibilities to investigate, not guilt by association.</p><div className="stack-assembly" aria-label="Possible layers of the ecommerce stack"><div className="stack-layer-row"><b>01</b><div><strong>Visible story &amp; reporting</strong><p>Posts, adverts, headlines, takedowns, and public narratives — the small layer most people encounter first.</p></div><span>what becomes visible</span></div><div className="stack-layer-row"><b>02</b><div><strong>Platforms &amp; distribution</strong><p>Social networks, marketplaces, ad delivery, recommendation, and account systems that carry content to people.</p></div><span>ordinary platform, possible misuse</span></div><div className="stack-layer-row"><b>03</b><div><strong>Commercial services</strong><p>Hosting, SaaS, account services, targeting, payment, and other businesses that may support routine work or harmful activity.</p></div><span>legitimate / dual-use</span></div><div className="stack-layer-row"><b>04</b><div><strong>Data &amp; brokerage</strong><p>Datasets, audience segments, identity signals, procurement records, and other material used to find or classify targets.</p></div><span>valuable because it travels</span></div><div className="stack-layer-row"><b>05</b><div><strong>Interfaces &amp; operations</strong><p>Dashboards, templates, automation, invitations, campaign tooling, and workflows that turn access into action.</p></div><span>where coordination happens</span></div><div className="stack-layer-row"><b>06</b><div><strong>Infrastructure</strong><p>Domains, DNS, CDNs, cloud, and other technical rails that can make an operation persistent or harder to see.</p></div><span>deepest visible trace</span></div></div><div className="stack-threshold-note"><Network size={15} /><div><span>THRESHOLDS TO WATCH</span><p>Compromise can happen at the crossings: visibility → distribution, data → targeting, service → operation, and infrastructure → persistence. A source may appear in more than one layer.</p></div></div><div className="stack-dialog-actions"><button className="quiet-button" onClick={() => setStackOpen(false)}>Close explainer</button><button className="primary-button" onClick={() => { setStackOpen(false); changeView('terrain'); }}>Open source layers <ChevronRight size={14} /></button></div></div></dialog>}
      {conceptDetail && <dialog open className="concept-dialog" aria-label={`Research concept: ${conceptDetail.label}`}><div className="concept-dialog-card"><div className="concept-dialog-head"><div><span className="eyebrow-label">RESEARCH CONCEPT · IDEAS TO TEST</span><h2>{conceptDetail.label}</h2></div><button className="icon-button" onClick={() => setConceptDetailLabel(null)} aria-label="Close research concept"><X size={17} /></button></div><div className={`concept-dialog-callout concept-${conceptDetail.accent}`}><strong>{conceptDetail.detail}</strong><p>{conceptDetail.note}</p></div><div className="concept-detail-grid"><div><span>QUESTION TO ASK</span><p>{conceptDetail.question}</p></div><div><span>IN THIS DEMO</span><p>{conceptDetail.example}</p></div><div><span>WHERE TO CONTINUE</span><p>{conceptDetail.next}</p></div><div><span>WHAT IT IS NOT</span><p>A concept gives the investigation a lens. It is not itself a source, a causal explanation, or a finding that can be treated as proven.</p></div></div><div className="concept-dialog-note"><Sparkles size={15} /><span>Use this concept to decide what to inspect next, then move to Research artifacts for the material that can support or challenge it.</span></div><div className="concept-dialog-actions"><button className="quiet-button" onClick={() => setConceptDetailLabel(null)}>Close explanation</button><button className="primary-button" onClick={() => { setConceptDetailLabel(null); changeView('artifacts'); }}>Open research artifacts <ChevronRight size={14} /></button></div></div></dialog>}
      {stackLayerDetail && <dialog open className="stack-layer-dialog" aria-label={`Commercial stack layer: ${stackLayerDetail.layer}`}><div className="stack-layer-dialog-card"><div className="stack-layer-dialog-head"><div><span className="eyebrow-label">COMMERCIAL STACK · LEVEL {stackLayerDetails.findIndex((item) => item.layer === stackLayerDetail.layer) + 1}</span><h2>{stackLayerDetail.layer}</h2></div><button className="icon-button" onClick={() => setStackLayerDetailLabel(null)} aria-label="Close stack layer explanation"><X size={17} /></button></div><div className={`stack-layer-dialog-band stack-learning-${stackLayerDetail.accent}`}><span>WHAT THIS LEVEL CONTAINS</span><strong>{stackLayerDetail.shortLabel}</strong><p>{stackLayerDetail.detail}</p></div><div className="stack-layer-dialog-copy"><div><span>WHY IT MATTERS</span><p>{stackLayerDetail.significance}</p></div><div><span>HOW TO USE IT</span><p>Look for traces at this level, then compare them with the levels above and below. A trace can occupy more than one level, and a match does not establish intent or responsibility.</p></div></div><div className="stack-layer-evidence"><div className="stack-layer-evidence-head"><span>CONNECTED MATERIAL</span><small>{stackLayerNodes.length} demo object{stackLayerNodes.length === 1 ? '' : 's'} · {stackLayerSources.length} external collection{stackLayerSources.length === 1 ? '' : 's'}</small></div>{stackLayerNodes.length > 0 && <div className="stack-layer-evidence-group"><span className="stack-layer-evidence-label">IN THE DEMO</span>{stackLayerNodes.map((node) => <button type="button" className="stack-layer-evidence-row" key={node.id} onClick={() => { setStackLayerDetailLabel(null); openEvidence(node.id); }}><span className={`artifact-icon artifact-${node.accent}`}><NodeIcon kind={node.kind} /></span><span><strong>{node.label}</strong><small>{node.kind} · {node.source} · {node.evidence}</small></span><ChevronRight size={14} /></button>)}</div>}{stackLayerSources.length > 0 && <div className="stack-layer-evidence-group"><span className="stack-layer-evidence-label">REPORTING &amp; DATA COLLECTIONS</span>{stackLayerSources.map((source) => <div className="stack-layer-evidence-row stack-layer-source-row" key={source.id}><span className="stack-source-mark"><Database size={14} /></span><span><strong>{source.title}</strong><small>{source.provider} · {source.kind}</small></span><span className="stack-layer-source-actions"><button type="button" onClick={() => { setStackLayerDetailLabel(null); openCollection(source.id); }}>Profile</button><button type="button" onClick={() => { setStackLayerDetailLabel(null); openExample(source.id); }}>Citation</button><a href={source.url} target="_blank" rel="noreferrer" aria-label={`Open original source for ${source.title}`}><ExternalLink size={13} /></a></span></div>)}</div>}{!stackLayerNodes.length && !stackLayerSources.length && <p className="stack-layer-no-evidence">No linked examples are assigned to this level yet. Use the level as a question for future collection work.</p>}<p className="stack-layer-evidence-note">These examples show where a record can sit in the teaching model. They do not prove that the organisations or services are part of one operation.</p></div><div className="stack-layer-dialog-actions"><button className="quiet-button" onClick={() => setStackLayerDetailLabel(null)}>Close explanation</button><button className="primary-button" onClick={() => { setStackLayerDetailLabel(null); changeView('terrain'); }}>Open source layers <ChevronRight size={14} /></button></div></div></dialog>}
      {collectionSource && collectionProfileData && <dialog open className="collection-dialog" aria-label={`Collection profile for ${collectionSource.title}`}><div className="collection-dialog-card"><div className="collection-dialog-head"><div><span className="eyebrow-label">COLLECTION PROFILE · {collectionSource.kind}</span><h2>{collectionSource.title}</h2><p>{collectionSource.provider}</p></div><button className="icon-button" onClick={() => setCollectionSourceId(null)} aria-label="Close collection profile"><X size={17} /></button></div><div className="collection-dialog-notice"><Database size={15} /><p>Reading guide only: the original source remains authoritative. Hyphosphere has not imported or independently verified every record yet; checking and extending the collection is a joint researcher task.</p></div><div className="collection-profile-grid"><div><span>WHAT IT CONTAINS</span><p>{collectionProfileData.scope}</p></div><div><span>COVERAGE</span><p>{collectionProfileData.dateRange}</p></div><div><span>RECORD SHAPE</span><p>{collectionProfileData.recordShape}</p></div><div><span>WHY IT IS HERE</span><p>{collectionSource.whyIncluded}</p></div><div><span>OBSERVATORY QUESTION</span><p>{collectionProfileData.researchQuestion}</p></div><div><span>LIMITATIONS</span><p>{collectionProfileData.limitations}</p></div></div><div className="collection-stack-section"><span className="eyebrow-label">STACK POSITION IN THIS DEMO</span><StackLayerPills layers={sourceStackLayers(collectionSource)} /><p>The label shows which part of the enabling assemblage this collection helps a researcher inspect. A collection can touch more than one layer.</p></div><div className="collection-dialog-actions"><button className="quiet-button" onClick={() => { setCollectionSourceId(null); openExample(collectionSource.id); }}><FileText size={14} /> Open citation</button><button className="quiet-button" onClick={() => setCollectionSourceId(null)}>Close profile</button><a className="primary-button" href={collectionSource.url} target="_blank" rel="noreferrer">Open original source <ExternalLink size={14} /></a></div></div></dialog>}
      {notebookOpen && (savedAgentBriefs.length > 0 || savedSignalItems.length > 0) ? <AgentBriefNotebookDialog briefs={savedAgentBriefs} signalItems={savedSignalItems} discoverySaved={saved} onClose={() => setNotebookOpen(false)} onCompare={(id) => { setNotebookOpen(false); setCompareBriefId(id); }} /> : notebookOpen && <dialog open id="hyphosphere-notebook" className="notebook-dialog" aria-label="Hyphosphere notebook"><div className="notebook-dialog-card"><div className="notebook-dialog-head"><div><span className="eyebrow-label">NOTEBOOK · SAVED DISCOVERY</span><h2>Your investigation notebook</h2><p>{saved ? 'A compact record of what you followed, what supports it, and what remains open.' : 'A place to keep a finding once you are ready to return to it.'}</p></div><button className="icon-button" onClick={() => setNotebookOpen(false)} aria-label="Close notebook"><X size={17} /></button></div>{saved ? <div className="notebook-content"><div className="notebook-finding"><div className="notebook-finding-top"><span><Bookmark size={14} /> SAVED FINDING</span><span>LOCAL DEMO CORPUS</span></div><h3>The service beneath the surface</h3><p>Atlas Relay appears across the Northline cohort and the Greybox traces dataset. The service connection is supported; the extension to Invite fragment remains inferred.</p></div><div className="notebook-grid"><section className="notebook-section"><span className="drawer-label">INVESTIGATION TRAIL</span><div className="notebook-trail">{['Northline cohort', 'Atlas Relay', 'Greybox traces', 'Invite fragment'].map((label, index) => <div key={label}><span>{(index + 1).toString().padStart(2, '0')}</span><strong>{label}</strong></div>)}</div></section><section className="notebook-section"><span className="drawer-label">EVIDENCE STATES</span><div className="notebook-evidence-list"><div><EvidencePill state="verified" /><span>Greybox recurrence</span></div><div><EvidencePill state="supported" /><span>Northline → Atlas Relay</span></div><div><EvidencePill state="inferred" /><span>Atlas Relay → Invite fragment</span></div><div><EvidencePill state="disputed" /><span>The Long Arc → Quiet Harbor CDN</span></div></div></section></div><div className="notebook-note"><CircleHelp size={15} /><p>Saving preserves the path and its uncertainty; it does not turn an inference into a verified claim. In this proof of concept, the notebook is session-local. Export Markdown to keep a durable copy.</p></div></div> : <div className="notebook-empty"><Bookmark size={28} /><h3>Nothing saved yet.</h3><p>Start with Atlas Relay, follow a relationship, and save the finding when you want to keep the trail for later.</p><button className="primary-button" onClick={() => { setNotebookOpen(false); setSelectedId('service'); changeView('thread'); }}>Start the investigation <ChevronRight size={14} /></button></div>}<div className="notebook-dialog-actions">{saved && <button className="quiet-button" onClick={() => { setNotebookOpen(false); setSelectedId('service'); changeView('thread'); }}>Open followed path <ChevronRight size={14} /></button>}{saved && <button className="primary-button" onClick={exportDiscovery}><Download size={14} /> Export Markdown</button>}<button className="quiet-button" onClick={() => setNotebookOpen(false)}>Close notebook</button></div></div></dialog>}
      {compareBrief && <AgentBriefCompareDialog brief={compareBrief} onClose={() => setCompareBriefId(null)} />}
    </main>
  );
}

function EvidenceCardStack({ selected, cardIds, connected, lit, followed, onSelectCard, onClose, onFollow, onSave }: { selected: ResearchNode; cardIds: string[]; connected: boolean; lit: boolean; followed: boolean; onSelectCard: (id: string) => void; onClose: () => void; onFollow: (id: string) => void; onSave: () => void }) {
  const cards = (cardIds.length ? cardIds : [selected.id]).map(nodeById);
  const visibleCards = cards.slice(-4);
  const statusLabel = lit ? 'CONTINUOUS TRACE' : connected ? 'LINKED · OPEN QUESTION' : 'BUILD THE STACK';
  const statusText = lit ? 'A common service and complete stack positions continue across these cards, so the route lights up.' : connected ? 'The cards continue through the map, but at least one relationship remains uncertain.' : 'Open another connected record to place a new card on top and compare its stack position.';
  const displayNote = cards.length >= 5 ? 'Display limit: the compact stack retains the latest five records and shows four at once. When a new card arrives, the oldest leaves for space—not because it is less important.' : 'Compact display: cards stay in the stack as you inspect them, with the newest card brought to the front.';

  return <dialog open className="evidence-drawer" aria-label="Evidence inspection"><div className="drawer-head"><div><span className="eyebrow-label">WHY IS THIS CONNECTED?</span><h2>{selected.label}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close evidence drawer"><X size={17} /></button></div><section className={`evidence-card-stack ${lit ? 'is-lit' : connected ? 'is-candidate' : ''}`} aria-label="Evidence card stack"><div className="evidence-card-stack-head"><span>EVIDENCE CARD STACK</span><small>{cards.length} retained · latest {visibleCards.length} visible</small></div><div className="evidence-card-stack-cards">{visibleCards.map((card, index) => { const isTop = card.id === selected.id; return <button type="button" key={card.id} className={`evidence-card-peek evidence-card-peek-${card.accent} ${isTop ? 'is-top' : ''}`} style={{ zIndex: index + 1 }} onClick={() => onSelectCard(card.id)} aria-current={isTop ? 'true' : undefined}><span className="evidence-card-peek-index">{(index + 1).toString().padStart(2, '0')}</span><span className="evidence-card-peek-copy"><strong>{card.label}</strong><small>{card.stackLayers.join(' · ')}</small></span><span className="evidence-card-peek-status">{isTop ? 'FRONT' : 'PEEK'}</span></button>; })}</div><div className={`evidence-card-stack-status ${lit ? 'is-lit' : connected ? 'is-candidate' : ''}`}><Sparkles size={14} /><div><span>{statusLabel}</span><p>{statusText}</p></div></div><p className="evidence-card-stack-note">{displayNote} Stack colour and position remain visible beneath the front card. A lit route marks a research lead across the stack; it does not establish one operator or intent.</p></section><div className="drawer-object"><div className={`object-icon object-${selected.accent}`}><NodeIcon kind={selected.kind} /></div><div><span>{selected.kind}</span><strong>{selected.source}</strong></div><EvidencePill state={selected.evidence} /></div><div className="drawer-stack-position"><span className="drawer-label">STACK POSITION</span><StackLayerPills layers={selected.stackLayers} /><p>An actor or artefact can sit across more than one layer. This label locates it in the teaching model; it does not say that the layer caused the operation.</p></div><div className="drawer-section"><span className="drawer-label">BASIS</span><p>{selected.preview} {selected.evidence === 'disputed' ? 'This connection needs inspection before it can carry the investigation forward.' : 'The trail keeps this distinction visible as it expands.'}</p></div><div className="drawer-section"><span className="drawer-label">WHY THIS IS INCLUDED</span><p>{selected.inclusionReason}</p></div><div className="drawer-section"><span className="drawer-label">SUPPORTING MATERIAL</span><div className="source-stack"><div><FileText size={15} /><span>Research object record<strong>{selected.source}</strong></span><span className="source-state">local demo corpus</span></div><div><Clock3 size={15} /><span>Capture context<strong>{selected.subtext}</strong></span><span className="source-state">retained</span></div></div><p className="citation-follow-note">For external evidence, use the linked citations in Research Artifacts or the source index.</p></div><div className="drawer-section"><span className="drawer-label">PROVENANCE NOTE</span><div className="provenance-note"><CircleHelp size={15} /><p>The demo preserves the source's evidence class. Following a path does not promote an inference to verification.</p></div></div><div className="drawer-footer"><button className="quiet-button" onClick={() => { onClose(); if (!followed) onFollow(selected.id); }}><Link2 size={15} /> {followed ? 'Open followed path' : 'Follow this'}</button><button className="primary-button" onClick={onSave}><Bookmark size={15} /> Save discovery</button></div></dialog>;
}

function ThreadView({ selectedId, followed, evidenceOnly, onSelect, onFollow, onOpenEvidence, onToggleVerified, onChangeView }: { selectedId: string; followed: boolean; evidenceOnly: boolean; onSelect: (id: string) => void; onFollow: (id: string) => void; onOpenEvidence: (id: string) => void; onToggleVerified: () => void; onChangeView: (view: View) => void }) {
  const ids = followed ? threadSequence : threadSequence.slice(0, 3);
  const shown = ids.map((id) => nodeById(id)).filter((node) => !evidenceOnly || node.evidence === 'verified');

  return <div className="thread-view"><div className="surface-header"><div><span className="eyebrow-label">THREAD VIEW</span><h2>Read the investigation in order.</h2><p>Follow one research path in sequence: from a visible case, to a shared service, to the records that support or complicate the link. The order is deliberate so uncertainty stays attached to the trail.</p></div><div className="surface-header-meta"><strong>{shown.length.toString().padStart(2, '0')}</strong><span>steps in view</span></div></div><div className="thread-toolbar"><span><span className="live-dot" /> RESEARCH THREAD</span><span>{evidenceOnly ? 'verified steps only' : 'full evidence trail'}</span><button onClick={onToggleVerified} aria-pressed={evidenceOnly}><Eye size={14} /> {evidenceOnly ? 'Show all' : 'Verified only'}</button></div>{followed && <output className="thread-followed-note"><ArrowDown size={15} /><div><strong>Path opened here</strong><p>The path now includes related objects. Read from the top, then open any step to inspect its evidence.</p></div></output>}<div className="thread-path">{shown.map((node, index) => { const previous = shown[index - 1]; const relation = previous ? edges.find((edge) => (edge.from === previous.id && edge.to === node.id) || (edge.to === previous.id && edge.from === node.id)) : undefined; const isSelected = selectedId === node.id; return <div className="thread-step-wrap" key={node.id}>{index > 0 && <div className="thread-connection"><span>{relation?.label ?? 'continues to'}</span><i className={`connection-line connection-${relation?.evidence ?? 'supported'}`} /></div>}<article className={`thread-step ${isSelected ? 'is-selected' : ''}`}><div className="thread-step-index">{(index + 1).toString().padStart(2, '0')}</div><button className="thread-step-card" onClick={() => { onSelect(node.id); onOpenEvidence(node.id); }} aria-label={`Select ${node.label} and inspect its evidence in the investigation thread`}><div className="thread-step-top"><span>{node.kind}</span><EvidencePill state={node.evidence} /></div><strong>{node.label}</strong><span>{node.source} · {node.meta}</span><StackLayerPills layers={node.stackLayers} /><p>{node.preview}</p></button><button className="thread-inspect" onClick={() => onOpenEvidence(node.id)}>Inspect evidence <ChevronRight size={14} /></button></article></div>; })}</div><div className="thread-footer"><div><span className="eyebrow-label">WHAT THIS VIEW IS FOR</span><p>{followed ? 'The path is open. Continue to Source layers to inspect the collections and stack levels beneath the visible cases.' : 'Use the followed path for sequence and provenance; use the Relationship map for branches and recurrences.'}</p></div><button className="follow-button" onClick={() => followed ? onChangeView('terrain') : onFollow(selectedId)}><span className="follow-glyph"><ArrowUpRight size={16} /></span>{followed ? 'Open source layers' : 'Follow this'}<ChevronRight size={16} /></button></div></div>;
}

function MapCanvas({ nodes: visibleNodes, edges: visibleEdges, selectedId, visibleNodeIds, followed, evidenceOnly, onSelect, onFollow, onOpenThread, onOpenEvidence, onToggleVerified, canvasRef }: { nodes: ResearchNode[]; edges: ResearchEdge[]; selectedId: string; visibleNodeIds: Set<string>; followed: boolean; evidenceOnly: boolean; onSelect: (id: string) => void; onFollow: (id: string) => void; onOpenThread: () => void; onOpenEvidence: (id: string) => void; onToggleVerified: () => void; canvasRef?: React.RefObject<HTMLDivElement | null> }) {
  const activeStackLines = followed && !evidenceOnly ? stackLineExamples : [];
  return <div className="map-view"><div className="surface-header"><div><span className="eyebrow-label">MAP VIEW</span><h2>See the relationships at once.</h2><p>See the whole field at once. Cases, services, datasets, reporting, and infrastructure share one map so recurrences and branches are visible before you decide what they mean.</p></div><div className="surface-header-meta"><strong>{visibleNodes.length.toString().padStart(2, '0')}</strong><span>objects visible</span></div></div><div ref={canvasRef} className="research-canvas map-mode"><div className="canvas-toolbar"><span><span className="live-dot" /> ACTIVE TERRAIN</span><span className="toolbar-divider" /><span>{visibleNodes.length} objects / {visibleEdges.length} relationships</span><span className="canvas-toolbar-spacer" /><button onClick={onToggleVerified} aria-pressed={evidenceOnly}><Eye size={14} /> {evidenceOnly ? 'verified layer' : 'all layers'}</button></div><div className="terrain-grid" /><div className="terrain-label terrain-label-a">FIELDWORK / 04</div><div className="terrain-label terrain-label-b">COMMERCIAL LAYER</div><div className="terrain-label terrain-label-c">ARCHIVE EDGE</div><svg className="map-edges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{visibleEdges.map((edge) => { const from = nodeById(edge.from); const to = nodeById(edge.to); const dimmed = !visibleNodeIds.has(edge.from) || !visibleNodeIds.has(edge.to); return <g key={edge.id} className={`edge-group edge-${edge.evidence} ${dimmed ? 'is-dimmed' : ''} ${edge.from === selectedId || edge.to === selectedId ? 'is-connected' : ''}`}><line x1={from.x} y1={from.y} x2={to.x} y2={to.y} /><text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 1.8}>{edge.label}</text></g>; })}{activeStackLines.map((line) => { const hidden = line.nodeIds.some((id) => !visibleNodeIds.has(id)); const points = line.nodeIds.map((id) => { const node = nodeById(id); return `${node.x},${node.y}`; }).join(' '); return <g key={line.id} className={`stack-line stack-line-${line.accent} ${hidden ? 'is-dimmed' : ''}`}><polyline className="stack-line-glow" points={points} /><polyline className="stack-line-core" points={points} /></g>; })}</svg>{visibleNodes.map((node) => { const hidden = !visibleNodeIds.has(node.id); const isSelected = selectedId === node.id; const placement = `${node.x > 60 ? 'card-left' : 'card-right'} ${node.y > 60 ? 'card-up' : 'card-down'}`; return <button key={node.id} className={`research-node node-${node.accent} ${isSelected ? 'is-selected' : ''} ${hidden ? 'is-hidden' : ''}`} style={{ left: `${node.x}%`, top: `${node.y}%` }} onClick={() => onSelect(node.id)} aria-label={`Select ${node.label}`}><span className="node-orbit" /><span className="node-marker"><NodeIcon kind={node.kind} /></span><span className={`node-card ${placement} ${isSelected ? 'is-expanded' : 'is-compact'}`}>{isSelected ? <><span className="node-card-top"><span>{node.kind}</span><EvidencePill state={node.evidence} /></span><strong>{node.label}</strong><small>{node.meta}</small><em>{node.preview}</em></> : <><strong>{node.label}</strong><small>{node.kind}</small></>}</span></button>; })}<div className="canvas-legend"><div><span className="legend-line legend-solid" /> verified</div><div><span className="legend-line legend-light" /> supported</div><div><span className="legend-line legend-dashed" /> inferred</div><div><span className="legend-dot legend-disputed" /> disputed</div></div><div className="canvas-callout"><span className="callout-index">01</span><div><strong>{followed ? 'The pattern extends' : 'Start with the ordinary'}</strong><p>{followed ? 'Atlas Relay appears across multiple source classes.' : 'Select a node, then follow the relationship.'}</p></div><button onClick={() => onOpenEvidence(selectedId)} aria-label="Open evidence"><CircleHelp size={16} /></button></div><div className="canvas-action"><button className="follow-button" onClick={() => followed ? onOpenThread() : onFollow(selectedId)}><span className="follow-glyph"><ArrowUpRight size={16} /></span>{followed ? 'Open followed path' : 'Follow this'}<ChevronRight size={16} /></button><span>leaves judgement with you</span></div></div></div>;
}

function MapView(props: { nodes: ResearchNode[]; edges: ResearchEdge[]; selectedId: string; visibleNodeIds: Set<string>; followed: boolean; evidenceOnly: boolean; onSelect: (id: string) => void; onFollow: (id: string) => void; onOpenThread: () => void; onOpenEvidence: (id: string) => void; onToggleVerified: () => void; onOpenStack: () => void; onOpenStackLayer: (layer: StackLayer) => void }) {
  const selected = nodeById(props.selectedId);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const mapCanvasRef = useRef<HTMLDivElement>(null);
  const inspectorRef = useRef<HTMLElement>(null);
  const previousSelectedRef = useRef(props.selectedId);
  const previousFollowedRef = useRef(props.followed);

  useEffect(() => {
    if (previousSelectedRef.current !== props.selectedId) window.requestAnimationFrame(() => inspectorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    previousSelectedRef.current = props.selectedId;
  }, [props.selectedId]);

  useEffect(() => {
    if (!previousFollowedRef.current && props.followed) window.requestAnimationFrame(() => mapCanvasRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    previousFollowedRef.current = props.followed;
  }, [props.followed]);

  return <div ref={surfaceRef} className="map-surface-shell"><div className="map-explainer"><div className="map-explainer-icon"><Network size={19} /></div><div className="map-explainer-copy"><span className="eyebrow-label">WHAT THIS NETWORK IS SHOWING</span><strong>A visible information operation may occupy only a small layer of a much larger ecommerce stack.</strong><p>Atlas Relay is the connective service being tested here—not the whole operation. The lines show where it touches cases, datasets, platform artefacts, and infrastructure; each relationship keeps its uncertainty.</p></div><div className="map-stack-model" aria-label="From visible public story to buried commercial infrastructure"><span className="map-stack-label">VISIBLE → BURIED</span><button type="button" className="stack-step stack-visible stack-step-button" onClick={() => props.onOpenStackLayer('Visible story / reporting')} aria-label="Open visible story and reporting explanation"><b>01</b><span>Public story / IO</span><ArrowUpRight size={13} /></button><button type="button" className="stack-step stack-service stack-step-button" onClick={() => props.onOpenEvidence('service')} aria-label="Open Atlas Relay service evidence"><b>02</b><span>Shared service / Atlas Relay</span><ArrowUpRight size={13} /></button><button type="button" className="stack-step stack-infrastructure stack-step-button" onClick={props.onOpenStack} aria-label="Open giant ecommerce stack explainer"><b>03</b><span>Giant ecommerce stack</span><ArrowUpRight size={13} /></button></div></div>{props.followed && !props.evidenceOnly && <section className="stack-line-readout" aria-live="polite"><div className="stack-line-readout-head"><span>STACK LINES IDENTIFIED</span><small>2 routes · certainty remains visible</small></div><div className="stack-line-cards">{stackLineExamples.map((line) => <article className={`stack-line-card stack-line-card-${line.accent}`} key={line.id}><div className="stack-line-card-top"><span>{line.number}</span><small>{line.label}</small><em>{line.confidence}</em></div><strong>{line.title}</strong><p>{line.detail}</p></article>)}</div><p className="stack-line-readout-note">The neon route marks material worth following across the stack. It is a research lead, not proof of one operator or intent.</p></section>}<MapCanvas {...props} canvasRef={mapCanvasRef} /><aside ref={inspectorRef} className="map-inspector" aria-live="polite"><span className="eyebrow-label">SELECTED OBJECT</span><div className={`map-inspector-icon object-${selected.accent}`}><NodeIcon kind={selected.kind} /></div><strong>{selected.label}</strong><span>{selected.kind} · {selected.source}</span><div className="map-inspector-stack"><span>STACK POSITION</span><StackLayerPills layers={selected.stackLayers} /></div><EvidencePill state={selected.evidence} /><p>{selected.preview}</p><div className="map-inspector-actions"><button className="quiet-button" onClick={() => props.onOpenEvidence(selected.id)}>Inspect evidence</button><button className="follow-button" onClick={() => props.followed ? props.onOpenThread() : props.onFollow(selected.id)}><span className="follow-glyph"><ArrowUpRight size={14} /></span>{props.followed ? 'Open followed path' : 'Follow this'}</button></div></aside></div>;
}

function CorpusView({ mode, selectedId, onSelect, onOpenEvidence, onOpenExample, onOpenCollection, onOpenConcept, onOpenStackLayer, onChangeMode }: { mode: 'concepts' | 'artifacts'; selectedId: string; onSelect: (id: string) => void; onOpenEvidence: (id: string) => void; onOpenExample: (id: string) => void; onOpenCollection: (id: string) => void; onOpenConcept: (label: string) => void; onOpenStackLayer: (layer: StackLayer) => void; onChangeMode: (mode: 'concepts' | 'artifacts') => void }) {
  const concepts = mode === 'concepts';
  const contentRef = useRef<HTMLDivElement>(null);
  const previousModeRef = useRef(mode);

  useEffect(() => {
    if (previousModeRef.current !== mode) window.requestAnimationFrame(() => contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    previousModeRef.current = mode;
  }, [mode]);

  return (
    <div className="corpus-view">
      <div className="surface-header">
        <div>
          <span className="eyebrow-label">{concepts ? 'RESEARCH CONCEPTS' : 'RESEARCH ARTIFACTS'}</span>
          <h2>{concepts ? 'The ideas that shape the investigation.' : 'The source objects you can inspect.'}</h2>
          <p>{concepts ? 'Concepts are interpretive handles: they help a person recognise a pattern, but they are not evidence by themselves.' : 'Research artifacts are the inspectable source records behind a claim: cases, reports, datasets, platform captures, services, and infrastructure records.'}</p>
        </div>
        <div className="surface-header-meta"><strong>{concepts ? '04' : '07'}</strong><span>{concepts ? 'concept records' : 'artifact records'}</span></div>
      </div>
      {!concepts && <div className="corpus-method-note"><div className="corpus-method-icon"><Database size={15} /></div><div><span className="eyebrow-label">HOW TO READ THIS INDEX</span><p>Each artifact is a source record, not a conclusion. Open one to see its provenance, ecommerce stack position, and reason for inclusion; follow the linked citation when you need the original source.</p></div></div>}
      <div className="corpus-switch"><button className={concepts ? 'is-active' : ''} onClick={() => onChangeMode('concepts')}>Research concepts</button><button className={!concepts ? 'is-active' : ''} onClick={() => onChangeMode('artifacts')}>Research artifacts</button></div>
      {concepts && <ConceptFramingCards />}
      {concepts ? <><div ref={contentRef} className="concept-grid">{conceptRecords.map((record, index) => <button type="button" className={`concept-card concept-${record.accent}`} key={record.label} onClick={() => onOpenConcept(record.label)} aria-label={`Open research concept: ${record.label}`}><div className="concept-index">0{index + 1}</div><div><strong>{record.label}</strong><p>{record.detail}</p><small>{record.note}</small><span className="concept-card-action">Open explanation <ChevronRight size={13} /></span></div></button>)}</div><section className="stack-learning-panel"><div className="stack-learning-copy"><span className="eyebrow-label">THE DEEPER COMMERCIAL STACK</span><h3>What sits below the visible story?</h3><p>An information operation may be highly visible while depending on a much larger assemblage of platforms, services, data, interfaces, and infrastructure. Click a level to see what it can help a researcher ask.</p><div className="stack-learning-note"><CircleHelp size={14} /><span>This is a teaching model for locating traces, not a hierarchy of blame or proof.</span></div></div><div className="stack-learning-visual" aria-label="Interactive commercial stack visual"><div className="stack-learning-axis"><span>VISIBLE SURFACE</span><i /><span>DEEPER ENABLEMENT</span></div><div className="stack-learning-layers">{stackLayerDetails.map((item, index) => <button type="button" className={`stack-learning-layer stack-learning-${item.accent}`} key={item.layer} onClick={() => onOpenStackLayer(item.layer)}><span>{(index + 1).toString().padStart(2, '0')}</span><strong>{item.shortLabel}</strong><small>{item.layer}</small><ChevronRight size={14} /></button>)}</div><span className="stack-learning-hint">Select a level to open its explanation</span></div></section></> : <div ref={contentRef} className="artifact-list">{nodes.map((node) => <button key={node.id} className={`artifact-row ${selectedId === node.id ? 'is-selected' : ''}`} onClick={() => { onSelect(node.id); onOpenEvidence(node.id); }} aria-label={`Open source record for ${node.label}`}><span className={`artifact-icon artifact-${node.accent}`}><NodeIcon kind={node.kind} /></span><span className="artifact-copy"><strong>{node.label}</strong><small>{node.kind} · {node.source}</small><StackLayerPills layers={node.stackLayers} /><p>{node.preview}</p><em>Why included: {node.inclusionReason}</em></span><EvidencePill state={node.evidence} /><ChevronRight size={15} /></button>)}</div>}
      {!concepts && <div className="external-source-shelf"><div className="external-source-shelf-head"><div><span className="eyebrow-label">EXTERNAL SOURCE INDEX · AGENT-READABLE</span><p>These links point to original datasets, databases, and reports. Open a citation to see why it is here, then follow the original source. The same catalogue is available to the agent with URL, access note, tags, and stack levels.</p></div><span>{externalSources.length.toString().padStart(2, '0')} linked sources</span></div><div className="external-source-list">{externalSources.map((source) => <article key={source.id} className="external-source-card"><div><button type="button" className="source-citation-button" onClick={() => onOpenExample(source.id)} aria-label={`Open direct source citation for ${source.title}`}><SourceCitationCard source={source} compact /></button><span>{source.kind}</span><strong>{source.title}</strong><small>{source.provider}</small><StackLayerPills layers={sourceStackLayers(source)} /><p>{source.description}</p><em>Why included: {source.whyIncluded}</em><small>{source.access}</small><div className="external-source-actions"><button className="source-profile-button" onClick={() => onOpenCollection(source.id)}><Database size={13} /> Collection profile</button><button className="source-example-button" onClick={() => onOpenExample(source.id)}><FileText size={13} /> Open citation</button><a className="source-original-link" href={source.url} target="_blank" rel="noreferrer">Open source / download <ExternalLink size={13} /></a></div></div></article>)}</div></div>}
      <div className="corpus-note"><Database size={15} /><span><strong>Working index</strong>{concepts ? ' These concepts explain what the investigation is looking for.' : ' Demo artifacts are deterministic teaching records; external sources are curated link-outs, not live imports.'}</span></div>
    </div>
  );
}

function TerrainView({ selectedLayer, onFollow, onOpenThread, onInspect, onOpenObject, onOpenExample, onOpenCollection, onOpenAgentSearch, followed }: { selectedLayer: TerrainLayer | null; onFollow: () => void; onOpenThread: () => void; onInspect: (label: string) => void; onOpenObject: (id: string) => void; onOpenExample: (id: string) => void; onOpenCollection: (id: string) => void; onOpenAgentSearch: (query: string) => void; followed: boolean }) {
  const detailRef = useRef<HTMLElement>(null);
  const [terrainSearch, setTerrainSearch] = useState('');
  const objects = selectedLayer?.objectIds.map(nodeById) ?? [];
  const sources = selectedLayer?.sourceIds.map((id) => externalSources.find((source) => source.id === id)).filter((source): source is ResearchSource => Boolean(source)) ?? [];
  const matchingTerrainItems = useMemo(() => {
    const terms = terrainSearch.trim().toLowerCase().split(/[^a-z0-9]+/).filter((term) => term.length > 1);
    if (!terms.length) return terrainItems;
    return terrainItems.filter((item) => {
      const relatedObjects = item.objectIds.map(nodeById);
      const relatedSources = item.sourceIds.map((id) => externalSources.find((source) => source.id === id)).filter((source): source is ResearchSource => Boolean(source));
      const searchable = [item.label, item.detail, item.description, item.role, ...relatedObjects.flatMap((node) => [node.label, node.kind, node.source, node.preview, ...node.stackLayers]), ...relatedSources.flatMap((source) => [source.title, source.provider, source.kind, source.description, source.whyIncluded, source.access, ...source.tags, ...sourceStackLayers(source)])].join(' ').toLowerCase();
      return terms.every((term) => searchable.includes(term));
    });
  }, [terrainSearch]);
  const quickSearches = ['reporting', 'datasets', 'platforms', 'services', 'infrastructure'];

  useEffect(() => {
    if (selectedLayer) detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [selectedLayer]);

  return (
    <div className="terrain-view">
      <div className="terrain-view-intro"><div><span className="eyebrow-label">SOURCE TERRAIN</span><h2>See the ecology behind the pattern.</h2><p>Explore the six source layers beneath the visible pattern. Select a layer to see what it contains, why it matters, and which records or collections can extend the investigation.</p></div><div className="terrain-total"><strong>13</strong><span>research objects</span></div></div>
      <section className="terrain-search-panel" aria-label="Live source terrain category search"><div className="terrain-search-head"><div><span className="eyebrow-label">LIVE CATEGORY SEARCH</span><strong>Find a layer, object, or collection.</strong><p>Filter the six source layers, demo objects, and linked collections.</p></div><span className="terrain-search-count" aria-live="polite">{matchingTerrainItems.length.toString().padStart(2, '0')} / 06 layers</span></div><div className="terrain-search-controls"><div className="terrain-search-field"><Search size={15} /><input id="source-terrain-search" value={terrainSearch} onChange={(event) => setTerrainSearch(event.target.value)} placeholder="Try: datasets, reporting, infrastructure…" aria-label="Search source terrain categories, objects, and collections" />{terrainSearch && <button type="button" className="terrain-search-clear" onClick={() => setTerrainSearch('')} aria-label="Clear source terrain search"><X size={13} /></button>}</div><span className="terrain-search-status">{terrainSearch.trim() ? `${matchingTerrainItems.length} matching categor${matchingTerrainItems.length === 1 ? 'y' : 'ies'} · local index` : 'Local index · not a live web fetch'}</span></div><div className="terrain-search-quick" role="group" aria-label="Quick source terrain category searches"><span>TRY A CATEGORY</span>{quickSearches.map((term) => <button type="button" key={term} className={terrainSearch.toLowerCase() === term ? 'is-active' : ''} onClick={() => setTerrainSearch(term)} aria-pressed={terrainSearch.toLowerCase() === term}>{term}</button>)}<button type="button" className="terrain-agent-search-button" onClick={() => onOpenAgentSearch(terrainSearch)}><Sparkles size={12} /> Broader agent search <ChevronRight size={12} /></button></div><p className="terrain-search-note">This local index updates instantly; use broader agent search to cross-check the term against the link-ready source index.</p></section>
      {matchingTerrainItems.length ? <div className="terrain-mosaic">{matchingTerrainItems.map((item) => { const Icon = item.icon; const isSelected = selectedLayer?.label === item.label; return <button type="button" key={item.label} className={`terrain-tile tile-${item.color} ${isSelected ? 'is-selected' : ''}`} onClick={() => onInspect(item.label)} aria-label={`${isSelected ? 'Show' : 'Open'} ${item.label} source layer details below`} aria-pressed={isSelected}><div className="tile-icon"><Icon size={19} /></div><div><span>{item.label}</span><strong>{item.count.toString().padStart(2, '0')}</strong><small>{isSelected ? 'Selected · details below' : item.detail}</small></div><ArrowUpRight size={16} /></button>; })}</div> : <div className="terrain-search-empty"><Search size={16} /><span>No source categories match “{terrainSearch}”. Try a layer name, object, or collection.</span><button type="button" onClick={() => setTerrainSearch('')}>Show all layers</button></div>}
      {selectedLayer ? <section ref={detailRef} className="terrain-layer-detail" aria-live="polite"><div className="terrain-layer-detail-head"><div><span className="eyebrow-label">SELECTED SOURCE LAYER · DETAILS BELOW</span><h3>{selectedLayer.label}</h3><p>{selectedLayer.description}</p></div><div className="terrain-layer-role"><span>WHY IT MATTERS</span><p>{selectedLayer.role}</p></div></div><div className="terrain-layer-detail-grid"><div className="terrain-related-group"><span className="eyebrow-label">IN THIS DEMO</span><div className="terrain-object-list">{objects.map((node) => <button type="button" className="terrain-object-row" key={node.id} onClick={() => onOpenObject(node.id)}><span className={`artifact-icon artifact-${node.accent}`}><NodeIcon kind={node.kind} /></span><span className="terrain-object-copy"><strong>{node.label}</strong><small>{node.kind} · {node.source}</small><StackLayerPills layers={node.stackLayers} /><em>{node.preview}</em></span><span className="terrain-object-action">Inspect evidence <ChevronRight size={13} /></span></button>)}</div></div><div className="terrain-related-group"><span className="eyebrow-label">EXTERNAL STARTING POINTS</span>{sources.length ? <div className="terrain-source-list">{sources.map((source) => <article className="terrain-source-row" key={source.id}><div className="terrain-source-copy"><span>{source.kind}</span><strong>{source.title}</strong><small>{source.provider}</small><StackLayerPills layers={sourceStackLayers(source)} /></div><div className="terrain-source-actions"><button className="source-profile-button" onClick={() => onOpenCollection(source.id)}><Database size={13} /> Profile</button><button className="source-example-button" onClick={() => onOpenExample(source.id)}><FileText size={13} /> Citation</button><a className="source-original-link" href={source.url} target="_blank" rel="noreferrer">Original <ExternalLink size={13} /></a></div></article>)}</div> : <p className="terrain-no-sources">No external citation is linked to this layer yet. Inspect the local record to continue the trail.</p>}</div></div></section> : <div className="terrain-empty-state"><Compass size={16} /><span>Choose a source layer to reveal its related artifacts, explanation, and external starting points.</span></div>}
      <div className="terrain-note"><div className="terrain-note-icon"><Sparkles size={17} /></div><div><span>THE SCENE CHANGED</span><p>{followed ? 'Atlas Relay connects sources that do not usually appear in the same investigation.' : 'Follow Atlas Relay to reveal the platform, dataset, and infrastructure records this teaching path connects.'}</p></div><button onClick={() => followed ? onOpenThread() : onFollow()}>{followed ? 'Open followed path' : 'Follow Atlas Relay'} <ChevronRight size={15} /></button></div>
    </div>
  );
}

function EvidenceView({ selected, edges: allEdges, onOpen, onFollow, onOpenThread, followed, evidenceOnly }: { selected: ResearchNode; edges: ResearchEdge[]; onOpen: (id: string) => void; onFollow: (id: string) => void; onOpenThread: () => void; followed: boolean; evidenceOnly: boolean }) {
  const shown = evidenceOnly ? allEdges.filter((edge) => edge.evidence === 'verified') : allEdges;
  const summaryRef = useRef<HTMLDivElement>(null);
  const previousSelectedRef = useRef(selected.id);

  useEffect(() => {
    if (previousSelectedRef.current !== selected.id) window.requestAnimationFrame(() => summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    previousSelectedRef.current = selected.id;
  }, [selected.id]);

  return <div className="evidence-view"><div className="evidence-view-head"><div><span className="eyebrow-label">EVIDENCE LAYER</span><h2>Keep the distinction visible.</h2><p>This table separates verified, supported, inferred, and disputed relationships. Open a row to inspect its basis, stack position, scale, and time signal.</p></div><div ref={summaryRef} className="evidence-summary" aria-live="polite"><span>current focus</span><strong>{selected.label}</strong><EvidencePill state={selected.evidence} /><button className="quiet-button" onClick={() => followed ? onOpenThread() : onFollow(selected.id)}><Link2 size={14} /> {followed ? 'Open followed path' : 'Follow focus'}</button></div></div><div className="evidence-table"><div className="evidence-table-head"><span>RELATIONSHIP</span><span>STATUS</span><span>BASIS + SCALE / TIME</span><span>ACTIONS</span></div>{shown.map((edge) => { const from = nodeById(edge.from); const to = nodeById(edge.to); const nextId = edge.from === selected.id ? edge.to : edge.from; return <div key={edge.id} className="evidence-row"><span className="evidence-relationship"><strong>{from.label}</strong><small>{edge.label}</small><strong>{to.label}</strong></span><EvidencePill state={edge.evidence} /><span className="evidence-basis"><span>{edge.rationale}</span><RelationshipContext edge={edge} /></span><span className="evidence-row-actions"><button onClick={() => followed ? onOpenThread() : onFollow(nextId)}>{followed ? 'Open path' : 'Follow'} <ChevronRight size={13} /></button><button onClick={() => onOpen(nextId)}>Inspect <CircleHelp size={13} /></button></span></div>; })}</div><div className="evidence-footnote"><CircleHelp size={15} /><span>Scale describes reach (micro/local, meso/regional, or macro/transnational). Time records documented recurrence, expansion, or reconfiguration. Neither alone establishes actor growth, intent, or responsibility.</span></div></div>;
}

function CompareView({ followed, selectedId, onFollow, onSelectCase }: { followed: boolean; selectedId: string; onFollow: () => void; onSelectCase: (id: string) => void }) {
  return <div className="compare-view"><div className="compare-head"><div><span className="eyebrow-label">STRUCTURAL COMPARISON</span><h2>What is shared, and what is not?</h2><p>Place two cases side by side: see what recurs, what differs, and what still needs checking.</p></div><button className="quiet-button" onClick={onFollow}><Link2 size={15} /> {followed ? 'Open followed path' : 'Follow shared layer'}</button></div><div className="compare-grid"><button type="button" className={`case-panel case-a ${selectedId === 'northline' ? 'is-selected' : ''}`} onClick={() => onSelectCase('northline')} aria-label="Select Northline cohort for comparison" aria-pressed={selectedId === 'northline'}><div className="case-panel-top"><span className="case-index">A</span><div><span>CASE 04</span><strong>Northline cohort</strong></div><EvidencePill state="verified" /></div><small className="case-focus-status">{selectedId === 'northline' ? 'Current focus' : 'Select to focus'}</small><p>Repeated onboarding pattern across two regional cases.</p><div className="compare-list"><div><Check size={14} /><span>Atlas Relay<strong>service record</strong></span></div><div><Check size={14} /><span>Greybox traces<strong>11 matching rows</strong></span></div><div className="is-muted"><X size={14} /><span>Invite fragment<strong>not observed directly</strong></span></div></div></button><div className="compare-middle"><span>SHARED</span><div className="shared-pill"><Globe2 size={15} /> Atlas Relay</div><div className="compare-connector" /><span>STRUCTURE</span></div><button type="button" className={`case-panel case-b ${selectedId === 'lantern' ? 'is-selected' : ''}`} onClick={() => onSelectCase('lantern')} aria-label="Select Lantern House for comparison" aria-pressed={selectedId === 'lantern'}><div className="case-panel-top"><span className="case-index">B</span><div><span>CASE 11</span><strong>Lantern House</strong></div><EvidencePill state="supported" /></div><small className="case-focus-status">{selectedId === 'lantern' ? 'Current focus' : 'Select to focus'}</small><p>Similar activity with a different public story.</p><div className="compare-list"><div><Check size={14} /><span>Atlas Relay<strong>visual match</strong></span></div><div><Check size={14} /><span>Invite fragment<strong>earlier occurrence</strong></span></div><div className="is-muted"><X size={14} /><span>Greybox traces<strong>not yet linked</strong></span></div></div></button></div><div className="compare-warning"><CircleHelp size={15} /><span>The shared service is supported across these cases. Whether that relationship signifies coordination remains an open research question.</span></div></div>;
}
