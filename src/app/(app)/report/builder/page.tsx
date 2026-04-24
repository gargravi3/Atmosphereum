"use client";
import { useState } from "react";
import {
  Sparkles,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Download,
  RotateCcw,
  Eye,
  Play,
} from "lucide-react";
import { frameworks } from "@/lib/fixtures";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fmt, cn } from "@/lib/utils";

const BRSR_SECTIONS = [
  {
    id: "P6.Q1",
    title: "Energy consumption by source",
    data: [
      { label: "Electricity (kWh)", value: "6,432,800", verified: true },
      { label: "Natural gas (kWh)", value: "1,884,420", verified: true },
      { label: "Diesel (litres)", value: "28,440", verified: true },
      { label: "Petrol (litres)", value: "12,200", verified: true },
      { label: "Renewable share", value: "12.8%", verified: false },
    ],
    narrativeChunks: [
      "During FY25, Brentford FC consumed 8.3 GWh of energy across its operational facilities. ",
      "Electricity accounted for 77% of total energy by delivered amount, with the Gtech Community Stadium dominating usage at 72% of site-level demand — driven predominantly by matchday floodlighting, hospitality HVAC, and refrigeration. ",
      "Natural gas contributed 23% and remains concentrated in stadium space heating. Fleet fuels made up a small but material 4% tail, mostly diesel for pitch equipment. ",
      "Renewable-sourced electricity covered 12.8% of supply under our current tariff; a corporate PPA signed in March 2025 is projected to raise this to 100% of Scope 2 from August 2025 forward.",
    ],
  },
  {
    id: "P6.Q2",
    title: "Scope 1 & 2 GHG emissions",
    data: [
      { label: "Scope 1 (tCO₂e)", value: "380.2", verified: true },
      { label: "Scope 2 location-based (tCO₂e)", value: "1,332.1", verified: true },
      { label: "Scope 2 market-based (tCO₂e)", value: "1,486.8", verified: true },
      { label: "Scope 1+2 intensity (tCO₂e/£M)", value: "10.2", verified: true },
    ],
    narrativeChunks: [
      "Total Scope 1 and Scope 2 (location-based) emissions for FY25 were 1,712 tCO₂e, a 6.8% reduction versus FY24. ",
      "Scope 1 emissions (380 tCO₂e) were driven by stationary combustion of natural gas and mobile combustion from the operational fleet. ",
      "Scope 2 emissions (1,332 tCO₂e location-based) reflect the UK grid intensity of 0.20705 kgCO₂e/kWh (DEFRA 2023). ",
      "We report both location- and market-based Scope 2 to comply with the GHG Protocol's dual reporting requirement.",
    ],
  },
  {
    id: "P6.Q3",
    title: "Emission intensity",
    data: [
      { label: "Revenue (£M)", value: "168.0", verified: true },
      { label: "Total tCO₂e", value: "4,182.6", verified: true },
      { label: "Intensity (tCO₂e/£M)", value: "24.9", verified: true },
      { label: "YoY change", value: "-11.2%", verified: true },
    ],
    narrativeChunks: [
      "Emission intensity — our primary decoupling metric — improved 11.2% year-over-year, driven by an 8% revenue expansion combined with absolute emission reduction. ",
      "We expect further intensity improvement in FY26 as the LED retrofit (−412 tCO₂e) and 100% renewable PPA (−1,210 tCO₂e) come fully online.",
    ],
  },
  {
    id: "P6.Q4",
    title: "Reduction projects undertaken",
    data: [
      { label: "Initiatives completed", value: "4", verified: true },
      { label: "In progress", value: "2", verified: true },
      { label: "tCO₂e abated (actual)", value: "88", verified: true },
      { label: "Capital invested", value: "£2.58M", verified: true },
    ],
    narrativeChunks: [
      "Six active initiatives are in the portfolio, representing 2,448 tCO₂e of projected annual abatement. ",
      "The HVAC schedule optimisation (opp-02) has delivered 54 tCO₂e against a 184 tCO₂e target, 29% through its operating period. ",
      "The waste source-separation programme (opp-06) is tracking ahead of plan at 34 tCO₂e versus a 142 tCO₂e annual target.",
    ],
  },
];

