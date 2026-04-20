"use client";
import { useState } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  FileText,
  Sparkles,
  Database,
  ChevronDown,
  Paperclip,
  MessageSquare,
  Download,
  FileSpreadsheet,
  FileImage,
  FileCode,
  User2,
  Circle,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

type Attachment = {
  name: string;
  kind: "pdf" | "xlsx" | "csv" | "docx" | "png" | "json";
  size: string;
  preview?: string;
};

type ChainStep = {
  name: string;
  role: string;
  status: "signed" | "next" | "pending";
  at?: string;
  note?: string;
};

type Comment = {
  author: string;
  at: string;
  text: string;
};

type Fact = { label: string; value: string; emphasis?: "moss" | "ember" | "ochre" };

type Approval = {
  id: string;
  type: "report" | "factor" | "methodology" | "initiative";
  title: string;
  requester: string;
  requesterRole: string;
  submitted: string;
  value?: string;
  severity: "routine" | "significant" | "material";
  summary: string;
  context: string;
  facts: Fact[];
  sections?: { heading: string; body: string }[];
  attachments: Attachment[];
  chain: ChainStep[];
  comments: Comment[];
  related?: { label: string; href: string }[];
};

// -----------------------------------------------------------------------
// Data — six pending approvals with rich detail
// -----------------------------------------------------------------------

