"use client";
import { Suspense, useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Database,
  FileSpreadsheet,
  Wifi,
  FileText,
  CloudUpload,
  CheckCircle2,
  Sparkles,
  Zap,
  AlertCircle,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { fmt } from "@/lib/utils";
import { connectors, connectorById, type Connector } from "@/lib/fixtures/sources";
import { ConnectorDrawer } from "@/components/sources/connector-drawer";
import { CatalogPicker } from "@/components/sources/catalog-picker";

const statusStyle: Record<Connector["status"], { label: string; dot: string }> = {
  connected: { label: "Connected", dot: "bg-moss" },
  syncing: { label: "Syncing", dot: "bg-ochre animate-pulse" },
  error: { label: "Error", dot: "bg-ember" },
  disconnected: { label: "Not linked", dot: "bg-ink-faint" },
};

const typeIcons: Record<Connector["type"], React.ComponentType<{ className?: string; strokeWidth?: number | string }>> = {
  ERP: Database,
  IoT: Wifi,
  Document: FileText,
  File: FileSpreadsheet,
  API: Zap,
};

type Filter = "all" | "ERP" | "IoT" | "Document" | "File" | "attention";

export default function DataSourcesPage() {
  return (
    <Suspense fallback={<div className="px-8 py-10 text-sm text-ink-muted">Loading…</div>}>
      <DataSourcesContent />
    </Suspense>
  );
}

function DataSourcesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<Filter>("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [catalogOpen, setCatalogOpen] = useState(false);

  // Sync drawer open state with URL ?connector=
  useEffect(() => {
    const connectorParam = searchParams.get("connector");
    if (connectorParam) {
      setActiveId(connectorParam);
      setDrawerOpen(true);
    } else {
      setDrawerOpen(false);
    }
  }, [searchParams]);

  const openConnector = useCallback(
    (id: string) => {
      setActiveId(id);
      setDrawerOpen(true);
      const params = new URLSearchParams(searchParams.toString());
      params.set("connector", id);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const filtered = useMemo(() => {
    if (filter === "all") return connectors;
    if (filter === "attention")
      return connectors.filter(
        (c) => c.status === "disconnected" || c.status === "error"
      );
    return connectors.filter((c) => c.type === filter);
  }, [filter]);

  const active = activeId ? connectorById(activeId) || null : null;

  const attentionCount = connectors.filter(
    (c) => c.status === "disconnected" || c.status === "error"
  ).length;

  // --- AI extraction demo (preserved) ---
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState<null | {
    supplier: string;
    period: string;
    kwh: number;
    cost: number;
    rate: number;
  }>(null);

  const runExtraction = () => {
    setExtracting(true);
    setExtracted(null);
    setTimeout(() => {
      setExtracting(false);
      setExtracted({
        supplier: "Scottish Power",
        period: "Jan 2026",
        kwh: 350_000,
        cost: 91_000,
        rate: 0.26,
      });
    }, 2400);
  };

  return (
    <div className="px-8 py-10 space-y-12">
      <SectionHeader
        eyebrow="Record · Data sources"
        title="Nine sources, one ledger."
        description="Every emission record in Atmosphereum traces back to a primary source — ERPs, IoT meters, or AI-extracted documents. Click any card to inspect health, data lineage, and its live feed."
        actions={
          <>
            <Button variant="outline" onClick={() => setCatalogOpen(true)}>
              Add connector
            </Button>
            <Button>Sync all</Button>
          </>
        }
      />

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-0 divide-x divide-rule border-y border-rule py-6">
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">
            Active connectors
          </div>
          <div className="display-number text-3xl">
            {connectors.filter((c) => c.status !== "disconnected").length}
          </div>
        </div>
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">
            Records flowing
          </div>
          <div className="display-number text-3xl">
            {fmt.int(
              connectors.reduce((a, c) => a + c.records, 0)
            )}
          </div>
        </div>
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">
            Last sync cycle
          </div>
          <div className="display-number text-3xl">
            11<span className="text-base text-ink-muted">s</span>
          </div>
        </div>
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">
            Data freshness
          </div>
          <div className="display-number text-3xl text-moss">
            98.4<span className="text-base text-ink-muted">%</span>
          </div>
        </div>
      </div>

      {/* Connector grid */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-2xl tracking-tight">Connectors</h2>
          <div className="text-xs text-ink-muted font-mono">
            {filtered.length} of {connectors.length}
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5 mb-4 flex-wrap">
          <FilterChip label="All" active={filter === "all"} onClick={() => setFilter("all")} />
          <FilterChip label="ERP" active={filter === "ERP"} onClick={() => setFilter("ERP")} />
          <FilterChip label="IoT" active={filter === "IoT"} onClick={() => setFilter("IoT")} />
          <FilterChip label="Document" active={filter === "Document"} onClick={() => setFilter("Document")} />
          <FilterChip label="File" active={filter === "File"} onClick={() => setFilter("File")} />
          {attentionCount > 0 && (
            <FilterChip
              label="Needs attention"
              active={filter === "attention"}
              onClick={() => setFilter("attention")}
              icon={<AlertCircle className="w-3 h-3" strokeWidth={1.5} />}
              count={attentionCount}
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-0 border border-rule bg-paper-soft">
          {filtered.map((c, i) => {
            const st = statusStyle[c.status];
            const Icon = typeIcons[c.type];
            return (
              <button
                key={c.id}
                onClick={() => openConnector(c.id)}
                className={`text-left p-5 border-b border-rule md:border-r xl:border-r ${
                  i % 3 === 2 ? "xl:border-r-0" : ""
                } ${(i + 1) % 2 === 0 ? "md:border-r-0 xl:border-r" : ""} hover:bg-paper-warm transition-colors group focus:bg-paper-warm focus:outline-none focus-visible:ring-2 focus-visible:ring-ochre`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-paper-warm border border-rule flex items-center justify-center text-[9px] font-mono font-semibold text-ink-soft shrink-0">
                      {c.logo}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate group-hover:text-ink">
                        {c.name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-ink-muted">
                        <Icon className="w-3 h-3" strokeWidth={1.5} />
                        <span className="uppercase tracking-wider">{c.type}</span>
                        <span>·</span>
                        <span className="truncate">{c.vendor}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                    <span className="text-[10px] uppercase tracking-wider text-ink-muted">
                      {st.label}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-rule grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-ink-muted mb-1">
                      Records
                    </div>
                    <div className="font-mono tabular">
                      {c.records > 0 ? fmt.int(c.records) : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-ink-muted mb-1">
                      Last sync
                    </div>
                    <div className="font-mono">{c.lastSync}</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-rule flex items-center justify-between">
                  <span className="text-[10px] text-ink-faint font-mono uppercase tracking-widest">
                    {c.status === "disconnected" ? "Click to connect" : "Click to inspect"}
                  </span>
                  <span className="text-[10px] text-ink-faint group-hover:text-ink transition-colors">→</span>
                </div>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="border border-rule bg-paper-soft p-8 text-center text-xs text-ink-muted italic mt-4">
            No connectors match this filter.
          </div>
        )}
      </section>

      {/* Upload + AI extraction */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="font-display text-2xl tracking-tight mb-2">
            Upload spreadsheet
          </h2>
          <p className="text-sm text-ink-soft mb-5">
            Drop activity data here. Atmosphereum validates schema, matches emission
            factors, and flags outliers before writing to the ledger.
          </p>
          <div
            onClick={() => openConnector("c9")}
            className="border-2 border-dashed border-rule bg-paper-soft hover:bg-paper-warm transition-colors p-12 flex flex-col items-center justify-center text-center cursor-pointer"
          >
            <CloudUpload className="w-10 h-10 text-ink-muted mb-4" strokeWidth={1.25} />
            <div className="font-display text-lg mb-1">
              Drop CSV or Excel files
            </div>
            <div className="text-xs text-ink-muted font-mono mb-4">
              Or click to browse · Max 50MB · Up to 10k rows
            </div>
            <Button variant="outline" size="sm">Choose file</Button>
          </div>
          <div className="mt-4 text-[11px] text-ink-muted flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-3 h-3 text-moss" />
            Schema templates available: energy, fuel, travel, waste, procurement
          </div>
        </div>

        <div>
          <h2 className="font-display text-2xl tracking-tight mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-ember" />
            AI document extraction
          </h2>
          <p className="text-sm text-ink-soft mb-5">
            Drop a utility bill, freight invoice or supplier cert. Atmosphereum
            extracts the structured fields and links them to the right
            emission source.
          </p>
          <div className="border border-rule bg-paper-soft">
            <div
              onClick={runExtraction}
              className="p-8 text-center cursor-pointer hover:bg-paper-warm transition-colors border-b border-rule"
            >
              <FileText className="w-10 h-10 text-ember mx-auto mb-3" strokeWidth={1} />
              <div className="font-display text-lg mb-1">
                {extracting ? "Reading page 1 of 3…" : "Drop a utility bill"}
              </div>
              <div className="text-xs text-ink-muted font-mono">
                {extracting
                  ? "Structured extraction in progress"
                  : "Click to try a sample — scottish_power_jan2026.pdf"}
              </div>
              {extracting && (
                <div className="mt-4 h-0.5 bg-paper-warm overflow-hidden relative max-w-xs mx-auto">
                  <div className="absolute inset-y-0 left-0 bg-ember shimmer w-full" />
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="text-micro uppercase tracking-widest text-ink-muted mb-3">
                Extracted fields
              </div>
              {extracted ? (
                <div className="grid grid-cols-2 gap-3 text-sm animate-fade-in">
                  <Field label="Supplier" value={extracted.supplier} />
                  <Field label="Billing period" value={extracted.period} />
                  <Field label="Consumption" value={`${fmt.int(extracted.kwh)} kWh`} mono />
                  <Field label="Cost" value={fmt.gbp(extracted.cost)} mono />
                  <Field label="Rate" value={`£${extracted.rate}/kWh`} mono />
                  <Field label="Confidence" value="98.2%" mono highlight="moss" />
                </div>
              ) : (
                <div className="text-xs text-ink-muted italic">
                  Awaiting document…
                </div>
              )}
              {extracted && (
                <div className="mt-4 pt-4 border-t border-rule flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openConnector("c7")}
                  >
                    Open review queue →
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Drawer */}
      <ConnectorDrawer
        connector={active}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />

      {/* Catalog picker */}
      <CatalogPicker
        open={catalogOpen}
        onOpenChange={setCatalogOpen}
        onPick={openConnector}
      />
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  icon,
  count,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-[11px] uppercase tracking-wider border transition-colors flex items-center gap-1.5 ${
        active
          ? "bg-ink text-paper border-ink"
          : "bg-paper border-rule text-ink-soft hover:bg-paper-warm hover:border-ink-muted"
      }`}
    >
      {icon}
      {label}
      {count !== undefined && (
        <span
          className={`font-mono tabular text-[10px] ml-0.5 ${
            active ? "text-paper/70" : "text-ink-muted"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function Field({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: "moss" | "ember";
}) {
  const color =
    highlight === "moss"
      ? "text-moss"
      : highlight === "ember"
      ? "text-ember"
      : "text-ink";
  return (
    <div className="border-l border-rule pl-3">
      <div className="text-[10px] uppercase tracking-widest text-ink-muted mb-0.5">
        {label}
      </div>
      <div
        className={`${mono ? "font-mono tabular" : "font-display"} ${color}`}
      >
        {value}
      </div>
    </div>
  );
}
