/**
 * Deeply-modeled connector detail fixtures.
 *
 * Every connector in the Record > Data sources grid has a corresponding detail
 * payload: sync history, activity log, lineage into the emission ledger, and
 * a *type-specific* hero dataset that drives the drawer's primary tab.
 *
 * Numbers are deterministic (seeded) so the demo is reproducible.
 */

import { seededRandom, range } from "@/lib/utils";
import type { EmissionCategory, Scope } from "@/lib/types";

// -----------------------------------------------------------------------
// Canonical connector registry — mirrored on the sources page
// -----------------------------------------------------------------------

export type ConnectorType = "ERP" | "IoT" | "Document" | "File" | "API";
export type ConnectorStatus = "connected" | "syncing" | "error" | "disconnected";

export type Connector = {
  id: string;
  name: string;
  type: ConnectorType;
  vendor: string;
  status: ConnectorStatus;
  lastSync: string;
  records: number;
  logo: string;
  /** Visible to user in wizard & settings — realistic per-vendor */
  credentialFields: CredentialField[];
  /** Scope entities user can pick during wizard step 2 */
  scopeEntities: ScopeEntity[];
  /** Endpoint / protocol note shown in Settings */
  endpointHint?: string;
  /** For realistic "sample credentials" */
  sampleTenant?: string;
};

export type CredentialField = {
  key: string;
  label: string;
  placeholder: string;
  sample: string;
  secret?: boolean;
  required?: boolean;
  help?: string;
};

export type ScopeEntity = {
  key: string;
  label: string;
  description: string;
  relevance: string; // "Scope 1, 2" or "Scope 3.1, 3.4"
  defaultOn: boolean;
};

// -----------------------------------------------------------------------
// Connectors — enriched registry
// -----------------------------------------------------------------------