const PENDING: Approval[] = [
  {
    id: "ap-01",
    type: "report",
    title: "FY25 Interim BRSR Principle 6 — v1.3",
    requester: "Kira Ellis",
    requesterRole: "Head of Sustainability",
    submitted: "2h ago",
    value: "4,183 tCO₂e",
    severity: "material",
    summary:
      "Interim Business Responsibility & Sustainability Report covering Principle 6 (Environment) for the first half of FY25, including Scope 1, 2 and material Scope 3 categories.",
    context:
      "This interim filing is required ahead of the August board meeting. Numbers are provisional pending reasonable assurance from DNV, which is scheduled for week 34. The scope boundary is unchanged from FY24. Three new Scope 3 categories (3.4 Upstream transport, 3.5 Waste, 3.7 Commuting) have been added following the materiality reassessment completed in April.",
    facts: [
      { label: "Period", value: "Jul 2024 – Mar 2025 (9m)" },
      { label: "Total Scope 1", value: "1,240 tCO₂e" },
      { label: "Total Scope 2 (location)", value: "620 tCO₂e" },
      { label: "Total Scope 2 (market)", value: "912 tCO₂e" },
      { label: "Total Scope 3 (mat.)", value: "2,323 tCO₂e", emphasis: "ember" },
      { label: "Grand total", value: "4,183 tCO₂e", emphasis: "ember" },
      { label: "YoY change", value: "−3.8%", emphasis: "moss" },
      { label: "Assurance level", value: "Reasonable (planned)" },
    ],
    sections: [
      {
        heading: "What's new in v1.3",
        body: "Incorporated CDP alignment comments from Marcus Chen; restated Scope 2 market-based value following supplier Guarantee-of-Origin true-up; added narrative on the undersoil pitch heating efficiency programme. All restatements disclosed in Annex B.",
      },
      {
        heading: "Open items",
        body: "Two suppliers (CaterCore, North Star Merch) have yet to return EcoVadis Q1 updates. Values use prior-year factor as a placeholder; variance ±4.2% modelled and within materiality threshold.",
      },
    ],
    attachments: [
      { name: "brsr-p6-interim-v1.3.pdf", kind: "pdf", size: "2.4 MB" },
      { name: "ledger-snapshot-fy25h1.xlsx", kind: "xlsx", size: "1.1 MB" },
      { name: "scope3-calculation-workbook.xlsx", kind: "xlsx", size: "782 KB" },
      { name: "materiality-reassessment-apr25.pdf", kind: "pdf", size: "912 KB" },
      { name: "dnv-assurance-scope-memo.docx", kind: "docx", size: "164 KB" },
    ],
    chain: [
      { name: "Serena Raman", role: "ESG Data Lead", status: "signed", at: "5h ago", note: "Data lineage verified against source connectors." },
      { name: "Marcus Chen", role: "Finance Controller", status: "signed", at: "3h ago", note: "Market-based Scope 2 reconciled to supplier invoices." },
      { name: "Kira Ellis", role: "Head of Sustainability", status: "next" },
      { name: "CFO Office", role: "Final sign-off", status: "pending" },
    ],
    comments: [
      { author: "Marcus Chen", at: "3h ago", text: "Market-based figure now matches GoO certificates exactly — thanks for the fast turnaround." },
      { author: "Serena Raman", at: "5h ago", text: "All Scope 3.4 invoices re-extracted from the freight connector; the upstream transport number is solid." },
    ],
    related: [{ label: "Open report in Builder", href: "/report/builder" }],
  },
  {
    id: "ap-02",
    type: "factor",
    title: "Custom emission factor — Umbrae recycled poly kit",
    requester: "Serena Raman",
    requesterRole: "ESG Data Lead",
    submitted: "6h ago",
    value: "0.412 kgCO₂e/£",
    severity: "significant",
    summary:
      "Proposal to register a supplier-specific spend-based factor for the Umbrae recycled polyester home kit, replacing the DEFRA default textile factor for that product line.",
    context:
      "Umbrae has supplied a verified LCA (ISO 14040/44) covering cradle-to-gate for the 2025 home kit made from 87% recycled PET. Their reported intensity is materially below the DEFRA textile default (0.412 vs 2.180 kgCO₂e/£), consistent with independent benchmarks for r-PET garments. Using the supplier-specific factor would reduce reported Scope 3.1 for merchandise by ~38 tCO₂e in FY25.",
    facts: [
      { label: "Factor proposed", value: "0.412 kgCO₂e/£", emphasis: "moss" },
      { label: "DEFRA default (textiles)", value: "2.180 kgCO₂e/£" },
      { label: "Delta vs default", value: "−81%", emphasis: "moss" },
      { label: "FY25 annual spend covered", value: "£92,400" },
      { label: "FY25 impact on S3.1", value: "−38 tCO₂e", emphasis: "moss" },
      { label: "Methodology", value: "ISO 14040/44 LCA" },
      { label: "Geography", value: "UK" },
      { label: "Validity", value: "2025–2026" },
    ],
    sections: [
      {
        heading: "Why accept",
        body: "Factor is higher quality than the default (tier 4 vs tier 2 per GHG Protocol). Supplier LCA has been independently verified by TÜV SÜD. Reduces Scope 3 estimation error materially.",
      },
      {
        heading: "Why caution",
        body: "Only covers home kit SKU group; training and away kits remain on default factor. Factor must be retired if recycled content falls below the 75% threshold declared by Umbrae.",
      },
    ],
    attachments: [
      { name: "umbrae-lca-homekit-2025.pdf", kind: "pdf", size: "1.8 MB" },
      { name: "tuv-sud-verification-letter.pdf", kind: "pdf", size: "412 KB" },
      { name: "factor-derivation-notes.xlsx", kind: "xlsx", size: "248 KB" },
      { name: "recycled-pet-benchmarks.csv", kind: "csv", size: "18 KB" },
    ],
    chain: [
      { name: "Isra Karimov", role: "Procurement", status: "signed", at: "1d ago", note: "Spend amount confirmed against PO history." },
      { name: "Serena Raman", role: "ESG Data Lead", status: "signed", at: "6h ago", note: "Methodology reviewed; factor derivation sound." },
      { name: "Kira Ellis", role: "Head of Sustainability", status: "next" },
    ],
    comments: [
      { author: "Isra Karimov", at: "1d ago", text: "Umbrae spend FY25 confirmed at £92,400 from the SAP PO extract." },
    ],
    related: [
      { label: "View in Factor Library", href: "/record/factors" },
      { label: "Supplier record", href: "#" },
    ],
  },
  {
    id: "ap-03",
    type: "methodology",
    title: "Switch refrigerant reporting to AR6 GWP values",
    requester: "System (scheduled recommendation)",
    requesterRole: "Policy monitor",
    submitted: "yesterday",
    value: "R-410A: 2088 → 2256",
    severity: "significant",
    summary:
      "Adopt IPCC AR6 (2021) 100-year global warming potential values for fluorinated refrigerants, replacing the AR5 values currently in use. Change is prospective from FY26 with voluntary restatement of FY25.",
    context:
      "DEFRA has aligned its 2024 conversion factors pack with AR6 for refrigerants. Most of our peer clubs have already restated. Switching earlier than mandated demonstrates best-practice methodology selection and avoids a larger single-year step when the move becomes compulsory.",
    facts: [
      { label: "Refrigerant affected", value: "R-410A" },
      { label: "Previous GWP (AR5)", value: "2,088 × CO₂" },
      { label: "New GWP (AR6)", value: "2,256 × CO₂", emphasis: "ember" },
      { label: "Delta", value: "+8.0%", emphasis: "ember" },
      { label: "FY25 refrigerant emissions", value: "42 tCO₂e" },
      { label: "Impact if restated", value: "+3.4 tCO₂e", emphasis: "ember" },
      { label: "% of Scope 1", value: "<0.3%" },
      { label: "Effective from", value: "FY26 Q1 (Jul 2025)" },
    ],
    sections: [
      {
        heading: "Scope of change",
        body: "R-410A is the only refrigerant currently on site (chiller plant × 2 + pitch dehumidifier × 1). Leak-top-ups only; no whole-system recharges in FY25. Also adjusts R-134a factor (+1.4%) which is dormant.",
      },
      {
        heading: "Governance",
        body: "GHG Protocol 2004 allows use of any IPCC Assessment Report provided choice is disclosed and consistent. Disclosure added to methodology annex. Auditor (DNV) pre-approved the switch in the Nov 2024 methodology review.",
      },
    ],
    attachments: [
      { name: "defra-2024-methodology-notes.pdf", kind: "pdf", size: "3.1 MB" },
      { name: "ipcc-ar6-wg1-ch7-supplementary.pdf", kind: "pdf", size: "4.2 MB" },
      { name: "impact-analysis.xlsx", kind: "xlsx", size: "94 KB" },
      { name: "methodology-change-memo.docx", kind: "docx", size: "72 KB" },
    ],
    chain: [
      { name: "System", role: "Automated scan", status: "signed", at: "1d ago", note: "Scheduled policy monitor flagged DEFRA change." },
      { name: "Kira Ellis", role: "Head of Sustainability", status: "next" },
    ],
    comments: [],
    related: [{ label: "Audit trail entry", href: "/govern/audit" }],
  },
  {
    id: "ap-04",
    type: "initiative",
    title: "Approve capex for LED retrofit (opp-01)",
    requester: "Marcus Chen",
    requesterRole: "Finance Controller",
    submitted: "yesterday",
    value: "£1,420,000",
    severity: "material",
    summary:
      "Capital expenditure approval for the stadium-wide LED retrofit covering floodlights, concourse, hospitality and back-of-house lighting circuits. Single-stage installation during FY26 summer break.",
    context:
      "Opportunity opp-01 in the teardown pool. Highest-ROI initiative in the current MAC curve: £1.42M capex, 142 tCO₂e/year abatement, £248k/year energy savings, payback 5.7 years. Vendor selected (Luxeon Pro) via competitive tender. Grant of £80k confirmed from Sport England LED programme.",
    facts: [
      { label: "Gross capex", value: "£1,420,000" },
      { label: "Grant (Sport England)", value: "£80,000", emphasis: "moss" },
      { label: "Net capex", value: "£1,340,000", emphasis: "moss" },
      { label: "Annual savings", value: "£248,000 / yr", emphasis: "moss" },
      { label: "Payback", value: "5.7 years" },
      { label: "Abatement", value: "142 tCO₂e / yr", emphasis: "moss" },
      { label: "MAC cost", value: "−£1,745 / tCO₂e", emphasis: "moss" },
      { label: "Install window", value: "Jun–Jul 2025" },
    ],
    sections: [
      {
        heading: "Capex breakdown",
        body: "Fixtures £842k · Controls & drivers £186k · Installation labour £248k · Scaffolding & access £94k · Contingency 5% £50k. Full BOM in the attached procurement memo.",
      },
      {
        heading: "Risk & mitigation",
        body: "Primary risk is fixture lead time (14-week). Mitigated with 40% deposit on PO placement. Secondary risk is Guest Experience disruption during install — scheduled wholly within close-season window.",
      },
      {
        heading: "Alignment",
        body: "Supports Net Zero 2035 pathway item EN-04. Approved in principle by the Sustainability Committee (Feb 2025 minutes).",
      },
    ],
    attachments: [
      { name: "luxeon-pro-proposal-final.pdf", kind: "pdf", size: "4.8 MB" },
      { name: "capex-business-case.xlsx", kind: "xlsx", size: "612 KB" },
      { name: "tender-eval-summary.pdf", kind: "pdf", size: "1.2 MB" },
      { name: "sport-england-grant-letter.pdf", kind: "pdf", size: "204 KB" },
      { name: "site-survey-report.pdf", kind: "pdf", size: "8.4 MB" },
      { name: "fixture-spec-sheets.pdf", kind: "pdf", size: "2.1 MB" },
      { name: "render-concourse-v2.png", kind: "png", size: "3.6 MB" },
    ],
    chain: [
      { name: "Jess Hartley", role: "Facilities Manager", status: "signed", at: "4d ago", note: "Site survey & install schedule approved." },
      { name: "Marcus Chen", role: "Finance Controller", status: "signed", at: "1d ago", note: "Business case reviewed; returns within policy." },
      { name: "Kira Ellis", role: "Head of Sustainability", status: "next" },
      { name: "Board of Directors", role: "Final sign-off (material)", status: "pending" },
    ],
    comments: [
      { author: "Jess Hartley", at: "4d ago", text: "Luxeon's DALI-2 control plan is a clear step-up from the 2018 system; dimming to 30% for non-event days should lift savings above the 5.7-yr model." },
      { author: "Marcus Chen", at: "1d ago", text: "Net-of-grant IRR 17.8%. Comfortably above our 12% hurdle." },
    ],
    related: [
      { label: "Opportunity card (opp-01)", href: "/reduce/opportunities" },
      { label: "View in MAC curve", href: "/reduce/mac-curve" },
    ],
  },
  {
    id: "ap-05",
    type: "report",
    title: "TCFD 2024 — v1.1 narrative update",
    requester: "CFO Office",
    requesterRole: "CFO's Office",
    submitted: "3d ago",
    value: "Governance section only",
    severity: "routine",
    summary:
      "Minor revision to the TCFD 2024 disclosure — Governance section only. Adds sentences describing the new Sustainability Committee charter approved in March.",
    context:
      "No numbers have changed. Pure narrative amendment reflecting the expanded board oversight structure. Included here to keep the audit trail complete.",
    facts: [
      { label: "Framework", value: "TCFD 2024" },
      { label: "Version", value: "v1.0 → v1.1" },
      { label: "Section changed", value: "Governance (1 of 11 recs)" },
      { label: "Word count delta", value: "+142 words" },
      { label: "Numeric restatements", value: "None" },
    ],
    attachments: [
      { name: "tcfd-2024-v1.1-redline.pdf", kind: "pdf", size: "1.9 MB" },
      { name: "sustainability-committee-charter.pdf", kind: "pdf", size: "320 KB" },
    ],
    chain: [
      { name: "CFO Office", role: "Submitter", status: "signed", at: "3d ago" },
      { name: "Kira Ellis", role: "Head of Sustainability", status: "next" },
    ],
    comments: [],
  },
  {
    id: "ap-06",
    type: "initiative",
    title: "Fleet EV transition — phase 1 (opp-05)",
    requester: "Jess Hartley",
    requesterRole: "Facilities Manager",
    submitted: "3d ago",
    value: "£62,000 capex",
    severity: "routine",
    summary:
      "Phase 1 of the fleet electrification programme — replacing 4 grounds-maintenance vehicles with BEV equivalents and installing 6 × 22 kW chargers at the training ground.",
    context:
      "Pilot phase of a 5-year plan. Vehicles identified as lowest-utilisation (<40 km/day) making them ideal for the initial switch. Charger installation coordinated with the concurrent training-ground solar car-port project (separate approval, ap-09).",
    facts: [
      { label: "Vehicles", value: "4 × BEV vans" },
      { label: "Chargers", value: "6 × 22 kW AC" },
      { label: "Total capex", value: "£62,000" },
      { label: "Annual savings", value: "£8,400 / yr", emphasis: "moss" },
      { label: "Payback", value: "7.4 years" },
      { label: "Abatement", value: "18 tCO₂e / yr", emphasis: "moss" },
      { label: "Delivery", value: "Aug 2025" },
    ],
    attachments: [
      { name: "bev-vehicle-spec.pdf", kind: "pdf", size: "1.1 MB" },
      { name: "charger-quote-chargepoint.pdf", kind: "pdf", size: "620 KB" },
      { name: "tco-analysis.xlsx", kind: "xlsx", size: "94 KB" },
    ],
    chain: [
      { name: "Jess Hartley", role: "Facilities Manager", status: "signed", at: "3d ago" },
      { name: "Marcus Chen", role: "Finance Controller", status: "next" },
      { name: "Kira Ellis", role: "Head of Sustainability", status: "pending" },
    ],
    comments: [],
    related: [{ label: "Opportunity card (opp-05)", href: "/reduce/opportunities" }],
  },
];

