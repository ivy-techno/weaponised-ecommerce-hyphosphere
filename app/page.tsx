'use client';

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
  PanelRight,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Waypoints,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type View = 'thread' | 'map' | 'terrain' | 'evidence' | 'compare' | 'concepts' | 'artifacts';
type EvidenceState = 'verified' | 'supported' | 'inferred' | 'disputed';
type StackLayer = 'Visible story / reporting' | 'Platforms & distribution' | 'Commercial services' | 'Data & brokerage' | 'Interfaces & operations' | 'Infrastructure';

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
  if (source.id === 'meta-cib-pakistan') return ['Platforms & distribution', 'Interfaces & operations'];
  if (source.id === 'graphika-cheap-tricks') return ['Visible story / reporting'];
  if (source.id === 'amazon-copurchase-network') return ['Platforms & distribution', 'Data & brokerage'];
  if (source.id === 'ecommerce-dark-patterns') return ['Commercial services', 'Interfaces & operations'];
  if (source.id === 'disinfodex') return ['Visible story / reporting', 'Platforms & distribution'];
  if (source.id === 'fbi-labor-trafficking-scam-alert') return ['Visible story / reporting', 'Platforms & distribution', 'Interfaces & operations'];
  return ['Commercial services', 'Data & brokerage', 'Interfaces & operations'];
};

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
    label: 'appears in',
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