export const connectors: Connector[] = [
  {
    id: "c1",
    name: "SAP S/4HANA",
    type: "ERP",
    vendor: "SAP SE",
    status: "connected",
    lastSync: "2m ago",
    records: 48_220,
    logo: "SAP",
    endpointHint: "OData v2 · /sap/opu/odata/sap/API_JOURNAL_SRV",
    sampleTenant: "https://my379284.s4hana.cloud.sap",
    credentialFields: [
      { key: "host", label: "Tenant URL", placeholder: "https://myXXXXXX.s4hana.cloud.sap", sample: "https://my379284.s4hana.cloud.sap", required: true },
      { key: "client_id", label: "Client ID", placeholder: "sb-client-...", sample: "sb-client-brentford-prod", required: true },
      { key: "client_secret", label: "Client Secret", placeholder: "••••••••", sample: "pKx8-hLqN-dxJ7-vz4M", secret: true, required: true },
      { key: "env", label: "Environment", placeholder: "prod", sample: "prod" },
    ],
    scopeEntities: [
      { key: "journal", label: "Journal entries (A_JournalEntryItem)", description: "GL postings with cost centre + commodity", relevance: "Scope 1, 2, 3.1", defaultOn: true },
      { key: "po", label: "Purchase orders (A_PurchaseOrder)", description: "Commitments with supplier + material + spend", relevance: "Scope 3.1, 3.4", defaultOn: true },
      { key: "invoice", label: "Supplier invoices (A_SupplierInvoice)", description: "Actualised spend with GL + category", relevance: "Scope 3.1", defaultOn: true },
      { key: "material", label: "Material master (A_Material)", description: "Commodity classification + UoM", relevance: "Scope 3.1", defaultOn: false },
      { key: "asset", label: "Asset master (A_FixedAsset)", description: "Fixed assets, locations for boundary definition", relevance: "Boundary", defaultOn: false },
    ],
  },
  {
    id: "c2",
    name: "Oracle ERP Cloud",
    type: "ERP",
    vendor: "Oracle",
    status: "connected",
    lastSync: "14m ago",
    records: 12_804,
    logo: "ORC",
    endpointHint: "REST · /fscmRestApi/resources/11.13.18.05",
    sampleTenant: "https://brentford-dev1.fa.em3.oraclecloud.com",
    credentialFields: [
      { key: "host", label: "Fusion host", placeholder: "https://...fa.em3.oraclecloud.com", sample: "https://brentford-dev1.fa.em3.oraclecloud.com", required: true },
      { key: "user", label: "Integration user", placeholder: "esg.integration", sample: "esg.integration@brentford.fc", required: true },
      { key: "password", label: "Password", placeholder: "••••••••", sample: "OracleDemo#2025", secret: true, required: true },
    ],
    scopeEntities: [
      { key: "invoices", label: "AP invoices", description: "/invoices", relevance: "Scope 3.1, 3.4", defaultOn: true },
      { key: "po", label: "Purchase orders", description: "/purchaseOrders", relevance: "Scope 3.1", defaultOn: true },
      { key: "gl", label: "GL balances", description: "/generalLedgerBalances", relevance: "Scope 1, 2", defaultOn: true },
      { key: "suppliers", label: "Supplier master", description: "/suppliers", relevance: "Screening", defaultOn: false },
    ],
  },
  {
    id: "c3",
    name: "Workday HCM",
    type: "ERP",
    vendor: "Workday",
    status: "connected",
    lastSync: "1h ago",
    records: 420,
    logo: "WDY",
    endpointHint: "REST · /ccx/api/v1/tenants/brentford/workers",
    sampleTenant: "https://wd5-impl.workday.com/brentford",
    credentialFields: [
      { key: "tenant", label: "Tenant", placeholder: "wd5-impl.workday.com/brentford", sample: "wd5-impl.workday.com/brentford", required: true },
      { key: "isu", label: "ISU username", placeholder: "isu_esg", sample: "isu_esg@brentford", required: true },
      { key: "isu_pw", label: "ISU password", placeholder: "••••••••", sample: "Wd-Demo-2025!", secret: true, required: true },
    ],
    scopeEntities: [
      { key: "headcount", label: "Headcount by location", description: "Drives intensity normalisation", relevance: "Intensity", defaultOn: true },
      { key: "expense_cat", label: "T&E expense categories", description: "Air / rail / hotel / car spend", relevance: "Scope 3.6", defaultOn: true },
      { key: "commute", label: "Commuting survey", description: "Modal split & average distance", relevance: "Scope 3.7", defaultOn: false },
      { key: "locations", label: "Location master", description: "Office / site registry", relevance: "Boundary", defaultOn: true },
    ],
  },
  {
    id: "c4",
    name: "Dynamics 365",
    type: "ERP",
    vendor: "Microsoft",
    status: "disconnected",
    lastSync: "—",
    records: 0,
    logo: "D365",
    endpointHint: "Dataverse · /api/data/v9.2",
    sampleTenant: "https://brentford.crm4.dynamics.com",
    credentialFields: [
      { key: "tenant", label: "Tenant ID (Entra)", placeholder: "00000000-0000-0000-0000-000000000000", sample: "7e4a2c31-9d12-4bd3-b2c0-0af61d4a9f21", required: true },
      { key: "app_id", label: "App (client) ID", placeholder: "00000000-0000-0000-0000-000000000000", sample: "3e0d4a7f-82b5-4c90-a6e2-14f8c6d9013a", required: true },
      { key: "app_secret", label: "Client secret", placeholder: "••••••••", sample: "D65_~dEmO_S3cret_Value", secret: true, required: true },
      { key: "env", label: "Environment URL", placeholder: "https://XXX.crm4.dynamics.com", sample: "https://brentford.crm4.dynamics.com", required: true },
    ],
    scopeEntities: [
      { key: "invoices", label: "Vendor invoices", description: "Finance & Operations module", relevance: "Scope 3.1", defaultOn: true },
      { key: "po", label: "Purchase orders", description: "F&O purchasing", relevance: "Scope 3.1", defaultOn: true },
      { key: "accounts", label: "Suppliers", description: "Vendor master", relevance: "Screening", defaultOn: false },
    ],
  },
  {
    id: "c5",
    name: "Stadium BMS",
    type: "IoT",
    vendor: "Schneider Electric",
    status: "connected",
    lastSync: "live",
    records: 892_440,
    logo: "BMS",
    endpointHint: "EcoStruxure Building · BACnet/IP · OPC UA bridge",
    sampleTenant: "bms-gw-riverside.brentford.local",
    credentialFields: [
      { key: "gw", label: "Gateway endpoint", placeholder: "bms-gw.brentford.local", sample: "bms-gw-riverside.brentford.local", required: true },
      { key: "site_id", label: "Site ID", placeholder: "RVS-01", sample: "RVS-01", required: true },
      { key: "api_key", label: "API key", placeholder: "••••••••", sample: "sx_live_nf-RVS-a4b21c9f", secret: true, required: true },
      { key: "poll", label: "Poll interval (s)", placeholder: "30", sample: "30" },
    ],
    scopeEntities: [
      { key: "hvac", label: "HVAC plant", description: "Chillers, AHUs, pumps, fans", relevance: "Scope 1, 2", defaultOn: true },
      { key: "lighting", label: "Lighting circuits", description: "Floodlights, concourse, pitch", relevance: "Scope 2", defaultOn: true },
      { key: "kitchens", label: "Hospitality kitchens", description: "Fryers, ovens, refrigeration", relevance: "Scope 1, 2", defaultOn: true },
      { key: "pitch", label: "Pitch heating", description: "Undersoil heating, irrigation", relevance: "Scope 1, 2", defaultOn: true },
      { key: "security", label: "Security / lifts", description: "CCTV, access, lifts", relevance: "Scope 2", defaultOn: false },
    ],
  },
  {
    id: "c6",
    name: "Smart Meters — MPAN x3",
    type: "IoT",
    vendor: "Stark",
    status: "connected",
    lastSync: "live",
    records: 262_800,
    logo: "MTR",
    endpointHint: "Stark API · HH data via DCC",
    sampleTenant: "https://api.stark.co.uk",
    credentialFields: [
      { key: "account", label: "Stark account", placeholder: "NFC-2104", sample: "NFC-2104", required: true },
      { key: "api_key", label: "API key", placeholder: "••••••••", sample: "sk_stark_live_42e8a...9d", secret: true, required: true },
      { key: "mpans", label: "MPAN list", placeholder: "01-801-100-XXX-XXX-XX", sample: "01-801-100-420-2104-12, 01-801-100-420-2104-13, 02-801-100-420-2104-08", help: "Comma-separated, 21-digit format" },
    ],
    scopeEntities: [
      { key: "hh", label: "Half-hourly consumption", description: "48 intervals/day per MPAN", relevance: "Scope 2", defaultOn: true },
      { key: "tod", label: "Time-of-day bands", description: "Day / Night / Peak allocation", relevance: "Cost", defaultOn: true },
      { key: "reactive", label: "Reactive power (kVArh)", description: "Power factor tracking", relevance: "Efficiency", defaultOn: false },
    ],
  },
  {
    id: "c7",
    name: "Utility bills (PDF)",
    type: "Document",
    vendor: "Atmosphereum AI",
    status: "connected",
    lastSync: "8h ago",
    records: 148,
    logo: "AI",
    endpointHint: "Document AI · 23 supplier templates",
    sampleTenant: "bills-brentfordfc@inbox.atmosphereum.ai",
    credentialFields: [
      { key: "source", label: "Ingest method", placeholder: "email / sharepoint / drive", sample: "email", required: true, help: "Forward bills to the generated address" },
      { key: "email", label: "Forward address", placeholder: "auto-generated", sample: "bills-brentfordfc@inbox.atmosphereum.ai" },
    ],
    scopeEntities: [
      { key: "electricity", label: "Electricity bills", description: "kWh, £, rate, MPAN extraction", relevance: "Scope 2", defaultOn: true },
      { key: "gas", label: "Gas bills", description: "kWh / m³, £, MPRN extraction", relevance: "Scope 1", defaultOn: true },
      { key: "water", label: "Water bills", description: "m³, £ extraction", relevance: "Resource", defaultOn: true },
      { key: "waste", label: "Waste disposal", description: "Tonnes, stream, disposal method", relevance: "Scope 3.5", defaultOn: false },
    ],
  },
  {
    id: "c8",
    name: "Freight invoices (PDF)",
    type: "Document",
    vendor: "Atmosphereum AI",
    status: "syncing",
    lastSync: "now",
    records: 62,
    logo: "AI",
    endpointHint: "Document AI · 12 carrier templates",
    sampleTenant: "freight-brentfordfc@inbox.atmosphereum.ai",
    credentialFields: [
      { key: "source", label: "Ingest method", placeholder: "email / sftp", sample: "email", required: true },
      { key: "email", label: "Forward address", placeholder: "auto-generated", sample: "freight-brentfordfc@inbox.atmosphereum.ai" },
    ],
    scopeEntities: [
      { key: "road", label: "Road freight", description: "Tonne-km via LTL/FTL invoices", relevance: "Scope 3.4", defaultOn: true },
      { key: "air", label: "Air freight", description: "Weight × IATA distance", relevance: "Scope 3.4", defaultOn: true },
      { key: "rail", label: "Rail freight", description: "Tonne-km rail", relevance: "Scope 3.4", defaultOn: false },
      { key: "courier", label: "Express courier", description: "DHL / FedEx / UPS line items", relevance: "Scope 3.4", defaultOn: true },
    ],
  },
  {
    id: "c9",
    name: "CSV/Excel upload",
    type: "File",
    vendor: "Manual",
    status: "connected",
    lastSync: "yesterday",
    records: 2_104,
    logo: "XLS",
    endpointHint: "Manual · CSV/XLSX with column mapping",
    credentialFields: [],
    scopeEntities: [],
  },
];