export default function ReportBuilderPage() {
  const [frameworkId, setFrameworkId] = useState<"BRSR" | "CDP" | "CSRD" | "TCFD">("BRSR");
  const [activeSection, setActiveSection] = useState(0);
  const [narratives, setNarratives] = useState<Record<number, string>>({});
  const [streaming, setStreaming] = useState<number | null>(null);

  const fw = frameworks.find((f) => f.id === frameworkId)!;
  const sections = frameworkId === "BRSR" ? BRSR_SECTIONS : [];

  const streamSection = (idx: number) => {
    if (streaming !== null) return;
    setStreaming(idx);
    setNarratives((p) => ({ ...p, [idx]: "" }));
    const chunks = BRSR_SECTIONS[idx].narrativeChunks;
    let c = 0;
    let current = "";
    const reveal = () => {
      if (c >= chunks.length) {
        setStreaming(null);
        return;
      }
      const chunk = chunks[c];
      let i = 0;
      const iv = setInterval(() => {
        if (i >= chunk.length) {
          clearInterval(iv);
          current += chunk;
          c++;
          setTimeout(reveal, 200);
          return;
        }
        const next = chunk.slice(0, i + 2);
        setNarratives((p) => ({ ...p, [idx]: current + next }));
        i += 2;
      }, 16);
    };
    reveal();
  };

  const allGenerated = sections.every((_, i) => narratives[i] && !streaming);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="px-8 py-8 border-b border-rule">
        <div className="flex items-end justify-between gap-8">
          <div>
            <div className="text-micro uppercase tracking-[0.25em] text-ember mb-3">
              Report · AI-assisted builder
            </div>
            <h1 className="font-display text-4xl md:text-5xl tracking-tight leading-[1.05] max-w-2xl">
              From ledger to disclosure, in minutes.
            </h1>
            <p className="mt-3 text-ink-soft max-w-xl">
              Select a framework. Atmosphereum maps your data to each disclosure,
              writes the narrative, and flags inconsistencies before you export.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm">
              <Eye className="w-3.5 h-3.5" />
              Preview PDF
            </Button>
            <Button size="sm" disabled={!allGenerated}>
              <Download className="w-3.5 h-3.5" />
              Export & submit
            </Button>
          </div>
        </div>
      </div>

      {/* Framework picker */}
      <div className="px-8 py-4 border-b border-rule flex items-center gap-3">
        <span className="text-xs uppercase tracking-widest text-ink-muted font-mono">
          Framework:
        </span>
        <div className="flex items-center gap-1 bg-paper-soft border border-rule">
          {(["BRSR", "CDP", "CSRD", "TCFD"] as const).map((id) => (
            <button
              key={id}
              onClick={() => setFrameworkId(id)}
              className={cn(
                "px-3 h-8 text-xs font-mono uppercase tracking-wider transition-colors",
                frameworkId === id ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
              )}
            >
              {id}
            </button>
          ))}
        </div>
        <div className="ml-4 text-xs text-ink-soft italic">{fw.description}</div>
        <div className="ml-auto flex items-center gap-4 text-xs text-ink-muted font-mono">
          <span>Brentford FC</span>
          <span>·</span>
          <span>FY25</span>
          <span>·</span>
          <span>v1.3 draft</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 grid grid-cols-[220px_1fr_1fr] min-h-0">
        {/* Section nav */}
        <aside className="border-r border-rule overflow-y-auto">
          <div className="px-4 py-4 text-[10px] uppercase tracking-widest text-ink-muted font-mono border-b border-rule">
            Sections
          </div>
          {sections.length === 0 ? (
            <div className="p-6 text-sm text-ink-muted italic">
              This framework scaffold is a work in progress — switch to BRSR for
              the full demo flow.
            </div>
          ) : (
            <ul>
              {sections.map((s, i) => {
                const generated = !!narratives[i];
                const isStreaming = streaming === i;
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => setActiveSection(i)}
                      className={cn(
                        "w-full flex items-start gap-3 px-4 py-3 text-left text-sm border-b border-rule hover:bg-paper-warm transition-colors",
                        activeSection === i && "bg-paper-warm"
                      )}
                    >
                      <span className="text-[10px] font-mono text-ink-muted mt-0.5">{s.id}</span>
                      <span className="flex-1 min-w-0 leading-snug truncate">{s.title}</span>
                      {isStreaming ? (
                        <Sparkles className="w-3 h-3 text-ember animate-pulse shrink-0" />
                      ) : generated ? (
                        <CheckCircle2 className="w-3 h-3 text-moss shrink-0" />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Consistency checker */}
          {sections.length > 0 && (
            <div className="mt-6 p-4 border-t border-rule">
              <div className="text-[10px] uppercase tracking-widest text-ink-muted font-mono mb-3">
                Consistency checks
              </div>
              <div className="space-y-2 text-xs">
                <CheckItem status="ok" text="Totals reconcile across sections" />
                <CheckItem status="ok" text="Emission factors match library v2023.1" />
                <CheckItem status={allGenerated ? "ok" : "pending"} text="All required disclosures populated" />
                <CheckItem status="warn" text="P6.Q7: Air emissions data incomplete" />
              </div>
            </div>
          )}
        </aside>

        {/* Source data */}
        <section className="border-r border-rule overflow-y-auto p-8 bg-paper-soft/50">
          {sections[activeSection] && (
            <>
              <div className="text-[10px] uppercase tracking-widest text-ink-muted font-mono mb-2">
                Source data · {sections[activeSection].id}
              </div>
              <h2 className="font-display text-2xl tracking-tight mb-6">
                {sections[activeSection].title}
              </h2>

              <div className="border border-rule bg-paper">
                <div className="px-4 py-3 border-b border-rule bg-paper-warm text-[10px] uppercase tracking-widest text-ink-muted font-mono">
                  Values pulled from ledger
                </div>
                <dl className="divide-y divide-rule">
                  {sections[activeSection].data.map((d, i) => (
                    <div key={i} className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-3 text-sm">
                      <dt className="text-ink-soft">{d.label}</dt>
                      <dd className="font-mono tabular font-medium">{d.value}</dd>
                      <dd>
                        {d.verified ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-moss" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-ochre" />
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="mt-6 p-4 border border-rule bg-paper text-xs text-ink-soft leading-relaxed">
                <div className="text-[10px] uppercase tracking-widest text-ink-muted mb-2">
                  Methodology trail
                </div>
                Values aggregated from {sections[activeSection].data.length} data points, traced to{" "}
                <span className="text-ember font-medium">1,284 primary emission records</span> in the ledger. Factor version
                DEFRA 2023.1. Calculations follow GHG Protocol Corporate Standard (Revised Edition).
              </div>
            </>
          )}
        </section>

        {/* AI narrative */}
        <section className="overflow-y-auto p-8">
          {sections[activeSection] && (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] uppercase tracking-widest text-ember font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  AI narrative
                </div>
                <div className="flex items-center gap-2">
                  {narratives[activeSection] && (
                    <Button variant="ghost" size="sm" onClick={() => setNarratives((p) => { const next = { ...p }; delete next[activeSection]; return next; })}>
                      <RotateCcw className="w-3 h-3" />
                      Regenerate
                    </Button>
                  )}
                  {!narratives[activeSection] && streaming !== activeSection && (
                    <Button size="sm" onClick={() => streamSection(activeSection)}>
                      <Play className="w-3 h-3" />
                      Generate
                    </Button>
                  )}
                </div>
              </div>
              <h2 className="font-display text-2xl tracking-tight mb-6">
                Draft disclosure.
              </h2>

              <article className="bg-paper border border-rule p-6 min-h-[400px] relative">
                {narratives[activeSection] ? (
                  <div className="prose prose-sm max-w-none text-ink leading-relaxed">
                    <p className={cn("drop-cap", streaming === activeSection && "ai-caret")}>
                      {narratives[activeSection]}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                    <Sparkles className="w-10 h-10 text-ink-faint mb-4" strokeWidth={1} />
                    <h4 className="font-display text-xl mb-2">Ready to draft</h4>
                    <p className="text-sm text-ink-soft max-w-xs">
                      Atmosphereum will write a framework-compliant narrative grounded in the source data on the left.
                    </p>
                    <Button className="mt-5" onClick={() => streamSection(activeSection)}>
                      <Play className="w-3 h-3" />
                      Generate narrative
                    </Button>
                  </div>
                )}
              </article>

              {narratives[activeSection] && (
                <div className="mt-4 flex items-center gap-3 text-[10px] font-mono text-ink-muted">
                  <Badge variant="moss">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Grounded
                  </Badge>
                  <span>GPT-4o · 387 tokens · 4 data points cited</span>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function CheckItem({ status, text }: { status: "ok" | "warn" | "err" | "pending"; text: string }) {
  const color =
    status === "ok" ? "text-moss" :
    status === "warn" ? "text-ochre" :
    status === "err" ? "text-ember" :
    "text-ink-muted";
  return (
    <div className={cn("flex items-start gap-2", color)}>
      <span className="w-1 h-1 rounded-full bg-current mt-1.5 shrink-0" />
      <span className="leading-snug text-ink-soft">{text}</span>
    </div>
  );
}