const conceptRecords = [
  { label: 'Recurrence', detail: 'A layer appears in more than one case.', note: 'Pattern to test, not a conclusion.', accent: 'teal', question: 'Does the same service, identifier, or procedure appear across otherwise different cases?', example: 'Atlas Relay appears in the Northline cohort and in the Lantern House comparison, despite their different public stories.', next: 'Compare cases, datasets, and service records for the same trace.' },
  { label: 'Shared layer', detail: 'An ordinary service or platform sits beneath different public stories.', note: 'The connective proposition in this demo.', accent: 'amber', question: 'What ordinary commercial layer connects stories that look separate at the surface?', example: 'A hosted workflow can be legitimate business infrastructure and still become an important threshold for investigation when it recurs.', next: 'Use the map and Source layers to locate the connective service in the wider stack.' },
  { label: 'Evidence state', detail: 'Verified, supported, inferred, and disputed remain visibly different.', note: 'Uncertainty travels with the relationship.', accent: 'violet', question: 'How strong is this connection, and what kind of material carries it?', example: 'A repeated dataset row may be verified while the leap from that recurrence to coordinated action remains inferred.', next: 'Inspect the evidence drawer and preserve the distinction when saving a finding.' },
  { label: 'Structural comparison', detail: 'Cases can resemble one another without being the same case.', note: 'Similarity is not proof of a shared cause.', accent: 'coral', question: 'What is genuinely shared, and what only looks similar because the public story is incomplete?', example: 'Northline and Lantern House share an apparent service layer, but they do not automatically share an operator, intent, or cause.', next: 'Open Compare to place shared, absent, and unresolved material side by side.' },
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
  { label: 'Commercial services', count: 2, detail: 'service records', color: 'teal', icon: Globe2, description: 'Service records point to ordinary commercial layers that can recur beneath very different public stories.', role: 'The shared service is the small connective layer being tested in this proof of concept.', objectIds: ['service'], sourceIds: ['tactical-tech-influence-industry', 'amazon-copurchase-network'] },
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

function NodeIcon({ kind }: { kind: string }) {
  if (kind === 'DATASET') return <Database size={15} strokeWidth={1.8} />;
  if (kind === 'REPORTING') return <FileText size={15} strokeWidth={1.8} />;
  if (kind === 'COMMERCIAL SERVICE') return <Globe2 size={15} strokeWidth={1.8} />;
  if (kind === 'INFRASTRUCTURE') return <Network size={15} strokeWidth={1.8} />;
  if (kind === 'PLATFORM ARTEFACT') return <Layers2 size={15} strokeWidth={1.8} />;
  return <Target size={15} strokeWidth={1.8} />;
}

function StackLayerPills({ layers }: { layers: StackLayer[] }) {
  return <span className="stack-layer-pills" aria-label={`Ecommerce stack position: ${layers.join(', ')}`}>{layers.map((layer) => <span className="stack-layer-pill" key={layer}>{layer}</span>)}</span>;
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
  const [stackOpen, setStackOpen] = useState(false);
  const [collectionSourceId, setCollectionSourceId] = useState<string | null>(null);
  const [exampleSourceId, setExampleSourceId] = useState<string | null>(null);
  const [notebookOpen, setNotebookOpen] = useState(false);
  const [conceptDetailLabel, setConceptDetailLabel] = useState<string | null>(null);
  const [stackLayerDetailLabel, setStackLayerDetailLabel] = useState<StackLayer | null>(null);
  const [selectedTerrainLabel, setSelectedTerrainLabel] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState('');
  const [agentMessage, setAgentMessage] = useState('');
  const [search, setSearch] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [scrollPromptVisible, setScrollPromptVisible] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const stageContentRef = useRef<HTMLDivElement>(null);
  const previousViewRef = useRef(view);
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
      if (event.key === 'Escape') {
        setExampleSourceId(null);
        setEvidenceOpen(false);
        setStackOpen(false);
        setCollectionSourceId(null);
        setNotebookOpen(false);
        setConceptDetailLabel(null);
        setStackLayerDetailLabel(null);
        setControlsOpen(false);
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  useEffect(() => {
    if (previousViewRef.current !== view) {
      window.requestAnimationFrame(() => stageContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      previousViewRef.current = view;
    }
  }, [view]);

  useEffect(() => {
    const refreshScrollPrompt = () => {
      const documentHeight = document.documentElement.scrollHeight;
      const hasMoreBelow = documentHeight - window.innerHeight > 140;
      const nearTop = window.scrollY < 110;
      const nearBottom = window.scrollY + window.innerHeight >= documentHeight - 70;
      const modalOpen = evidenceOpen || stackOpen || Boolean(collectionSourceId) || Boolean(exampleSourceId) || notebookOpen || Boolean(conceptDetailLabel) || Boolean(stackLayerDetailLabel);
      setScrollPromptVisible(hasMoreBelow && nearTop && !nearBottom && !modalOpen && !mobileNavOpen);
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
  }, [collectionSourceId, conceptDetailLabel, evidenceOpen, exampleSourceId, mobileNavOpen, notebookOpen, stackLayerDetailLabel, stackOpen, view]);

  const selected = nodeById(selectedId);
  const exampleSource = externalSources.find((source) => source.id === exampleSourceId);
  const collectionSource = externalSources.find((source) => source.id === collectionSourceId);
  const collectionProfileData = collectionSource ? collectionProfile(collectionSource) : null;
  const conceptDetail = conceptRecords.find((record) => record.label === conceptDetailLabel);
  const stackLayerDetail = stackLayerDetails.find((record) => record.layer === stackLayerDetailLabel);
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

  const filteredNodes = useMemo(
    () =>
      nodes.filter((node) => {
        const matchesSearch = `${node.label} ${node.kind} ${node.source} ${node.preview} ${node.inclusionReason} ${node.stackLayers.join(' ')}`.toLowerCase().includes(search.toLowerCase());
        const matchesEvidence = !evidenceOnly || node.evidence === 'verified';
        return matchesSearch && matchesEvidence;
      }),
    [evidenceOnly, search],
  );

  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return { nodes: [], sources: [] };
    return {
      nodes: nodes.filter((node) => `${node.label} ${node.kind} ${node.source} ${node.preview} ${node.inclusionReason} ${node.stackLayers.join(' ')}`.toLowerCase().includes(query)).slice(0, 4),
      sources: externalSources.filter((source) => `${source.title} ${source.provider} ${source.kind} ${source.description} ${source.whyIncluded} ${source.tags.join(' ')} ${sourceStackLayers(source).join(' ')}`.toLowerCase().includes(query)).slice(0, 5),
    };
  }, [search]);

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

  const openExample = useCallback((sourceId: string) => {
    const source = externalSources.find((item) => item.id === sourceId);
    if (!source) return;
    setExampleSourceId(sourceId);
    setAgentMessage(`Example preview opened for ${source.title}.`);
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
    if (action === 'search_research') {
      const query = typeof input.query === 'string' ? input.query.trim() : '';
      const normalizedQuery = query.toLowerCase();
      const matchingNodes = nodes.filter((node) => `${node.label} ${node.kind} ${node.source} ${node.preview} ${node.inclusionReason} ${node.stackLayers.join(' ')}`.toLowerCase().includes(normalizedQuery));
      const matchingSources = externalSources.filter((source) => `${source.title} ${source.provider} ${source.kind} ${source.description} ${source.whyIncluded} ${source.tags.join(' ')} ${sourceStackLayers(source).join(' ')}`.toLowerCase().includes(normalizedQuery));
      setSearch(query);
      return { ok: true, action, query, objects: matchingNodes.map((node) => ({ id: node.id, label: node.label, kind: node.kind, source: node.source })), externalSources: matchingSources.map((source) => ({ id: source.id, title: source.title, provider: source.provider, url: source.url })) };
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
    modelContext.registerTool({ name: 'search_research', description: 'Search local research objects and the curated external source index, returning original links for external datasets and reports.', inputSchema: { type: 'object', properties: { query: { type: 'string', description: 'A research term, dataset name, provider, or source type.' } }, required: ['query'] } }, (input) => runAgentAction('search_research', input));
  }, [runAgentAction]);

  const changeView = (nextView: View) => {
    setView(nextView);
    setEvidenceOpen(false);
    setStackOpen(false);
    setCollectionSourceId(null);
    setExampleSourceId(null);
    setNotebookOpen(false);
    setConceptDetailLabel(null);
    setStackLayerDetailLabel(null);
    setMobileNavOpen(false);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup"><AppMark /><div><div className="brand-name">hyphosphere</div></div></div>
        <div className="topbar-center"><div className="command-search-wrap"><div className="command-search"><Search size={16} /><input ref={searchInputRef} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search objects and sources" aria-label="Search research objects and external sources" /><span className="keycap">⌘ K</span></div>{search.trim() && <div className="search-results" aria-label="Research search results"><div className="search-results-heading">RESEARCH INDEX · LOCAL + EXTERNAL</div>{searchResults.nodes.map((node) => <button key={node.id} className="search-result-row" onClick={() => { setSelectedId(node.id); setView('map'); setSearch(''); announce(`${node.label} selected in the relationship map.`); }}><span className="search-result-kind">OBJECT</span><span className="search-result-copy"><strong>{node.label}</strong><small>{node.kind} · {node.source}</small></span><ChevronRight size={14} /></button>)}{searchResults.sources.map((source) => <div key={source.id} className="search-result-row search-result-source"><span className="search-result-kind search-result-kind-source">SOURCE</span><span className="search-result-copy"><strong>{source.title}</strong><small>{source.provider} · {source.kind}</small></span><span className="search-result-actions"><button className="search-inspect-button" onClick={() => { openCollection(source.id); setSearch(''); }}>Profile</button><button className="search-preview-button" onClick={() => { openExample(source.id); setSearch(''); }}>Example</button><a className="search-open-link" href={source.url} target="_blank" rel="noreferrer" aria-label={`Open original source for ${source.title}`}><ExternalLink size={14} /></a></span></div>)}{!searchResults.nodes.length && !searchResults.sources.length && <div className="search-empty">No matching objects or sources. Try “troll,” “procurement,” “OCCRP,” or “ecommerce.”</div>}</div>}</div></div>
        <div className="topbar-actions"><span className={`connection-dot ${webmcpReady ? 'is-ready' : ''}`} title={webmcpReady ? 'WebMCP ready' : 'WebMCP awaiting compatible browser'} /><button className={`topbar-status agent-status-link ${webmcpReady ? 'is-ready' : ''}`} onClick={() => setControlsOpen(true)} aria-expanded={controlsOpen} aria-label="Open human and agent connection status">{webmcpReady ? 'agent link ready' : 'local corpus'}</button><div className="controls-wrap"><button className="avatar-button" onClick={() => setControlsOpen((open) => !open)} aria-expanded={controlsOpen} aria-label="Open Hyphosphere controls"><Compass size={15} /></button>{controlsOpen && <div className="controls-popover" aria-live="polite"><span>HYPHOSPHERE CONTROLS</span><strong>{webmcpReady ? 'WebMCP connection ready' : 'Deterministic corpus active'}</strong><p>{webmcpReady ? 'An agent can use the same follow, evidence, terrain, save, and search actions shown here. You remain responsible for interpreting what the evidence means.' : 'This view is self-contained. A compatible WebMCP-enabled browser may expose the site controls to an agent, while you retain the evidentiary judgement.'}</p><button onClick={() => { setControlsOpen(false); announce('Controls closed. Your investigation remains in focus.'); }}>Close</button></div>}</div></div>
        <button className="mobile-menu" onClick={() => setMobileNavOpen((open) => !open)} aria-label="Toggle navigation"><PanelRight size={18} /></button>
      </header>

      <div className="workspace-grid">
        <aside className={`sidebar ${mobileNavOpen ? 'is-open' : ''}`}>
          <div className="sidebar-scroll">
            <div className="sidebar-heading">SURFACES</div>
            <nav className="view-nav" aria-label="Research surfaces">
              <button className={view === 'thread' ? 'is-active' : ''} onClick={() => changeView('thread')}><Waypoints size={16} /> <span>Followed path</span><small>01</small></button>
              <button className={view === 'map' ? 'is-active' : ''} onClick={() => changeView('map')}><Map size={16} /> <span>Relationship map</span><small>02</small></button>
              <button className={view === 'terrain' ? 'is-active' : ''} onClick={() => changeView('terrain')}><Compass size={16} /> <span>Source layers</span><small>03</small></button>
              <button className={view === 'evidence' ? 'is-active' : ''} onClick={() => changeView('evidence')}><ShieldCheck size={16} /> <span>Evidence</span><small>04</small></button>
              <button className={view === 'compare' ? 'is-active' : ''} onClick={() => changeView('compare')}><GitBranch size={16} /> <span>Compare</span><small>05</small></button>
            </nav>
            <div className="sidebar-divider" /><div className="sidebar-heading">REPOSITORY</div>
            <nav className="view-nav corpus-nav" aria-label="Research repository">
              <button className={view === 'concepts' ? 'is-active' : ''} onClick={() => changeView('concepts')}><Sparkles size={16} /> <span>Research concepts</span><small>04</small></button>
              <button className={view === 'artifacts' ? 'is-active' : ''} onClick={() => changeView('artifacts')}><Archive size={16} /> <span>Research artifacts</span><small>07</small></button>
            </nav>
            <div className="sidebar-divider" /><div className="sidebar-heading">INVESTIGATIONS</div>
            <div className="investigation-list"><button className="investigation-item is-current" onClick={() => changeView('thread')} aria-label="Open investigation: A service beneath"><span className="mini-spark" /><span><strong>A service beneath</strong><small>active · 7 objects</small></span></button><button className="investigation-item" onClick={() => { changeView('thread'); announce('Unfinished threads are a preview of future paths. The current thread shows the available route; a larger observatory could resume those saved paths here.'); }} aria-label="Open unfinished threads"><span className="mini-ring" /><span><strong>Unfinished threads</strong><small>teaser · 2 future paths</small></span></button></div>
            <div className="sidebar-divider" /><div className="sidebar-heading">NOTEBOOK</div>
            <button className="notebook-link" onClick={() => { setNotebookOpen(true); setMobileNavOpen(false); setAgentMessage(saved ? 'Notebook opened: your saved discovery is ready for review.' : 'Notebook opened. Save a discovery to keep a trail here.'); }} aria-expanded={notebookOpen} aria-controls="hyphosphere-notebook"><Bookmark size={15} /> <span>Saved discoveries</span><small>{saved ? '01' : '00'}</small></button><button className="notebook-link" onClick={() => { changeView('terrain'); announce('Source ecology opened. Choose a layer to inspect its artifacts and external sources.'); }}><Archive size={15} /> <span>Source shelf</span><small>12</small></button>
          </div>
          <div className="sidebar-footer"><div className="demo-label"><span className="demo-dot" /> DEMO CORPUS</div><p>Deterministic material for a guided investigation.</p><button className="agent-brief" onClick={() => setControlsOpen(true)} aria-label="Open human and agent connection status"><span>HUMAN + AGENT</span><p>You choose what to follow. An agent can operate the same terrain controls and surface evidence; you decide what counts.</p><small>Open connection status →</small></button></div>
        </aside>

        <section className="main-stage">
          <div className="story-intro"><div className="story-intro-kicker"><span className="story-dot" /><span>THESIS PROOF OF CONCEPT</span></div><div className="story-intro-text"><strong>A student researcher. A challenge…</strong><p>To find and map the digital infrastructure enabling online information operations. But a purpose built tool was needed to gather diverse traces and begin to understand the links between cases, platforms, services, datasets, and reporting. This is the first glimpse of a larger WebMCP online observatory project mapping digital phenomena: its direction remains open, and building the instrument is already part of the discovery.</p></div><div className="story-intro-role"><span>YOUR ROLE</span><strong>Choose a clue → follow the link → check the evidence</strong><small>Build the instrument while the inquiry takes shape.</small></div></div>
          <div className="problem-framing"><div className="problem-framing-copy"><span className="eyebrow-label">WHY THIS EXISTS</span><strong>The visible post is only the surface.</strong><p>Influence operations are often encountered as posts, adverts, or takedowns. The harder question is what sits behind them: the services, data, platforms, and infrastructure that make a visible moment possible.</p><div className="webmcp-explainer"><span>WHAT WEBMCP ADDS</span><p>It lets a researcher and an AI agent work through the same evidence surface—searching, following relationships, and inspecting sources—while the researcher keeps the judgement.</p></div></div><div className="problem-framing-example"><span>ONE SIMPLE EXAMPLE</span><div className="problem-chain"><span>public advert</span><i>→</i><span>platform trace</span><i>→</i><span>shared service</span><i>→</i><span>deeper stack</span></div><p>Hyphosphere helps a researcher gather those traces and test the links without turning a pattern into proof.</p><button onClick={() => { setView('thread'); openEvidence('service'); setMobileNavOpen(false); announce('Atlas Relay example opened. The evidence drawer is now visible.'); }}>Open the Atlas Relay example <ChevronRight size={15} /></button></div></div>
          <div className="stage-heading"><div><div className="eyebrow"><span>INVESTIGATION 01</span><span className="eyebrow-line" /><span>START HERE</span></div><h1>Find what is shared.</h1><p>Hyphosphere helps you test whether the same service, platform, or infrastructure appears across different cases. Start with Atlas Relay, follow the relationship, and inspect what supports it.</p></div><div className="stage-heading-actions"><button className={`quiet-button ${evidenceOnly ? 'is-selected' : ''}`} onClick={toggleVerified}><Filter size={15} /> {evidenceOnly ? 'Verified only' : 'Full terrain'}</button><button className="primary-button" onClick={saveDiscovery}><Bookmark size={15} /> {saved ? 'Saved' : 'Save discovery'}</button></div></div>
          <div className="orientation-panel"><div className="orientation-copy"><span className="eyebrow-label">START WITH ONE RELATIONSHIP</span><strong>{followed ? 'The shared layer is now visible.' : 'Trace Atlas Relay across two cases.'}</strong><p>{followed ? 'Atlas Relay has revealed two more objects. Check what supports each connection before you save the finding.' : 'Northline cohort and Lantern House tell different stories. Atlas Relay is the ordinary layer worth testing between them.'}</p><span className="orientation-agent-note">RESEARCH CONCEPTS = ideas to test · RESEARCH ARTIFACTS = sources to inspect</span></div><div className="orientation-steps"><div><b>01</b><span>Choose a clue<small>Atlas Relay is selected</small></span></div><div><b>02</b><span>Follow it<small>Reveal related objects</small></span></div><div><b>03</b><span>Check evidence<small>Keep uncertainty visible</small></span></div><div><b>04</b><span>Save a finding<small>Export the trail</small></span></div></div><button className="orientation-cta" onClick={() => { if (followed) { changeView('terrain'); } else { changeView('thread'); followNode('service'); } }}>{followed ? 'Open source layers' : 'Start with Atlas Relay'} <ChevronRight size={15} /></button></div>
          <div className="view-switcher" role="tablist" aria-label="Investigation views">{(['thread', 'map', 'terrain', 'evidence', 'compare'] as View[]).map((tab) => <button key={tab} className={view === tab ? 'is-active' : ''} onClick={() => changeView(tab)} role="tab" aria-selected={view === tab}>{tab === 'thread' ? 'Followed path' : tab === 'map' ? 'Relationship map' : tab === 'terrain' ? 'Source layers' : tab === 'evidence' ? 'Evidence' : 'Compare'}</button>)}<span className="view-switcher-hint"><Sparkles size={13} /> one investigation, many ways to see it</span></div>
          <div ref={stageContentRef} className="stage-content">
             {view === 'terrain' ? <TerrainView selectedLayer={selectedTerrainLayer} onFollow={() => followNode('service')} onOpenThread={() => changeView('thread')} onInspect={inspectTerrain} onOpenObject={openEvidence} onOpenExample={openExample} onOpenCollection={openCollection} followed={followed} /> : view === 'evidence' ? <EvidenceView selected={selected} edges={edges} onOpen={openEvidence} onFollow={followNode} onOpenThread={() => changeView('thread')} followed={followed} evidenceOnly={evidenceOnly} /> : view === 'compare' ? <CompareView followed={followed} selectedId={selectedId} onFollow={() => { if (!followed) followNode('service'); changeView('thread'); }} onSelectCase={(id) => { setSelectedId(id); announce(`${nodeById(id).label} selected for comparison.`); }} /> : view === 'concepts' ? <CorpusView mode="concepts" selectedId={selectedId} onSelect={setSelectedId} onOpenEvidence={openEvidence} onOpenExample={openExample} onOpenCollection={openCollection} onOpenConcept={openConcept} onOpenStackLayer={openStackLayer} onChangeMode={changeView} /> : view === 'artifacts' ? <CorpusView mode="artifacts" selectedId={selectedId} onSelect={setSelectedId} onOpenEvidence={openEvidence} onOpenExample={openExample} onOpenCollection={openCollection} onOpenConcept={openConcept} onOpenStackLayer={openStackLayer} onChangeMode={changeView} /> : view === 'thread' ? <ThreadView selectedId={selectedId} followed={followed} evidenceOnly={evidenceOnly} onSelect={setSelectedId} onFollow={followNode} onOpenEvidence={openEvidence} onToggleVerified={toggleVerified} onChangeView={changeView} /> : <MapView nodes={filteredNodes} edges={filteredEdges} selectedId={selectedId} visibleNodeIds={visibleNodeIds} followed={followed} evidenceOnly={evidenceOnly} onSelect={setSelectedId} onFollow={followNode} onOpenThread={() => changeView('thread')} onOpenEvidence={openEvidence} onToggleVerified={toggleVerified} onOpenStack={() => setStackOpen(true)} onOpenStackLayer={openStackLayer} />}
            <aside className="trail-panel"><div className="panel-overline"><span>INVESTIGATION TRAIL</span><span className="trail-count">{trail.length.toString().padStart(2, '0')}</span></div><div className="trail-line" /><div className="trail-items">{trail.map((item, index) => <div key={`${item.label}-${index}`} className={`trail-item ${item.active ? 'is-active' : ''}`}><span className="trail-node" /><div><strong>{item.label}</strong><small>{item.detail}</small></div><time>{item.time}</time></div>)}</div><div className="trail-next"><div className="next-kicker"><ArrowUpRight size={13} /><span>POSSIBLE NEXT DIRECTION</span></div><p>{followed ? 'Compare the cases around this shared service.' : 'Follow the selected relationship to reveal what is next.'}</p><button onClick={() => followed ? changeView('compare') : followNode(selectedId)}>{followed ? 'Compare cases' : 'Follow this'} <ChevronRight size={15} /></button></div><button className="agent-note" onClick={() => setControlsOpen(true)} aria-label="Open human and agent connection status"><span className="agent-note-heading"><span className="agent-pulse" /> AGENT EXTENSION</span><p>{agentMessage || 'An agent can extend the path through structured tools while you keep the evidentiary judgement.'}</p><small>Open connection status →</small></button></aside>
          </div>
        </section>
      </div>

      {evidenceOpen && <dialog open className="evidence-drawer" aria-label="Evidence inspection"><div className="drawer-head"><div><span className="eyebrow-label">WHY IS THIS CONNECTED?</span><h2>{selected.label}</h2></div><button className="icon-button" onClick={() => setEvidenceOpen(false)} aria-label="Close evidence drawer"><X size={17} /></button></div><div className="drawer-object"><div className={`object-icon object-${selected.accent}`}><NodeIcon kind={selected.kind} /></div><div><span>{selected.kind}</span><strong>{selected.source}</strong></div><EvidencePill state={selected.evidence} /></div><div className="drawer-stack-position"><span className="drawer-label">STACK POSITION</span><StackLayerPills layers={selected.stackLayers} /><p>The same actor or artefact can sit across more than one layer. This label describes where it appears in the teaching model; it is not a claim that the layer caused the operation.</p></div><div className="drawer-section"><span className="drawer-label">BASIS</span><p>{selected.preview} {selected.evidence === 'disputed' ? 'This connection needs inspection before it can carry the investigation forward.' : 'The trail keeps this distinction visible as it expands.'}</p></div><div className="drawer-section"><span className="drawer-label">WHY THIS IS INCLUDED</span><p>{selected.inclusionReason}</p></div><div className="drawer-section"><span className="drawer-label">SUPPORTING MATERIAL</span><div className="source-stack"><div><FileText size={15} /><span>Research object preview<strong>{selected.source}</strong></span><span className="source-state">local corpus</span></div><div><Clock3 size={15} /><span>Capture context<strong>{selected.subtext}</strong></span><span className="source-state">retained</span></div></div></div><div className="drawer-section"><span className="drawer-label">PROVENANCE NOTE</span><div className="provenance-note"><CircleHelp size={15} /><p>Evidence class is preserved from the demo corpus. Inference is not promoted to verification by following the path.</p></div></div><div className="drawer-footer"><button className="quiet-button" onClick={() => { setEvidenceOpen(false); if (!followed) followNode(selected.id); changeView('thread'); }}><Link2 size={15} /> {followed ? 'Open followed path' : 'Follow this'}</button><button className="primary-button" onClick={saveDiscovery}><Bookmark size={15} /> Save discovery</button></div></dialog>}
      {toast && <output className="toast"><Check size={15} /> {toast}</output>}
      {scrollPromptVisible && <button type="button" className="scroll-prompt" onClick={() => { setScrollPromptVisible(false); window.scrollBy({ top: Math.min(window.innerHeight * 0.72, 520), behavior: 'smooth' }); }} aria-label="Scroll for more content"><ArrowDown size={14} /><span>Scroll for more…</span></button>}
      {saved && <div className="saved-card"><div className="saved-card-top"><span><Bookmark size={14} /> SAVED DISCOVERY</span><button onClick={() => setSaved(false)} aria-label="Dismiss saved discovery"><X size={14} /></button></div><strong>The service beneath the surface</strong><p>7 objects · 4 evidence states · trail preserved</p><button onClick={exportDiscovery}><Download size={14} /> Export Markdown</button></div>}
      {exampleSource && <dialog open className="example-dialog" aria-label={`Example preview for ${exampleSource.title}`}><div className="example-dialog-card"><div className="example-dialog-head"><div><span className="eyebrow-label">EXAMPLE PREVIEW · {exampleSource.kind}</span><h2>{exampleSource.title}</h2></div><button className="icon-button" onClick={() => setExampleSourceId(null)} aria-label="Close example preview"><X size={17} /></button></div><p className="example-dialog-intro">{exampleSource.description}</p><div className={`example-artifact example-${exampleSource.example.accent}`}><div className="example-artifact-top"><span>{exampleSource.example.label}</span><span>EXPLANATORY MOCK-UP</span></div><strong>{exampleSource.example.title}</strong><p>{exampleSource.example.text}</p><div className="example-fields">{exampleSource.example.fields.map((field) => <div key={field.label}><span>{field.label}</span><strong>{field.value}</strong></div>)}</div></div><div className="example-dialog-note"><CircleHelp size={15} /><span>{exampleSource.example.note}</span></div><div className="example-dialog-actions"><button className="quiet-button" onClick={() => setExampleSourceId(null)}>Close preview</button><a className="primary-button" href={exampleSource.url} target="_blank" rel="noreferrer">Open original source <ExternalLink size={14} /></a></div></div></dialog>}
      {stackOpen && <dialog open className="stack-dialog" aria-label="Giant ecommerce stack explainer"><div className="stack-dialog-card"><div className="stack-dialog-head"><div><span className="eyebrow-label">A TEACHING MODEL</span><h2>What is the giant ecommerce stack?</h2></div><button className="icon-button" onClick={() => setStackOpen(false)} aria-label="Close ecommerce stack explainer"><X size={17} /></button></div><p className="stack-dialog-intro">The stack is an assemblage of ordinary layers, not a single hidden machine. Some are legitimate businesses or public platforms that can be bent to misuse; others may be deliberately opaque, opportunistic, or exploitative. This proof of concept marks possibilities to investigate, not guilt by association.</p><div className="stack-assembly" aria-label="Possible layers of the ecommerce stack"><div className="stack-layer-row"><b>01</b><div><strong>Visible story &amp; reporting</strong><p>Posts, adverts, headlines, takedowns, and public narratives — the small layer most people encounter first.</p></div><span>what becomes visible</span></div><div className="stack-layer-row"><b>02</b><div><strong>Platforms &amp; distribution</strong><p>Social networks, marketplaces, ad delivery, recommendation, and account systems that carry content to people.</p></div><span>ordinary platform, possible misuse</span></div><div className="stack-layer-row"><b>03</b><div><strong>Commercial services</strong><p>Hosting, SaaS, account services, targeting, payment, and other businesses that may support routine work or harmful activity.</p></div><span>legitimate / dual-use</span></div><div className="stack-layer-row"><b>04</b><div><strong>Data &amp; brokerage</strong><p>Datasets, audience segments, identity signals, procurement records, and other material used to find or classify targets.</p></div><span>valuable because it travels</span></div><div className="stack-layer-row"><b>05</b><div><strong>Interfaces &amp; operations</strong><p>Dashboards, templates, automation, invitations, campaign tooling, and workflows that turn access into action.</p></div><span>where coordination happens</span></div><div className="stack-layer-row"><b>06</b><div><strong>Infrastructure</strong><p>Domains, DNS, CDNs, cloud, and other technical rails that can make an operation persistent or harder to see.</p></div><span>deepest visible trace</span></div></div><div className="stack-threshold-note"><Network size={15} /><div><span>THRESHOLDS TO WATCH</span><p>Compromise can happen at the crossings: visibility → distribution, data → targeting, service → operation, and infrastructure → persistence. A source may appear in more than one layer.</p></div></div><div className="stack-dialog-actions"><button className="quiet-button" onClick={() => setStackOpen(false)}>Close explainer</button><button className="primary-button" onClick={() => { setStackOpen(false); changeView('terrain'); }}>Open source layers <ChevronRight size={14} /></button></div></div></dialog>}
      {conceptDetail && <dialog open className="concept-dialog" aria-label={`Research concept: ${conceptDetail.label}`}><div className="concept-dialog-card"><div className="concept-dialog-head"><div><span className="eyebrow-label">RESEARCH CONCEPT · IDEAS TO TEST</span><h2>{conceptDetail.label}</h2></div><button className="icon-button" onClick={() => setConceptDetailLabel(null)} aria-label="Close research concept"><X size={17} /></button></div><div className={`concept-dialog-callout concept-${conceptDetail.accent}`}><strong>{conceptDetail.detail}</strong><p>{conceptDetail.note}</p></div><div className="concept-detail-grid"><div><span>QUESTION TO ASK</span><p>{conceptDetail.question}</p></div><div><span>IN THIS DEMO</span><p>{conceptDetail.example}</p></div><div><span>WHERE TO CONTINUE</span><p>{conceptDetail.next}</p></div><div><span>WHAT IT IS NOT</span><p>A concept gives the investigation a lens. It is not itself a source, a causal explanation, or a finding that can be treated as proven.</p></div></div><div className="concept-dialog-note"><Sparkles size={15} /><span>Use this concept to decide what to inspect next, then move to Research artifacts for the material that can support or challenge it.</span></div><div className="concept-dialog-actions"><button className="quiet-button" onClick={() => setConceptDetailLabel(null)}>Close explanation</button><button className="primary-button" onClick={() => { setConceptDetailLabel(null); changeView('artifacts'); }}>Open research artifacts <ChevronRight size={14} /></button></div></div></dialog>}
      {stackLayerDetail && <dialog open className="stack-layer-dialog" aria-label={`Commercial stack layer: ${stackLayerDetail.layer}`}><div className="stack-layer-dialog-card"><div className="stack-layer-dialog-head"><div><span className="eyebrow-label">COMMERCIAL STACK · LEVEL {stackLayerDetails.findIndex((item) => item.layer === stackLayerDetail.layer) + 1}</span><h2>{stackLayerDetail.layer}</h2></div><button className="icon-button" onClick={() => setStackLayerDetailLabel(null)} aria-label="Close stack layer explanation"><X size={17} /></button></div><div className={`stack-layer-dialog-band stack-learning-${stackLayerDetail.accent}`}><span>WHAT THIS LEVEL CONTAINS</span><strong>{stackLayerDetail.shortLabel}</strong><p>{stackLayerDetail.detail}</p></div><div className="stack-layer-dialog-copy"><div><span>WHY IT MATTERS</span><p>{stackLayerDetail.significance}</p></div><div><span>HOW TO USE IT</span><p>Look for traces at this level, then compare them with the levels above and below. A trace can occupy more than one level, and a match does not establish intent or responsibility.</p></div></div><div className="stack-layer-evidence"><div className="stack-layer-evidence-head"><span>CONNECTED MATERIAL</span><small>{stackLayerNodes.length} demo object{stackLayerNodes.length === 1 ? '' : 's'} · {stackLayerSources.length} external collection{stackLayerSources.length === 1 ? '' : 's'}</small></div>{stackLayerNodes.length > 0 && <div className="stack-layer-evidence-group"><span className="stack-layer-evidence-label">IN THE DEMO</span>{stackLayerNodes.map((node) => <button type="button" className="stack-layer-evidence-row" key={node.id} onClick={() => { setStackLayerDetailLabel(null); openEvidence(node.id); }}><span className={`artifact-icon artifact-${node.accent}`}><NodeIcon kind={node.kind} /></span><span><strong>{node.label}</strong><small>{node.kind} · {node.source} · {node.evidence}</small></span><ChevronRight size={14} /></button>)}</div>}{stackLayerSources.length > 0 && <div className="stack-layer-evidence-group"><span className="stack-layer-evidence-label">REPORTING &amp; DATA COLLECTIONS</span>{stackLayerSources.map((source) => <div className="stack-layer-evidence-row stack-layer-source-row" key={source.id}><span className="stack-source-mark"><Database size={14} /></span><span><strong>{source.title}</strong><small>{source.provider} · {source.kind}</small></span><span className="stack-layer-source-actions"><button type="button" onClick={() => { setStackLayerDetailLabel(null); openCollection(source.id); }}>Profile</button><button type="button" onClick={() => { setStackLayerDetailLabel(null); openExample(source.id); }}>Example</button><a href={source.url} target="_blank" rel="noreferrer" aria-label={`Open original source for ${source.title}`}><ExternalLink size={13} /></a></span></div>)}</div>}{!stackLayerNodes.length && !stackLayerSources.length && <p className="stack-layer-no-evidence">No linked examples are attached to this level yet. Use the level as a question for future collection work.</p>}<p className="stack-layer-evidence-note">These examples show where a record can sit in the teaching model. They do not prove that the organisations or services are part of one operation.</p></div><div className="stack-layer-dialog-actions"><button className="quiet-button" onClick={() => setStackLayerDetailLabel(null)}>Close explanation</button><button className="primary-button" onClick={() => { setStackLayerDetailLabel(null); changeView('terrain'); }}>Open source layers <ChevronRight size={14} /></button></div></div></dialog>}
      {collectionSource && collectionProfileData && <dialog open className="collection-dialog" aria-label={`Collection profile for ${collectionSource.title}`}><div className="collection-dialog-card"><div className="collection-dialog-head"><div><span className="eyebrow-label">COLLECTION PROFILE · {collectionSource.kind}</span><h2>{collectionSource.title}</h2><p>{collectionSource.provider}</p></div><button className="icon-button" onClick={() => setCollectionSourceId(null)} aria-label="Close collection profile"><X size={17} /></button></div><div className="collection-dialog-notice"><Database size={15} /><p>This is a reading guide to an external collection. The original source remains authoritative; Hyphosphere has not imported or independently verified every record.</p></div><div className="collection-profile-grid"><div><span>WHAT IT CONTAINS</span><p>{collectionProfileData.scope}</p></div><div><span>COVERAGE</span><p>{collectionProfileData.dateRange}</p></div><div><span>RECORD SHAPE</span><p>{collectionProfileData.recordShape}</p></div><div><span>WHY IT IS HERE</span><p>{collectionSource.whyIncluded}</p></div><div><span>OBSERVATORY QUESTION</span><p>{collectionProfileData.researchQuestion}</p></div><div><span>LIMITATIONS</span><p>{collectionProfileData.limitations}</p></div></div><div className="collection-stack-section"><span className="eyebrow-label">STACK POSITION IN THIS DEMO</span><StackLayerPills layers={sourceStackLayers(collectionSource)} /><p>The label shows which part of the enabling assemblage this collection helps a researcher inspect. A collection can touch more than one layer.</p></div><div className="collection-dialog-actions"><button className="quiet-button" onClick={() => { setCollectionSourceId(null); openExample(collectionSource.id); }}><Eye size={14} /> Show example</button><button className="quiet-button" onClick={() => setCollectionSourceId(null)}>Close profile</button><a className="primary-button" href={collectionSource.url} target="_blank" rel="noreferrer">Open original source <ExternalLink size={14} /></a></div></div></dialog>}
      {notebookOpen && <dialog open id="hyphosphere-notebook" className="notebook-dialog" aria-label="Hyphosphere notebook"><div className="notebook-dialog-card"><div className="notebook-dialog-head"><div><span className="eyebrow-label">NOTEBOOK · SAVED DISCOVERY</span><h2>Your investigation notebook</h2><p>{saved ? 'A compact record of what you followed, what supports it, and what remains open.' : 'A place to keep a finding once you are ready to return to it.'}</p></div><button className="icon-button" onClick={() => setNotebookOpen(false)} aria-label="Close notebook"><X size={17} /></button></div>{saved ? <div className="notebook-content"><div className="notebook-finding"><div className="notebook-finding-top"><span><Bookmark size={14} /> SAVED FINDING</span><span>LOCAL DEMO CORPUS</span></div><h3>The service beneath the surface</h3><p>Atlas Relay appears across the Northline cohort and the Greybox traces dataset. The service connection is supported; the extension to Invite fragment remains inferred.</p></div><div className="notebook-grid"><section className="notebook-section"><span className="drawer-label">INVESTIGATION TRAIL</span><div className="notebook-trail">{['Northline cohort', 'Atlas Relay', 'Greybox traces', 'Invite fragment'].map((label, index) => <div key={label}><span>{(index + 1).toString().padStart(2, '0')}</span><strong>{label}</strong></div>)}</div></section><section className="notebook-section"><span className="drawer-label">EVIDENCE STATES</span><div className="notebook-evidence-list"><div><EvidencePill state="verified" /><span>Greybox recurrence</span></div><div><EvidencePill state="supported" /><span>Northline → Atlas Relay</span></div><div><EvidencePill state="inferred" /><span>Atlas Relay → Invite fragment</span></div><div><EvidencePill state="disputed" /><span>The Long Arc → Quiet Harbor CDN</span></div></div></section></div><div className="notebook-note"><CircleHelp size={15} /><p>Saving preserves the path and its uncertainty; it does not turn an inference into a verified claim. In this proof of concept, the notebook is session-local. Export Markdown to keep a durable copy.</p></div></div> : <div className="notebook-empty"><Bookmark size={28} /><h3>Nothing saved yet.</h3><p>Start with Atlas Relay, follow a relationship, and save the finding when you want to keep the trail for later.</p><button className="primary-button" onClick={() => { setNotebookOpen(false); setSelectedId('service'); changeView('thread'); }}>Start the investigation <ChevronRight size={14} /></button></div>}<div className="notebook-dialog-actions">{saved && <button className="quiet-button" onClick={() => { setNotebookOpen(false); setSelectedId('service'); changeView('thread'); }}>Open followed path <ChevronRight size={14} /></button>}{saved && <button className="primary-button" onClick={exportDiscovery}><Download size={14} /> Export Markdown</button>}<button className="quiet-button" onClick={() => setNotebookOpen(false)}>Close notebook</button></div></div></dialog>}
    </main>
  );
}

function ThreadView({ selectedId, followed, evidenceOnly, onSelect, onFollow, onOpenEvidence, onToggleVerified, onChangeView }: { selectedId: string; followed: boolean; evidenceOnly: boolean; onSelect: (id: string) => void; onFollow: (id: string) => void; onOpenEvidence: (id: string) => void; onToggleVerified: () => void; onChangeView: (view: View) => void }) {
  const ids = followed ? threadSequence : threadSequence.slice(0, 3);
  const shown = ids.map((id) => nodeById(id)).filter((node) => !evidenceOnly || node.evidence === 'verified');
  const revealedStepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (followed) window.requestAnimationFrame(() => revealedStepRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, [followed]);

  return <div className="thread-view"><div className="surface-header"><div><span className="eyebrow-label">THREAD VIEW</span><h2>Read the investigation in order.</h2><p>This is the path of the current hypothesis, from case to service to supporting material. It is deliberately linear so the user can tell what was found, what was followed, and what remains uncertain.</p></div><div className="surface-header-meta"><strong>{shown.length.toString().padStart(2, '0')}</strong><span>steps in view</span></div></div><div className="thread-toolbar"><span><span className="live-dot" /> RESEARCH THREAD</span><span>{evidenceOnly ? 'verified steps only' : 'full evidence trail'}</span><button onClick={onToggleVerified} aria-pressed={evidenceOnly}><Eye size={14} /> {evidenceOnly ? 'Show all' : 'Verified only'}</button></div><div className="thread-path">{shown.map((node, index) => { const previous = shown[index - 1]; const relation = previous ? edges.find((edge) => (edge.from === previous.id && edge.to === node.id) || (edge.to === previous.id && edge.from === node.id)) : undefined; const isSelected = selectedId === node.id; return <div className="thread-step-wrap" key={node.id} ref={index === 3 ? revealedStepRef : undefined}>{index > 0 && <div className="thread-connection"><span>{relation?.label ?? 'continues to'}</span><i className={`connection-line connection-${relation?.evidence ?? 'supported'}`} /></div>}<article className={`thread-step ${isSelected ? 'is-selected' : ''}`}><div className="thread-step-index">{(index + 1).toString().padStart(2, '0')}</div><button className="thread-step-card" onClick={() => { onSelect(node.id); onOpenEvidence(node.id); }} aria-label={`Select ${node.label} and inspect its evidence in the investigation thread`}><div className="thread-step-top"><span>{node.kind}</span><EvidencePill state={node.evidence} /></div><strong>{node.label}</strong><span>{node.source} · {node.meta}</span><StackLayerPills layers={node.stackLayers} /><p>{node.preview}</p></button><button className="thread-inspect" onClick={() => onOpenEvidence(node.id)}>Inspect evidence <ChevronRight size={14} /></button></article></div>; })}</div><div className="thread-footer"><div><span className="eyebrow-label">WHAT THIS VIEW IS FOR</span><p>{followed ? 'The path is open. Continue to Source layers to inspect the material beneath the visible cases.' : 'Use Thread to follow sequence and provenance. Switch to Map when you want to see all relationships and possible branches at once.'}</p></div><button className="follow-button" onClick={() => followed ? onChangeView('terrain') : onFollow(selectedId)}><span className="follow-glyph"><ArrowUpRight size={16} /></span>{followed ? 'Open source layers' : 'Follow this'}<ChevronRight size={16} /></button></div></div>;
}

function MapCanvas({ nodes: visibleNodes, edges: visibleEdges, selectedId, visibleNodeIds, followed, evidenceOnly, onSelect, onFollow, onOpenThread, onOpenEvidence, onToggleVerified }: { nodes: ResearchNode[]; edges: ResearchEdge[]; selectedId: string; visibleNodeIds: Set<string>; followed: boolean; evidenceOnly: boolean; onSelect: (id: string) => void; onFollow: (id: string) => void; onOpenThread: () => void; onOpenEvidence: (id: string) => void; onToggleVerified: () => void }) {
  return <div className="map-view"><div className="surface-header"><div><span className="eyebrow-label">MAP VIEW</span><h2>See the relationships at once.</h2><p>This is the spatial view: cases, services, datasets, archives, and infrastructure share one field so you can spot recurrences and branches before deciding what they mean.</p></div><div className="surface-header-meta"><strong>{visibleNodes.length.toString().padStart(2, '0')}</strong><span>objects visible</span></div></div><div className="research-canvas map-mode"><div className="canvas-toolbar"><span><span className="live-dot" /> ACTIVE TERRAIN</span><span className="toolbar-divider" /><span>{visibleNodes.length} objects / {visibleEdges.length} relationships</span><span className="canvas-toolbar-spacer" /><button onClick={onToggleVerified} aria-pressed={evidenceOnly}><Eye size={14} /> {evidenceOnly ? 'verified layer' : 'all layers'}</button></div><div className="terrain-grid" /><div className="terrain-label terrain-label-a">FIELDWORK / 04</div><div className="terrain-label terrain-label-b">COMMERCIAL LAYER</div><div className="terrain-label terrain-label-c">ARCHIVE EDGE</div><svg className="map-edges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{visibleEdges.map((edge) => { const from = nodeById(edge.from); const to = nodeById(edge.to); const dimmed = !visibleNodeIds.has(edge.from) || !visibleNodeIds.has(edge.to); return <g key={edge.id} className={`edge-group edge-${edge.evidence} ${dimmed ? 'is-dimmed' : ''} ${edge.from === selectedId || edge.to === selectedId ? 'is-connected' : ''}`}><line x1={from.x} y1={from.y} x2={to.x} y2={to.y} /><text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 1.8}>{edge.label}</text></g>; })}</svg>{visibleNodes.map((node) => { const hidden = !visibleNodeIds.has(node.id); const isSelected = selectedId === node.id; const placement = `${node.x > 60 ? 'card-left' : 'card-right'} ${node.y > 60 ? 'card-up' : 'card-down'}`; return <button key={node.id} className={`research-node node-${node.accent} ${isSelected ? 'is-selected' : ''} ${hidden ? 'is-hidden' : ''}`} style={{ left: `${node.x}%`, top: `${node.y}%` }} onClick={() => onSelect(node.id)} aria-label={`Select ${node.label}`}><span className="node-orbit" /><span className="node-marker"><NodeIcon kind={node.kind} /></span><span className={`node-card ${placement} ${isSelected ? 'is-expanded' : 'is-compact'}`}>{isSelected ? <><span className="node-card-top"><span>{node.kind}</span><EvidencePill state={node.evidence} /></span><strong>{node.label}</strong><small>{node.meta}</small><em>{node.preview}</em></> : <><strong>{node.label}</strong><small>{node.kind}</small></>}</span></button>; })}<div className="canvas-legend"><div><span className="legend-line legend-solid" /> verified</div><div><span className="legend-line legend-light" /> supported</div><div><span className="legend-line legend-dashed" /> inferred</div><div><span className="legend-dot legend-disputed" /> disputed</div></div><div className="canvas-callout"><span className="callout-index">01</span><div><strong>{followed ? 'The pattern extends' : 'Start with the ordinary'}</strong><p>{followed ? 'Atlas Relay appears across multiple source classes.' : 'Select a node, then follow the relationship.'}</p></div><button onClick={() => onOpenEvidence(selectedId)} aria-label="Open evidence"><CircleHelp size={16} /></button></div><div className="canvas-action"><button className="follow-button" onClick={() => followed ? onOpenThread() : onFollow(selectedId)}><span className="follow-glyph"><ArrowUpRight size={16} /></span>{followed ? 'Open followed path' : 'Follow this'}<ChevronRight size={16} /></button><span>leaves judgement with you</span></div></div></div>;
}

function MapView(props: { nodes: ResearchNode[]; edges: ResearchEdge[]; selectedId: string; visibleNodeIds: Set<string>; followed: boolean; evidenceOnly: boolean; onSelect: (id: string) => void; onFollow: (id: string) => void; onOpenThread: () => void; onOpenEvidence: (id: string) => void; onToggleVerified: () => void; onOpenStack: () => void; onOpenStackLayer: (layer: StackLayer) => void }) {
  const selected = nodeById(props.selectedId);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const inspectorRef = useRef<HTMLElement>(null);
  const previousSelectedRef = useRef(props.selectedId);
  const previousFollowedRef = useRef(props.followed);

  useEffect(() => {
    if (previousSelectedRef.current !== props.selectedId) window.requestAnimationFrame(() => inspectorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    previousSelectedRef.current = props.selectedId;
  }, [props.selectedId]);

  useEffect(() => {
    if (!previousFollowedRef.current && props.followed) window.requestAnimationFrame(() => surfaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    previousFollowedRef.current = props.followed;
  }, [props.followed]);

  return <div ref={surfaceRef} className="map-surface-shell"><div className="map-explainer"><div className="map-explainer-icon"><Network size={19} /></div><div className="map-explainer-copy"><span className="eyebrow-label">WHAT THIS NETWORK IS SHOWING</span><strong>An information operation can look highly visible while occupying only a tiny layer of a giant ecommerce stack.</strong><p>Atlas Relay is the small connective service being tested here—not the whole operation. The lines show where that layer touches cases, datasets, platform artefacts, and infrastructure, with uncertainty carried by every relationship.</p></div><div className="map-stack-model" aria-label="From visible public story to buried commercial infrastructure"><span className="map-stack-label">VISIBLE → BURIED</span><button type="button" className="stack-step stack-visible stack-step-button" onClick={() => props.onOpenStackLayer('Visible story / reporting')} aria-label="Open visible story and reporting explanation"><b>01</b><span>Public story / IO</span><ArrowUpRight size={13} /></button><button type="button" className="stack-step stack-service stack-step-button" onClick={() => props.onOpenEvidence('service')} aria-label="Open Atlas Relay service evidence"><b>02</b><span>Shared service / Atlas Relay</span><ArrowUpRight size={13} /></button><button type="button" className="stack-step stack-infrastructure stack-step-button" onClick={props.onOpenStack} aria-label="Open giant ecommerce stack explainer"><b>03</b><span>Giant ecommerce stack</span><ArrowUpRight size={13} /></button></div></div><MapCanvas {...props} /><aside ref={inspectorRef} className="map-inspector" aria-live="polite"><span className="eyebrow-label">SELECTED OBJECT</span><div className={`map-inspector-icon object-${selected.accent}`}><NodeIcon kind={selected.kind} /></div><strong>{selected.label}</strong><span>{selected.kind} · {selected.source}</span><div className="map-inspector-stack"><span>STACK POSITION</span><StackLayerPills layers={selected.stackLayers} /></div><EvidencePill state={selected.evidence} /><p>{selected.preview}</p><div className="map-inspector-actions"><button className="quiet-button" onClick={() => props.onOpenEvidence(selected.id)}>Inspect evidence</button><button className="follow-button" onClick={() => props.followed ? props.onOpenThread() : props.onFollow(selected.id)}><span className="follow-glyph"><ArrowUpRight size={14} /></span>{props.followed ? 'Open followed path' : 'Follow this'}</button></div></aside></div>;
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
          <p>{concepts ? 'Concepts are interpretive handles: they help a person recognise a pattern, but they are not evidence by themselves.' : 'Artifacts are the inspectable material behind a claim: cases, reports, datasets, platform captures, services, and infrastructure records.'}</p>
        </div>
        <div className="surface-header-meta"><strong>{concepts ? '04' : '07'}</strong><span>{concepts ? 'concept records' : 'artifact records'}</span></div>
      </div>
      {!concepts && <div className="corpus-method-note"><div className="corpus-method-icon"><Database size={15} /></div><div><span className="eyebrow-label">HOW TO READ THIS INDEX</span><p>Each artifact is a source record, not a conclusion. Select one to inspect what was reported or captured, where it came from, and why it has been included.</p></div></div>}
      <div className="corpus-switch"><button className={concepts ? 'is-active' : ''} onClick={() => onChangeMode('concepts')}>Research concepts</button><button className={!concepts ? 'is-active' : ''} onClick={() => onChangeMode('artifacts')}>Research artifacts</button></div>
      {concepts ? <><div ref={contentRef} className="concept-grid">{conceptRecords.map((record, index) => <button type="button" className={`concept-card concept-${record.accent}`} key={record.label} onClick={() => onOpenConcept(record.label)} aria-label={`Open research concept: ${record.label}`}><div className="concept-index">0{index + 1}</div><div><strong>{record.label}</strong><p>{record.detail}</p><small>{record.note}</small><span className="concept-card-action">Open explanation <ChevronRight size={13} /></span></div></button>)}</div><section className="stack-learning-panel"><div className="stack-learning-copy"><span className="eyebrow-label">THE DEEPER COMMERCIAL STACK</span><h3>What sits below the visible story?</h3><p>An information operation may be highly visible while depending on a much larger assemblage of platforms, services, data, interfaces, and infrastructure. Click a level to see what it can help a researcher ask.</p><div className="stack-learning-note"><CircleHelp size={14} /><span>This is a teaching model for locating traces, not a hierarchy of blame or proof.</span></div></div><div className="stack-learning-visual" aria-label="Interactive commercial stack visual"><div className="stack-learning-axis"><span>VISIBLE SURFACE</span><i /><span>DEEPER ENABLEMENT</span></div><div className="stack-learning-layers">{stackLayerDetails.map((item, index) => <button type="button" className={`stack-learning-layer stack-learning-${item.accent}`} key={item.layer} onClick={() => onOpenStackLayer(item.layer)}><span>{(index + 1).toString().padStart(2, '0')}</span><strong>{item.shortLabel}</strong><small>{item.layer}</small><ChevronRight size={14} /></button>)}</div><span className="stack-learning-hint">Select a level to open its explanation</span></div></section></> : <div ref={contentRef} className="artifact-list">{nodes.map((node) => <button key={node.id} className={`artifact-row ${selectedId === node.id ? 'is-selected' : ''}`} onClick={() => { onSelect(node.id); onOpenEvidence(node.id); }} aria-label={`Open source record for ${node.label}`}><span className={`artifact-icon artifact-${node.accent}`}><NodeIcon kind={node.kind} /></span><span className="artifact-copy"><strong>{node.label}</strong><small>{node.kind} · {node.source}</small><StackLayerPills layers={node.stackLayers} /><p>{node.preview}</p><em>Why included: {node.inclusionReason}</em></span><EvidencePill state={node.evidence} /><ChevronRight size={15} /></button>)}</div>}
      {!concepts && <div className="external-source-shelf"><div className="external-source-shelf-head"><div><span className="eyebrow-label">EXTERNAL SOURCE INDEX</span><p>These links point to original datasets, databases, and reports. Choose an example for a quick orientation, inspect the collection profile, or open the original source to inspect the material directly.</p></div><span>{externalSources.length.toString().padStart(2, '0')} linked sources</span></div><div className="external-source-list">{externalSources.map((source) => <article key={source.id} className="external-source-card"><div><span>{source.kind}</span><strong>{source.title}</strong><small>{source.provider}</small><StackLayerPills layers={sourceStackLayers(source)} /><p>{source.description}</p><em>Why included: {source.whyIncluded}</em><small>{source.access}</small><div className="external-source-actions"><button className="source-profile-button" onClick={() => onOpenCollection(source.id)}><Database size={13} /> Collection profile</button><button className="source-example-button" onClick={() => onOpenExample(source.id)}><Eye size={13} /> Show example</button><a className="source-original-link" href={source.url} target="_blank" rel="noreferrer">Open original <ExternalLink size={13} /></a></div></div></article>)}</div></div>}
      <div className="corpus-note"><Database size={15} /><span><strong>Working index</strong>{concepts ? ' These concepts explain what the investigation is looking for.' : ' These artifacts are the current deterministic demo material; external sources are curated link-outs, not live imports.'}</span></div>
    </div>
  );
}

function TerrainView({ selectedLayer, onFollow, onOpenThread, onInspect, onOpenObject, onOpenExample, onOpenCollection, followed }: { selectedLayer: TerrainLayer | null; onFollow: () => void; onOpenThread: () => void; onInspect: (label: string) => void; onOpenObject: (id: string) => void; onOpenExample: (id: string) => void; onOpenCollection: (id: string) => void; followed: boolean }) {
  const detailRef = useRef<HTMLElement>(null);
  const objects = selectedLayer?.objectIds.map(nodeById) ?? [];
  const sources = selectedLayer?.sourceIds.map((id) => externalSources.find((source) => source.id === id)).filter((source): source is ResearchSource => Boolean(source)) ?? [];

  useEffect(() => {
    if (selectedLayer) detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [selectedLayer]);

  return (
    <div className="terrain-view">
      <div className="terrain-view-intro"><div><span className="eyebrow-label">SOURCE TERRAIN</span><h2>See the ecology behind the pattern.</h2><p>One investigation, six kinds of material. Select a layer to see what it contains, why it matters, and where to investigate next.</p></div><div className="terrain-total"><strong>13</strong><span>research objects</span></div></div>
      <div className="terrain-mosaic">{terrainItems.map((item) => { const Icon = item.icon; const isSelected = selectedLayer?.label === item.label; return <button type="button" key={item.label} className={`terrain-tile tile-${item.color} ${isSelected ? 'is-selected' : ''}`} onClick={() => onInspect(item.label)} aria-label={`${isSelected ? 'Show' : 'Open'} ${item.label} source layer details below`} aria-pressed={isSelected}><div className="tile-icon"><Icon size={19} /></div><div><span>{item.label}</span><strong>{item.count.toString().padStart(2, '0')}</strong><small>{isSelected ? 'Selected · details below' : item.detail}</small></div><ArrowUpRight size={16} /></button>; })}</div>
      {selectedLayer ? <section ref={detailRef} className="terrain-layer-detail" aria-live="polite"><div className="terrain-layer-detail-head"><div><span className="eyebrow-label">SELECTED SOURCE LAYER · DETAILS BELOW</span><h3>{selectedLayer.label}</h3><p>{selectedLayer.description}</p></div><div className="terrain-layer-role"><span>WHY IT MATTERS</span><p>{selectedLayer.role}</p></div></div><div className="terrain-layer-detail-grid"><div className="terrain-related-group"><span className="eyebrow-label">IN THIS DEMO</span><div className="terrain-object-list">{objects.map((node) => <button type="button" className="terrain-object-row" key={node.id} onClick={() => onOpenObject(node.id)}><span className={`artifact-icon artifact-${node.accent}`}><NodeIcon kind={node.kind} /></span><span className="terrain-object-copy"><strong>{node.label}</strong><small>{node.kind} · {node.source}</small><StackLayerPills layers={node.stackLayers} /><em>{node.preview}</em></span><span className="terrain-object-action">Inspect evidence <ChevronRight size={13} /></span></button>)}</div></div><div className="terrain-related-group"><span className="eyebrow-label">EXTERNAL STARTING POINTS</span>{sources.length ? <div className="terrain-source-list">{sources.map((source) => <article className="terrain-source-row" key={source.id}><div className="terrain-source-copy"><span>{source.kind}</span><strong>{source.title}</strong><small>{source.provider}</small><StackLayerPills layers={sourceStackLayers(source)} /></div><div className="terrain-source-actions"><button className="source-profile-button" onClick={() => onOpenCollection(source.id)}><Database size={13} /> Profile</button><button className="source-example-button" onClick={() => onOpenExample(source.id)}><Eye size={13} /> Example</button><a className="source-original-link" href={source.url} target="_blank" rel="noreferrer">Original <ExternalLink size={13} /></a></div></article>)}</div> : <p className="terrain-no-sources">No external link is attached to this layer yet. Inspect the local record to continue the trail.</p>}</div></div></section> : <div className="terrain-empty-state"><Compass size={16} /><span>Choose a source layer to reveal its related artifacts, explanation, and external starting points.</span></div>}
      <div className="terrain-note"><div className="terrain-note-icon"><Sparkles size={17} /></div><div><span>THE SCENE CHANGED</span><p>{followed ? 'Atlas Relay connects sources that do not usually appear in the same investigation.' : 'Follow Atlas Relay to reveal the platform artefact and disputed infrastructure record.'}</p></div><button onClick={() => followed ? onOpenThread() : onFollow()}>{followed ? 'Open followed path' : 'Follow Atlas Relay'} <ChevronRight size={15} /></button></div>
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

  return <div className="evidence-view"><div className="evidence-view-head"><div><span className="eyebrow-label">EVIDENCE LAYER</span><h2>Keep the distinction visible.</h2><p>Every connection has a status, a basis, and two clear next actions: follow the relationship or inspect its sources.</p></div><div ref={summaryRef} className="evidence-summary" aria-live="polite"><span>current focus</span><strong>{selected.label}</strong><EvidencePill state={selected.evidence} /><button className="quiet-button" onClick={() => followed ? onOpenThread() : onFollow(selected.id)}><Link2 size={14} /> {followed ? 'Open followed path' : 'Follow focus'}</button></div></div><div className="evidence-table"><div className="evidence-table-head"><span>RELATIONSHIP</span><span>STATUS</span><span>BASIS</span><span>ACTIONS</span></div>{shown.map((edge) => { const from = nodeById(edge.from); const to = nodeById(edge.to); const nextId = edge.from === selected.id ? edge.to : edge.from; return <div key={edge.id} className="evidence-row"><span className="evidence-relationship"><strong>{from.label}</strong><small>{edge.label}</small><strong>{to.label}</strong></span><EvidencePill state={edge.evidence} /><span className="evidence-basis">{edge.rationale}</span><span className="evidence-row-actions"><button onClick={() => followed ? onOpenThread() : onFollow(nextId)}>{followed ? 'Open path' : 'Follow'} <ChevronRight size={13} /></button><button onClick={() => onOpen(nextId)}>Inspect <CircleHelp size={13} /></button></span></div>; })}</div><div className="evidence-footnote"><CircleHelp size={15} /><span>Verified only removes attractive-looking connections that do not yet have direct support. That disappearance is a discovery too.</span></div></div>;
}

function CompareView({ followed, selectedId, onFollow, onSelectCase }: { followed: boolean; selectedId: string; onFollow: () => void; onSelectCase: (id: string) => void }) {
  return <div className="compare-view"><div className="compare-head"><div><span className="eyebrow-label">STRUCTURAL COMPARISON</span><h2>What is shared, and what is not?</h2><p>Comparison keeps similarity from becoming certainty.</p></div><button className="quiet-button" onClick={onFollow}><Link2 size={15} /> {followed ? 'Open followed path' : 'Follow shared layer'}</button></div><div className="compare-grid"><button type="button" className={`case-panel case-a ${selectedId === 'northline' ? 'is-selected' : ''}`} onClick={() => onSelectCase('northline')} aria-label="Select Northline cohort for comparison" aria-pressed={selectedId === 'northline'}><div className="case-panel-top"><span className="case-index">A</span><div><span>CASE 04</span><strong>Northline cohort</strong></div><EvidencePill state="verified" /></div><small className="case-focus-status">{selectedId === 'northline' ? 'Current focus' : 'Select to focus'}</small><p>Repeated onboarding pattern across two regional cases.</p><div className="compare-list"><div><Check size={14} /><span>Atlas Relay<strong>service record</strong></span></div><div><Check size={14} /><span>Greybox traces<strong>11 matching rows</strong></span></div><div className="is-muted"><X size={14} /><span>Invite fragment<strong>not observed directly</strong></span></div></div></button><div className="compare-middle"><span>SHARED</span><div className="shared-pill"><Globe2 size={15} /> Atlas Relay</div><div className="compare-connector" /><span>STRUCTURE</span></div><button type="button" className={`case-panel case-b ${selectedId === 'lantern' ? 'is-selected' : ''}`} onClick={() => onSelectCase('lantern')} aria-label="Select Lantern House for comparison" aria-pressed={selectedId === 'lantern'}><div className="case-panel-top"><span className="case-index">B</span><div><span>CASE 11</span><strong>Lantern House</strong></div><EvidencePill state="supported" /></div><small className="case-focus-status">{selectedId === 'lantern' ? 'Current focus' : 'Select to focus'}</small><p>Similar activity with a different public story.</p><div className="compare-list"><div><Check size={14} /><span>Atlas Relay<strong>visual match</strong></span></div><div><Check size={14} /><span>Invite fragment<strong>earlier occurrence</strong></span></div><div className="is-muted"><X size={14} /><span>Greybox traces<strong>not yet linked</strong></span></div></div></button></div><div className="compare-warning"><CircleHelp size={15} /><span>The shared service is supported across cases. The underlying relationship remains an investigative proposition, not a conclusion.</span></div></div>;
}