export function connectorById(id: string) {
  return connectors.find((c) => c.id === id);
}

// -----------------------------------------------------------------------
// ConnectorDetail payloads — overview + activity + lineage
// -----------------------------------------------------------------------

export type SyncEvent = {
  at: string; // ISO
  ok: boolean;
  records: number;
  ms: number;
};

export type ActivityEvent = {
  at: string;
  event: string;
  records: number;
  ok: boolean;
  detail?: string;
};

export type LineageEntry = {
  category: EmissionCategory;
  scope: Scope;
  records: number;
  description: string;
};

export type ErpMapping = {
  gl: string;
  desc: string;
  category: EmissionCategory;
  scope: Scope;
  records: number;
  confidence: number;
  override?: boolean;
};

export type IotPoint = {
  tag: string;
  unit: string;
  lastValue: number;
  lastAt: string;
  min: number;
  max: number;
  /** Last ~40 readings for sparkline seeding */
  stream: number[];
};

export type IotPointGroup = {
  group: string;
  subGroup?: string;
  points: IotPoint[];
};

export type MpanMeter = {
  mpan: string;
  kind: "electricity" | "gas";
  facility: string;
  tariff: string;
  lastReading: number;
  lastReadingAt: string;
  /** Last 48 half-hourly intervals */
  last48h: number[];
};

export type DocExtraction = {
  id: string;
  supplier: string;
  period: string;
  total: number;
  confidence: number;
  status: "pending" | "approved" | "rejected";
  kind: "electricity" | "gas" | "water" | "waste" | "road" | "air" | "courier";
  fields: { key: string; label: string; value: string; conf: number }[];
  filename: string;
};

export type FileUpload = {
  id: string;
  filename: string;
  rows: number;
  flagged: number;
  at: string;
  user: string;
  template: string;
  mapping: { source: string; target: string; confidence: number }[];
};

export type ConnectorDetail = {
  connectorId: string;
  syncHistory: SyncEvent[];
  freshnessPct: number;
  errorRatePct: number;
  recordsToday: number;
  avgLatencyMs: number;
  lineage: LineageEntry[];
  activity: ActivityEvent[];
  // Type-specific
  erpMappings?: ErpMapping[];
  iotPoints?: IotPointGroup[];
  mpanMeters?: MpanMeter[];
  docQueue?: DocExtraction[];
  fileUploads?: FileUpload[];
};

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

function minutesAgo(mins: number) {
  return new Date(Date.now() - mins * 60_000).toISOString();
}

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 3_600_000).toISOString();
}

function buildSyncHistory(seed: number, errorRate: number, avgRecords: number, avgMs: number): SyncEvent[] {
  const rng = seededRandom(seed);
  return range(24).map((i) => {
    const ok = rng() > errorRate;
    return {
      at: minutesAgo(24 * 60 - i * 60),
      ok,
      records: ok ? Math.round(avgRecords * (0.6 + rng() * 0.8)) : 0,
      ms: Math.round(avgMs * (0.5 + rng() * 1.1)),
    };
  });
}

function buildStream(seed: number, base: number, variance: number, length = 40) {
  const rng = seededRandom(seed);
  return range(length).map((i) => {
    const trend = Math.sin(i / 6) * variance * 0.3;
    const noise = (rng() - 0.5) * variance;
    return Math.max(0, base + trend + noise);
  });
}

// -----------------------------------------------------------------------
// SAP S/4HANA — rich ERP detail
// -----------------------------------------------------------------------