const TYPE_META = {
  report: { icon: FileText, label: "Report", color: "ember" as const },
  factor: { icon: Sparkles, label: "Factor", color: "ochre" as const },
  methodology: { icon: Database, label: "Methodology", color: "slate" as const },
  initiative: { icon: CheckCircle2, label: "Initiative", color: "moss" as const },
};

const FILE_ICONS = {
  pdf: FileText,
  xlsx: FileSpreadsheet,
  csv: FileSpreadsheet,
  docx: FileText,
  png: FileImage,
  json: FileCode,
};

// -----------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------

export default function ApprovalsPage() {
  const [decided, setDecided] = useState<Record<string, "approved" | "rejected">>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="px-8 py-10 space-y-8">
      <SectionHeader
        eyebrow="Govern · Approvals"
        title="Nothing ships without a signature."
        description="A routed queue of pending decisions. Click any item to open the full submission — context, facts, attachments, and the approval chain. Every decision writes to the audit trail with actor, timestamp, and justification."
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-0 divide-x divide-rule border-y border-rule py-6">
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">Pending</div>
          <div className="display-number text-3xl">
            {PENDING.length - Object.keys(decided).length}
          </div>
        </div>
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">
            Material items
          </div>
          <div className="display-number text-3xl text-ember">
            {
              PENDING.filter((p) => p.severity === "material" && !decided[p.id])
                .length
            }
          </div>
        </div>
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">Avg wait</div>
          <div className="display-number text-3xl">
            18<span className="text-base text-ink-muted">h</span>
          </div>
        </div>
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">SLA breach</div>
          <div className="display-number text-3xl text-moss">0</div>
        </div>
      </div>

      <div className="space-y-3">
        {PENDING.map((p) => {
          const d = decided[p.id];
          const expanded = expandedId === p.id;
          const meta = TYPE_META[p.type];
          const Icon = meta.icon;

          return (
            <article
              key={p.id}
              className={cn(
                "bg-paper-soft border transition-colors",
                d === "approved" && "border-moss/40 bg-moss-faint/30",
                d === "rejected" && "border-ember/40 bg-ember-faint/30",
                !d && expanded && "border-ink-muted",
                !d && !expanded && "border-rule hover:border-ink-muted"
              )}
            >
              {/* Header — the clickable bit */}
              <button
                type="button"
                onClick={() => toggle(p.id)}
                className="w-full text-left p-5 focus:outline-none focus-visible:bg-paper-warm"
                aria-expanded={expanded}
                aria-controls={`detail-${p.id}`}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div
                      className={cn(
                        "w-10 h-10 flex items-center justify-center shrink-0 border",
                        meta.color === "ember" && "bg-ember-faint text-ember border-ember/30",
                        meta.color === "moss" && "bg-moss-faint text-moss border-moss/30",
                        meta.color === "ochre" && "bg-ochre-faint text-ochre border-ochre/30",
                        meta.color === "slate" && "bg-slate-faint text-slate border-slate/30"
                      )}
                    >
                      <Icon className="w-4 h-4" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant={meta.color}>{meta.label}</Badge>
                        <Badge
                          variant={
                            p.severity === "material"
                              ? "ember"
                              : p.severity === "significant"
                              ? "ochre"
                              : "outline"
                          }
                        >
                          {p.severity}
                        </Badge>
                        {p.attachments.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-ink-muted font-mono">
                            <Paperclip className="w-3 h-3" strokeWidth={1.5} />
                            {p.attachments.length}
                          </span>
                        )}
                        {p.comments.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-ink-muted font-mono">
                            <MessageSquare className="w-3 h-3" strokeWidth={1.5} />
                            {p.comments.length}
                          </span>
                        )}
                      </div>
                      <h3 className="font-display text-lg leading-snug mb-1">
                        {p.title}
                      </h3>
                      <div className="text-xs text-ink-muted font-mono">
                        {p.requester} · Submitted {p.submitted}
                        {p.value && ` · ${p.value}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {d ? (
                      <Badge variant={d === "approved" ? "moss" : "ember"}>
                        {d === "approved" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {d === "approved" ? "Approved" : "Rejected"}
                      </Badge>
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider text-ink-muted font-mono">
                        {expanded ? "Hide detail" : "View detail"}
                      </span>
                    )}
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-ink-muted transition-transform duration-200",
                        expanded && "rotate-180"
                      )}
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
              </button>

              {/* Expanded detail */}
              {expanded && (
                <div
                  id={`detail-${p.id}`}
                  className="border-t border-rule bg-paper animate-fade-in"
                >
                  <DetailBody approval={p} />

                  {/* Decision footer (re-surfaced in expansion) */}
                  {!d && (
                    <div className="border-t border-rule px-6 py-4 flex items-center justify-between gap-4 bg-paper-soft">
                      <div className="text-[11px] text-ink-muted font-mono">
                        Decision will be recorded in audit trail with your name and
                        justification.
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setDecided((prev) => ({ ...prev, [p.id]: "rejected" }))
                          }
                        >
                          <XCircle className="w-3 h-3" />
                          Reject
                        </Button>
                        <Button
                          variant="moss"
                          size="sm"
                          onClick={() =>
                            setDecided((prev) => ({ ...prev, [p.id]: "approved" }))
                          }
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// Detail body
// -----------------------------------------------------------------------

function DetailBody({ approval }: { approval: Approval }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-rule">
      {/* Main column — summary, facts, sections, attachments */}
      <div className="lg:col-span-2 p-6 space-y-6 min-w-0">
        {/* Summary */}
        <section>
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">
            Summary
          </div>
          <p className="text-sm text-ink leading-relaxed">{approval.summary}</p>
        </section>

        {/* Context */}
        <section>
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">
            Context
          </div>
          <p className="text-sm text-ink-soft leading-relaxed">{approval.context}</p>
        </section>

        {/* Facts grid */}
        <section>
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">
            Key facts
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-rule bg-paper-soft divide-x divide-rule">
            {approval.facts.map((f, i) => (
              <div
                key={i}
                className={cn(
                  "p-3",
                  i >= 4 && "border-t border-rule",
                  // break grid lines on new row for md
                  i % 4 === 0 && "md:border-l-0"
                )}
              >
                <div className="text-[10px] uppercase tracking-widest text-ink-muted">
                  {f.label}
                </div>
                <div
                  className={cn(
                    "display-number text-base mt-1 tabular",
                    f.emphasis === "moss" && "text-moss",
                    f.emphasis === "ember" && "text-ember",
                    f.emphasis === "ochre" && "text-ochre"
                  )}
                >
                  {f.value}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Narrative sections */}
        {approval.sections && approval.sections.length > 0 && (
          <section className="space-y-4">
            {approval.sections.map((s, i) => (
              <div key={i} className="border-l-2 border-rule pl-4">
                <div className="font-display text-base tracking-tight mb-1">
                  {s.heading}
                </div>
                <p className="text-sm text-ink-soft leading-relaxed">{s.body}</p>
              </div>
            ))}
          </section>
        )}

        {/* Attachments */}
        <section>
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2 flex items-center gap-2">
            <Paperclip className="w-3 h-3" strokeWidth={1.5} />
            Attachments · {approval.attachments.length}
          </div>
          {approval.attachments.length === 0 ? (
            <div className="text-xs text-ink-muted italic border border-rule bg-paper-soft p-4">
              No files attached.
            </div>
          ) : (
            <ul className="border border-rule bg-paper divide-y divide-rule">
              {approval.attachments.map((a, i) => {
                const FIcon = FILE_ICONS[a.kind];
                return (
                  <li
                    key={i}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-paper-warm transition-colors group"
                  >
                    <div className="w-8 h-8 bg-paper-warm border border-rule flex items-center justify-center shrink-0">
                      <FIcon
                        className="w-3.5 h-3.5 text-ink-muted"
                        strokeWidth={1.25}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-mono truncate">{a.name}</div>
                      <div className="text-[10px] text-ink-muted uppercase tracking-wider font-mono">
                        {a.kind} · {a.size}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 gap-1 opacity-60 group-hover:opacity-100 transition-opacity"
                      >
                        <ExternalLink
                          className="w-3 h-3"
                          strokeWidth={1.5}
                        />
                        <span className="text-[10px] uppercase tracking-wider">
                          Preview
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 gap-1 opacity-60 group-hover:opacity-100 transition-opacity"
                      >
                        <Download className="w-3 h-3" strokeWidth={1.5} />
                        <span className="text-[10px] uppercase tracking-wider">
                          Download
                        </span>
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Related links */}
        {approval.related && approval.related.length > 0 && (
          <section>
            <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">
              Related
            </div>
            <div className="flex flex-wrap gap-2">
              {approval.related.map((r, i) => (
                <a
                  key={i}
                  href={r.href}
                  className="inline-flex items-center gap-1.5 text-xs text-ink-soft hover:text-ink border border-rule bg-paper px-3 py-1.5 hover:bg-paper-warm transition-colors"
                >
                  {r.label}
                  <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sidebar — requester, approval chain, comments */}
      <aside className="p-6 space-y-6 bg-paper-soft/50">
        {/* Requester */}
        <section>
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">
            Submitted by
          </div>
          <div className="flex items-start gap-3 border border-rule bg-paper p-3">
            <div className="w-8 h-8 bg-ochre-faint border border-ochre/30 flex items-center justify-center text-[11px] font-mono font-medium text-ochre shrink-0">
              {initials(approval.requester)}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">
                {approval.requester}
              </div>
              <div className="text-[10px] text-ink-muted truncate">
                {approval.requesterRole}
              </div>
              <div className="text-[10px] text-ink-faint font-mono mt-0.5">
                {approval.submitted}
              </div>
            </div>
          </div>
        </section>

        {/* Approval chain */}
        <section>
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">
            Approval chain
          </div>
          <ol className="border border-rule bg-paper">
            {approval.chain.map((c, i) => {
              const isLast = i === approval.chain.length - 1;
              return (
                <li
                  key={i}
                  className={cn(
                    "relative flex items-start gap-3 px-3 py-3",
                    !isLast && "border-b border-rule"
                  )}
                >
                  <div className="shrink-0 pt-0.5">
                    {c.status === "signed" ? (
                      <CheckCircle2
                        className="w-4 h-4 text-moss"
                        strokeWidth={1.5}
                      />
                    ) : c.status === "next" ? (
                      <span className="relative inline-flex w-4 h-4 items-center justify-center">
                        <span className="absolute inset-0 rounded-full bg-ochre/20" />
                        <span className="w-2 h-2 rounded-full bg-ochre animate-pulse" />
                      </span>
                    ) : (
                      <Circle
                        className="w-4 h-4 text-ink-faint"
                        strokeWidth={1.5}
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{c.name}</div>
                    <div className="text-[10px] text-ink-muted truncate">
                      {c.role}
                    </div>
                    {c.at && (
                      <div className="text-[10px] text-ink-faint font-mono mt-0.5">
                        {c.status === "signed"
                          ? `Signed ${c.at}`
                          : c.at}
                      </div>
                    )}
                    {c.note && (
                      <div className="text-[11px] text-ink-soft italic mt-1 leading-snug">
                        &ldquo;{c.note}&rdquo;
                      </div>
                    )}
                    {c.status === "next" && (
                      <div className="text-[10px] text-ochre uppercase tracking-wider font-mono mt-0.5">
                        Awaiting action
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Comments */}
        <section>
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2 flex items-center gap-2">
            <MessageSquare className="w-3 h-3" strokeWidth={1.5} />
            Discussion · {approval.comments.length}
          </div>
          {approval.comments.length === 0 ? (
            <div className="text-xs text-ink-muted italic border border-rule bg-paper p-3">
              No comments yet.
            </div>
          ) : (
            <ul className="space-y-2">
              {approval.comments.map((c, i) => (
                <li key={i} className="border border-rule bg-paper p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <User2
                      className="w-3 h-3 text-ink-muted"
                      strokeWidth={1.5}
                    />
                    <span className="text-[11px] font-medium">{c.author}</span>
                    <span className="text-[10px] text-ink-faint font-mono ml-auto">
                      {c.at}
                    </span>
                  </div>
                  <p className="text-xs text-ink-soft leading-relaxed">
                    {c.text}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </aside>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}