const sapDetail: ConnectorDetail = {
  connectorId: "c1",
  syncHistory: buildSyncHistory(1001, 0.04, 2000, 820),
  freshnessPct: 99.2,
  errorRatePct: 0.4,
  recordsToday: 4_218,
  avgLatencyMs: 820,
  lineage: [
    { category: "electricity", scope: 2, records: 38_420, description: "GL 540100 — Electricity (grid)" },
    { category: "stationary_combustion", scope: 1, records: 2_480, description: "GL 540110 — Natural gas" },
    { category: "business_travel", scope: 3, records: 1_240, description: "GL 680200 — Air travel" },
    { category: "purchased_goods", scope: 3, records: 5_200, description: "GL 600xxx — Matchday catering" },
    { category: "upstream_transport", scope: 3, records: 880, description: "GL 610100 — Freight inbound" },
  ],
  activity: [
    { at: minutesAgo(2), event: "Sync cycle completed", records: 142, ok: true },
    { at: minutesAgo(62), event: "Journal entries delta", records: 418, ok: true, detail: "Cycle 2025-04-19-03" },
    { at: minutesAgo(122), event: "Supplier invoice pull", records: 203, ok: true },
    { at: minutesAgo(182), event: "PO refresh", records: 61, ok: true },
    { at: minutesAgo(242), event: "Token refreshed", records: 0, ok: true, detail: "OAuth bearer renewed, TTL 59m" },
    { at: minutesAgo(302), event: "Journal entries delta", records: 388, ok: true },
    { at: minutesAgo(362), event: "Rate limit warning", records: 0, ok: false, detail: "429 Too Many Requests — backoff 30s" },
    { at: minutesAgo(422), event: "Journal entries delta", records: 412, ok: true },
    { at: minutesAgo(482), event: "PO refresh", records: 55, ok: true },
    { at: minutesAgo(542), event: "Sync cycle completed", records: 289, ok: true },
  ],
  erpMappings: [
    { gl: "540100", desc: "Electricity — grid", category: "electricity", scope: 2, records: 38_420, confidence: 0.99 },
    { gl: "540110", desc: "Natural gas — stationary", category: "stationary_combustion", scope: 1, records: 2_480, confidence: 0.98 },
    { gl: "540120", desc: "District heat", category: "heat_steam", scope: 2, records: 612, confidence: 0.94 },
    { gl: "540200", desc: "Diesel — generators", category: "stationary_combustion", scope: 1, records: 84, confidence: 0.92 },
    { gl: "540210", desc: "Refrigerant top-ups", category: "refrigerants", scope: 1, records: 22, confidence: 0.87 },
    { gl: "541100", desc: "Vehicle fuel (fleet)", category: "mobile_combustion", scope: 1, records: 1_840, confidence: 0.97 },
    { gl: "600100", desc: "Matchday catering", category: "purchased_goods", scope: 3, records: 2_402, confidence: 0.88 },
    { gl: "600120", desc: "Merchandise stock", category: "purchased_goods", scope: 3, records: 1_810, confidence: 0.82 },
    { gl: "610100", desc: "Inbound freight", category: "upstream_transport", scope: 3, records: 880, confidence: 0.91 },
    { gl: "620100", desc: "Waste disposal", category: "waste", scope: 3, records: 312, confidence: 0.95 },
    { gl: "680200", desc: "Air travel", category: "business_travel", scope: 3, records: 1_240, confidence: 0.98 },
    { gl: "680210", desc: "Rail travel", category: "business_travel", scope: 3, records: 640, confidence: 0.99 },
    { gl: "680220", desc: "Hotel accommodation", category: "business_travel", scope: 3, records: 1_102, confidence: 0.96 },
    { gl: "680400", desc: "Mileage reimbursement", category: "business_travel", scope: 3, records: 488, confidence: 0.93 },
    { gl: "700100", desc: "Water supply", category: "water", scope: 3, records: 96, confidence: 0.90 },
    { gl: "900100", desc: "Unclassified (needs review)", category: "purchased_goods", scope: 3, records: 218, confidence: 0.54, override: true },
  ],
};

// -----------------------------------------------------------------------
// Oracle ERP — condensed ERP detail
// -----------------------------------------------------------------------

const oracleDetail: ConnectorDetail = {
  connectorId: "c2",
  syncHistory: buildSyncHistory(2002, 0.06, 480, 1120),
  freshnessPct: 96.8,
  errorRatePct: 1.2,
  recordsToday: 908,
  avgLatencyMs: 1_120,
  lineage: [
    { category: "purchased_goods", scope: 3, records: 4_220, description: "AP invoices — procurement" },
    { category: "upstream_transport", scope: 3, records: 620, description: "AP invoices — logistics" },
    { category: "waste", scope: 3, records: 84, description: "AP invoices — waste vendors" },
  ],
  activity: [
    { at: minutesAgo(14), event: "Sync cycle completed", records: 88, ok: true },
    { at: hoursAgo(1.2), event: "Invoice delta", records: 142, ok: true },
    { at: hoursAgo(2.2), event: "PO refresh", records: 34, ok: true },
    { at: hoursAgo(3.2), event: "Connection retry", records: 0, ok: false, detail: "Gateway 504 — retry succeeded on 2nd attempt" },
    { at: hoursAgo(4.2), event: "GL balance pull", records: 912, ok: true },
    { at: hoursAgo(5.2), event: "Supplier sync", records: 28, ok: true },
  ],
  erpMappings: [
    { gl: "5010-100", desc: "Merchandise COGS", category: "purchased_goods", scope: 3, records: 1_820, confidence: 0.89 },
    { gl: "5020-100", desc: "Food & beverage stock", category: "purchased_goods", scope: 3, records: 2_400, confidence: 0.92 },
    { gl: "6100-200", desc: "Logistics — inbound", category: "upstream_transport", scope: 3, records: 620, confidence: 0.94 },
    { gl: "6210-100", desc: "Waste disposal", category: "waste", scope: 3, records: 84, confidence: 0.96 },
    { gl: "7800-300", desc: "Groundskeeping supplies", category: "purchased_goods", scope: 3, records: 412, confidence: 0.85 },
    { gl: "9000-000", desc: "Misc — unclassified", category: "purchased_goods", scope: 3, records: 48, confidence: 0.48, override: true },
  ],
};

// -----------------------------------------------------------------------
// Workday HCM — HR detail (simplified ERP hero)
// -----------------------------------------------------------------------

const workdayDetail: ConnectorDetail = {
  connectorId: "c3",
  syncHistory: buildSyncHistory(3003, 0.02, 18, 280),
  freshnessPct: 99.8,
  errorRatePct: 0.1,
  recordsToday: 12,
  avgLatencyMs: 280,
  lineage: [
    { category: "business_travel", scope: 3, records: 280, description: "T&E expense categories" },
    { category: "commuting", scope: 3, records: 140, description: "Commuting survey (quarterly)" },
  ],
  activity: [
    { at: hoursAgo(1), event: "Headcount snapshot", records: 420, ok: true },
    { at: hoursAgo(13), event: "T&E sync", records: 88, ok: true },
    { at: hoursAgo(25), event: "Location master refresh", records: 4, ok: true },
    { at: hoursAgo(37), event: "Commuting survey import", records: 140, ok: true, detail: "Q4 FY25 survey, 33% response" },
  ],
  erpMappings: [
    { gl: "TE-AIR", desc: "Air travel", category: "business_travel", scope: 3, records: 142, confidence: 0.98 },
    { gl: "TE-RAIL", desc: "Rail travel", category: "business_travel", scope: 3, records: 88, confidence: 0.99 },
    { gl: "TE-HOTEL", desc: "Hotel nights", category: "business_travel", scope: 3, records: 204, confidence: 0.97 },
    { gl: "TE-MILE", desc: "Personal mileage", category: "business_travel", scope: 3, records: 96, confidence: 0.95 },
    { gl: "COMM-SURVEY", desc: "Commuting (surveyed)", category: "commuting", scope: 3, records: 140, confidence: 0.72 },
  ],
};

// -----------------------------------------------------------------------
// Stadium BMS — rich IoT detail
// -----------------------------------------------------------------------

const bmsDetail: ConnectorDetail = {
  connectorId: "c5",
  syncHistory: buildSyncHistory(5005, 0.01, 36_000, 120),
  freshnessPct: 99.6,
  errorRatePct: 0.2,
  recordsToday: 642_880,
  avgLatencyMs: 1_400,
  lineage: [
    { category: "electricity", scope: 2, records: 480_120, description: "HVAC + lighting sub-metering" },
    { category: "stationary_combustion", scope: 1, records: 24_400, description: "Gas — pitch heating + kitchens" },
    { category: "refrigerants", scope: 1, records: 128, description: "Leak sensors on chiller plant" },
  ],
  activity: [
    { at: minutesAgo(1), event: "Stream heartbeat", records: 214, ok: true, detail: "All points reporting" },
    { at: minutesAgo(3), event: "Point discovery", records: 0, ok: true, detail: "Scan complete — no new points" },
    { at: minutesAgo(22), event: "Chiller-2 runtime alert", records: 0, ok: true, detail: "Runtime 94% over 6h (>90% threshold)" },
    { at: minutesAgo(47), event: "Gap recovered", records: 1_240, ok: true, detail: "Backfill for AHU-3 (7m gap)" },
    { at: minutesAgo(94), event: "Stream heartbeat", records: 214, ok: true },
  ],
  iotPoints: [
    {
      group: "HVAC",
      subGroup: "Chiller plant",
      points: [
        { tag: "CH-1/Supply-Temp", unit: "°C", lastValue: 6.2, lastAt: minutesAgo(0.2), min: 4.8, max: 7.9, stream: buildStream(101, 6.2, 0.9) },
        { tag: "CH-1/Power-kW", unit: "kW", lastValue: 184, lastAt: minutesAgo(0.2), min: 48, max: 220, stream: buildStream(102, 184, 40) },
        { tag: "CH-2/Supply-Temp", unit: "°C", lastValue: 6.8, lastAt: minutesAgo(0.2), min: 5.2, max: 8.1, stream: buildStream(103, 6.8, 1.1) },
        { tag: "CH-2/Power-kW", unit: "kW", lastValue: 201, lastAt: minutesAgo(0.2), min: 52, max: 240, stream: buildStream(104, 201, 48) },
      ],
    },
    {
      group: "HVAC",
      subGroup: "AHUs",
      points: [
        { tag: "AHU-1/Fan-kW", unit: "kW", lastValue: 12.4, lastAt: minutesAgo(0.2), min: 3.2, max: 18.0, stream: buildStream(201, 12.4, 3.2) },
        { tag: "AHU-2/Fan-kW", unit: "kW", lastValue: 10.8, lastAt: minutesAgo(0.2), min: 2.8, max: 15.4, stream: buildStream(202, 10.8, 2.9) },
        { tag: "AHU-3/Fan-kW", unit: "kW", lastValue: 14.2, lastAt: minutesAgo(0.2), min: 4.1, max: 19.8, stream: buildStream(203, 14.2, 3.6) },
      ],
    },
    {
      group: "Lighting",
      subGroup: "Floodlights",
      points: [
        { tag: "FL-Tower-N/kW", unit: "kW", lastValue: 0, lastAt: minutesAgo(0.2), min: 0, max: 260, stream: buildStream(301, 0, 0) },
        { tag: "FL-Tower-S/kW", unit: "kW", lastValue: 0, lastAt: minutesAgo(0.2), min: 0, max: 260, stream: buildStream(302, 0, 0) },
        { tag: "FL-Tower-E/kW", unit: "kW", lastValue: 0, lastAt: minutesAgo(0.2), min: 0, max: 260, stream: buildStream(303, 0, 0) },
        { tag: "FL-Tower-W/kW", unit: "kW", lastValue: 0, lastAt: minutesAgo(0.2), min: 0, max: 260, stream: buildStream(304, 0, 0) },
      ],
    },
    {
      group: "Lighting",
      subGroup: "Concourse",
      points: [
        { tag: "CC-North/kW", unit: "kW", lastValue: 18.4, lastAt: minutesAgo(0.2), min: 6.2, max: 32.0, stream: buildStream(401, 18.4, 5.8) },
        { tag: "CC-South/kW", unit: "kW", lastValue: 17.1, lastAt: minutesAgo(0.2), min: 5.8, max: 30.4, stream: buildStream(402, 17.1, 5.2) },
      ],
    },
    {
      group: "Pitch",
      subGroup: "Undersoil heating",
      points: [
        { tag: "USH/Flow-Temp", unit: "°C", lastValue: 32.4, lastAt: minutesAgo(0.2), min: 22.0, max: 48.0, stream: buildStream(501, 32.4, 4.4) },
        { tag: "USH/Gas-kW", unit: "kW", lastValue: 108, lastAt: minutesAgo(0.2), min: 0, max: 380, stream: buildStream(502, 108, 48) },
      ],
    },
    {
      group: "Kitchens",
      subGroup: "Hospitality",
      points: [
        { tag: "KIT-Main/Gas-kW", unit: "kW", lastValue: 42, lastAt: minutesAgo(0.2), min: 2, max: 118, stream: buildStream(601, 42, 22) },
        { tag: "KIT-Main/Elec-kW", unit: "kW", lastValue: 58, lastAt: minutesAgo(0.2), min: 8, max: 128, stream: buildStream(602, 58, 24) },
        { tag: "KIT-Fridge-kW", unit: "kW", lastValue: 22, lastAt: minutesAgo(0.2), min: 16, max: 32, stream: buildStream(603, 22, 3.2) },
      ],
    },
  ],
};

// -----------------------------------------------------------------------
// Smart Meters (MPAN) — IoT detail with UK format
// -----------------------------------------------------------------------

const mpanDetail: ConnectorDetail = {
  connectorId: "c6",
  syncHistory: buildSyncHistory(6006, 0.03, 432, 340),
  freshnessPct: 98.1,
  errorRatePct: 0.5,
  recordsToday: 432,
  avgLatencyMs: 340,
  lineage: [
    { category: "electricity", scope: 2, records: 192_000, description: "HH consumption across 2 electricity MPANs" },
    { category: "stationary_combustion", scope: 1, records: 70_800, description: "HH gas consumption (MPRN)" },
  ],
  activity: [
    { at: minutesAgo(1), event: "HH interval received", records: 3, ok: true, detail: "01-801-100-420-2104-12" },
    { at: minutesAgo(31), event: "HH interval received", records: 3, ok: true },
    { at: minutesAgo(61), event: "HH interval received", records: 3, ok: true },
    { at: minutesAgo(72), event: "Gap detected", records: 0, ok: false, detail: "01-801-100-420-2104-13 missed HH17" },
    { at: minutesAgo(74), event: "Gap backfilled", records: 1, ok: true, detail: "Upstream DCC catch-up" },
    { at: minutesAgo(91), event: "HH interval received", records: 3, ok: true },
  ],
  mpanMeters: [
    {
      mpan: "01-801-100-420-2104-12",
      kind: "electricity",
      facility: "Gtech Community Stadium — main incomer",
      tariff: "TOU — Day/Night/Peak",
      lastReading: 421.8,
      lastReadingAt: minutesAgo(1),
      last48h: buildStream(7701, 380, 120, 48),
    },
    {
      mpan: "01-801-100-420-2104-13",
      kind: "electricity",
      facility: "Gtech Community Stadium — hospitality",
      tariff: "TOU — Day/Night/Peak",
      lastReading: 188.4,
      lastReadingAt: minutesAgo(1),
      last48h: buildStream(7702, 160, 62, 48),
    },
    {
      mpan: "02-801-100-420-2104-08",
      kind: "gas",
      facility: "Gtech Community Stadium — gas MPRN",
      tariff: "Non-daily read (NDM)",
      lastReading: 644.1,
      lastReadingAt: minutesAgo(1),
      last48h: buildStream(7703, 520, 180, 48),
    },
  ],
};

// -----------------------------------------------------------------------
// Utility bills — Document hero (review queue)
// -----------------------------------------------------------------------

const utilityBillsDetail: ConnectorDetail = {
  connectorId: "c7",
  syncHistory: buildSyncHistory(7007, 0.00, 3, 4_200),
  freshnessPct: 92.4,
  errorRatePct: 0.0,
  recordsToday: 3,
  avgLatencyMs: 4_200,
  lineage: [
    { category: "electricity", scope: 2, records: 84, description: "Monthly supplier bills — all UK sites" },
    { category: "stationary_combustion", scope: 1, records: 36, description: "Gas supplier bills" },
    { category: "water", scope: 3, records: 28, description: "Water utility bills" },
  ],
  activity: [
    { at: hoursAgo(8), event: "Ingest", records: 3, ok: true, detail: "Email forward · 3 PDFs received" },
    { at: hoursAgo(8), event: "Extraction", records: 3, ok: true, detail: "Avg confidence 94.2%" },
    { at: hoursAgo(32), event: "Ingest", records: 2, ok: true, detail: "Email forward · 2 PDFs received" },
    { at: hoursAgo(56), event: "Auto-approve", records: 5, ok: true, detail: "Confidence ≥95% threshold" },
    { at: hoursAgo(80), event: "Template learned", records: 0, ok: true, detail: "Meridian Energy — new layout absorbed" },
  ],
  docQueue: [
    {
      id: "d1", supplier: "Meridian Energy Supply", period: "Mar 2025", total: 13_063, confidence: 0.98, status: "pending",
      kind: "electricity", filename: "meridian-mar25-RVS-01.pdf",
      fields: [
        { key: "supplier", label: "Supplier", value: "Meridian Energy Supply", conf: 0.99 },
        { key: "mpan", label: "MPAN", value: "01-801-100-420-2104-12", conf: 0.99 },
        { key: "period_start", label: "Period start", value: "01 Mar 2025", conf: 0.98 },
        { key: "period_end", label: "Period end", value: "31 Mar 2025", conf: 0.98 },
        { key: "kwh", label: "Consumption (kWh)", value: "38,420", conf: 0.99 },
        { key: "rate", label: "Unit rate (£/kWh)", value: "0.34", conf: 0.96 },
        { key: "cost_ex_vat", label: "Cost (ex VAT)", value: "£13,063", conf: 0.99 },
        { key: "standing", label: "Standing charge", value: "£12.40", conf: 0.94 },
      ],
    },
    {
      id: "d2", supplier: "Severn Trent", period: "Q1 2025", total: 2_840, confidence: 0.88, status: "pending",
      kind: "water", filename: "severntrent-q1-25.pdf",
      fields: [
        { key: "supplier", label: "Supplier", value: "Severn Trent", conf: 0.99 },
        { key: "m3", label: "Consumption (m³)", value: "1,042", conf: 0.92 },
        { key: "period", label: "Billing period", value: "Jan–Mar 2025", conf: 0.95 },
        { key: "cost", label: "Cost (ex VAT)", value: "£2,840", conf: 0.94 },
        { key: "account", label: "Account number", value: "6704-NF-01", conf: 0.62 },
      ],
    },
    {
      id: "d3", supplier: "Cadent Gas", period: "Feb 2025", total: 8_420, confidence: 0.95, status: "pending",
      kind: "gas", filename: "cadent-feb25.pdf",
      fields: [
        { key: "supplier", label: "Supplier", value: "Cadent Gas", conf: 0.99 },
        { key: "mprn", label: "MPRN", value: "9842104708", conf: 0.97 },
        { key: "kwh", label: "Gas (kWh)", value: "46,040", conf: 0.98 },
        { key: "rate", label: "Unit rate", value: "0.083 £/kWh", conf: 0.93 },
        { key: "cost", label: "Cost (ex VAT)", value: "£8,420", conf: 0.97 },
      ],
    },
    {
      id: "d4", supplier: "Meridian Energy Supply", period: "Feb 2025", total: 11_204, confidence: 0.97, status: "approved",
      kind: "electricity", filename: "meridian-feb25-RVS-01.pdf",
      fields: [
        { key: "kwh", label: "Consumption", value: "32,955 kWh", conf: 0.99 },
        { key: "cost", label: "Cost (ex VAT)", value: "£11,204", conf: 0.98 },
        { key: "rate", label: "Rate", value: "0.34 £/kWh", conf: 0.97 },
      ],
    },
    {
      id: "d5", supplier: "Pennon Water", period: "Q4 2024", total: 2_102, confidence: 0.72, status: "rejected",
      kind: "water", filename: "pennon-q4-24.pdf",
      fields: [
        { key: "total", label: "Cost", value: "£2,102", conf: 0.72 },
        { key: "m3", label: "Consumption", value: "?? m³", conf: 0.21 },
      ],
    },
  ],
};

// -----------------------------------------------------------------------
// Freight invoices — Document hero
// -----------------------------------------------------------------------

const freightDetail: ConnectorDetail = {
  connectorId: "c8",
  syncHistory: buildSyncHistory(8008, 0.01, 2, 3_800),
  freshnessPct: 88.2,
  errorRatePct: 0.4,
  recordsToday: 2,
  avgLatencyMs: 3_800,
  lineage: [
    { category: "upstream_transport", scope: 3, records: 62, description: "Inbound freight invoices" },
  ],
  activity: [
    { at: minutesAgo(2), event: "Extraction in progress", records: 1, ok: true, detail: "DHL-INV-20841.pdf" },
    { at: hoursAgo(4), event: "Ingest", records: 2, ok: true },
    { at: hoursAgo(28), event: "Ingest", records: 4, ok: true },
    { at: hoursAgo(72), event: "Template learned", records: 0, ok: true, detail: "Kuehne+Nagel — layout v2" },
  ],
  docQueue: [
    {
      id: "f1", supplier: "DHL Supply Chain", period: "W16 2025", total: 4_820, confidence: 0.93, status: "pending",
      kind: "road", filename: "DHL-INV-20841.pdf",
      fields: [
        { key: "carrier", label: "Carrier", value: "DHL Supply Chain", conf: 0.99 },
        { key: "origin", label: "Origin", value: "Manchester, UK", conf: 0.95 },
        { key: "dest", label: "Destination", value: "Gtech Community Stadium, London", conf: 0.98 },
        { key: "weight", label: "Weight (kg)", value: "2,420", conf: 0.96 },
        { key: "distance", label: "Distance (km)", value: "322", conf: 0.88 },
        { key: "mode", label: "Mode", value: "Road — FTL", conf: 0.94 },
        { key: "cost", label: "Cost", value: "£4,820", conf: 0.98 },
      ],
    },
    {
      id: "f2", supplier: "Kuehne+Nagel", period: "W16 2025", total: 12_400, confidence: 0.89, status: "pending",
      kind: "air", filename: "K+N-AWB-88201.pdf",
      fields: [
        { key: "carrier", label: "Carrier", value: "Kuehne+Nagel", conf: 0.99 },
        { key: "origin", label: "Origin", value: "HKG (Hong Kong)", conf: 0.97 },
        { key: "dest", label: "Destination", value: "LHR (London Heathrow)", conf: 0.98 },
        { key: "weight", label: "Weight (kg)", value: "680", conf: 0.94 },
        { key: "mode", label: "Mode", value: "Air — scheduled", conf: 0.96 },
        { key: "cost", label: "Cost", value: "£12,400", conf: 0.97 },
      ],
    },
    {
      id: "f3", supplier: "DPD", period: "W15 2025", total: 380, confidence: 0.98, status: "approved",
      kind: "courier", filename: "DPD-w15-consolidated.pdf",
      fields: [
        { key: "parcels", label: "Parcels", value: "84", conf: 0.99 },
        { key: "weight", label: "Total weight", value: "128 kg", conf: 0.96 },
        { key: "cost", label: "Cost", value: "£380", conf: 0.99 },
      ],
    },
  ],
};

// -----------------------------------------------------------------------
// CSV/Excel uploads — File hero
// -----------------------------------------------------------------------

const fileDetail: ConnectorDetail = {
  connectorId: "c9",
  syncHistory: buildSyncHistory(9009, 0.0, 0, 0),
  freshnessPct: 100,
  errorRatePct: 0.0,
  recordsToday: 0,
  avgLatencyMs: 0,
  lineage: [
    { category: "fan_travel", scope: 3, records: 1_204, description: "Matchday fan travel survey" },
    { category: "waste", scope: 3, records: 640, description: "Waste vendor monthly reports" },
    { category: "commuting", scope: 3, records: 260, description: "Staff commuting survey" },
  ],
  activity: [
    { at: hoursAgo(26), event: "Upload", records: 1_204, ok: true, detail: "fan-travel-survey-mar25.xlsx" },
    { at: hoursAgo(50), event: "Upload", records: 42, ok: true, detail: "biffa-waste-mar25.csv" },
    { at: hoursAgo(74), event: "Validation failed", records: 0, ok: false, detail: "Date column parse error rows 12, 18, 42" },
    { at: hoursAgo(98), event: "Upload", records: 260, ok: true, detail: "commuting-q4-24.csv" },
  ],
  fileUploads: [
    {
      id: "u1", filename: "fan-travel-survey-mar25.xlsx", rows: 1_204, flagged: 18, at: hoursAgo(26), user: "I. Karimov", template: "fan_travel",
      mapping: [
        { source: "Match Date", target: "period", confidence: 0.98 },
        { source: "Postcode", target: "origin_postcode", confidence: 0.99 },
        { source: "Mode", target: "mode", confidence: 0.96 },
        { source: "Distance (miles)", target: "distance_km", confidence: 0.82 },
        { source: "Travellers", target: "party_size", confidence: 0.94 },
      ],
    },
    {
      id: "u2", filename: "biffa-waste-mar25.csv", rows: 42, flagged: 0, at: hoursAgo(50), user: "A. Thorne", template: "waste",
      mapping: [
        { source: "Date", target: "period", confidence: 0.99 },
        { source: "Stream", target: "waste_stream", confidence: 0.99 },
        { source: "Tonnes", target: "tonnes", confidence: 0.99 },
        { source: "Disposal", target: "disposal_method", confidence: 0.95 },
      ],
    },
    {
      id: "u3", filename: "commuting-q4-24.csv", rows: 260, flagged: 4, at: hoursAgo(98), user: "R. Okonkwo", template: "commuting",
      mapping: [
        { source: "Employee ID", target: "employee_ref", confidence: 0.99 },
        { source: "Office", target: "facility_id", confidence: 0.96 },
        { source: "Distance km", target: "distance_km", confidence: 0.99 },
        { source: "Primary mode", target: "mode", confidence: 0.98 },
      ],
    },
    {
      id: "u4", filename: "fuel-card-allstar-mar25.csv", rows: 312, flagged: 2, at: hoursAgo(72), user: "A. Thorne", template: "fuel",
      mapping: [
        { source: "Txn date", target: "period", confidence: 0.99 },
        { source: "Vehicle Reg", target: "vehicle_ref", confidence: 0.99 },
        { source: "Litres", target: "activity_value", confidence: 0.98 },
        { source: "Fuel", target: "fuel_type", confidence: 0.99 },
        { source: "Net £", target: "actual_cost", confidence: 0.98 },
      ],
    },
  ],
};

// -----------------------------------------------------------------------
// Index of all details keyed by connector id
// -----------------------------------------------------------------------

export const connectorDetails: Record<string, ConnectorDetail> = {
  c1: sapDetail,
  c2: oracleDetail,
  c3: workdayDetail,
  // c4 is disconnected — no detail until activated
  c5: bmsDetail,
  c6: mpanDetail,
  c7: utilityBillsDetail,
  c8: freightDetail,
  c9: fileDetail,
};

export function detailFor(id: string): ConnectorDetail | undefined {
  return connectorDetails[id];
}

// -----------------------------------------------------------------------
// CSV templates (used in File hero)
// -----------------------------------------------------------------------

export const csvTemplates = [
  {
    key: "energy",
    name: "Energy consumption",
    description: "kWh by facility, period, fuel type — use for manual meter reads.",
    columns: ["period (YYYY-MM)", "facility_id", "fuel_type", "activity_value", "activity_unit", "actual_cost"],
  },
  {
    key: "fuel",
    name: "Fuel & fleet",
    description: "Litres of fuel by vehicle, driver, date — from fuel cards.",
    columns: ["period", "vehicle_ref", "fuel_type", "litres", "actual_cost", "odometer_km"],
  },
  {
    key: "travel",
    name: "Business travel",
    description: "Flights, rail, hotel — from T&E / booking tool exports.",
    columns: ["period", "traveller_ref", "mode", "origin", "destination", "class", "distance_km", "actual_cost"],
  },
  {
    key: "waste",
    name: "Waste streams",
    description: "Tonnes per waste stream with disposal method — from vendor reports.",
    columns: ["period", "facility_id", "waste_stream", "tonnes", "disposal_method", "actual_cost"],
  },
  {
    key: "procurement",
    name: "Procurement spend",
    description: "Supplier spend by commodity — for spend-based Scope 3.1.",
    columns: ["period", "supplier_ref", "commodity_code", "description", "quantity", "uom", "actual_cost"],
  },
];
