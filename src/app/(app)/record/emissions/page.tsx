"use client";
import { useMemo, useState } from "react";
import { Search, Filter, Download, ChevronRight, Verified, AlertTriangle } from "lucide-react";
import { emissions, facilities, factors, CATEGORY_LABELS } from "@/lib/fixtures";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fmt, cn } from "@/lib/utils";
import type { EmissionRecord } from "@/lib/types";

export default function EmissionsPage() {
  const [scope, setScope] = useState<"all" | 1 | 2 | 3>("all");
  const [facilityId, setFacilityId] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<EmissionRecord | null>(null);

  const filtered = useMemo(() => {
    return emissions
      .filter((e) => scope === "all" || e.scope === scope)
      .filter((e) => facilityId === "all" || e.facility_id === facilityId)
      .filter((e) =>
        query === ""
          ? true
          : e.activity.toLowerCase().includes(query.toLowerCase()) ||
            e.id.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => b.period.localeCompare(a.period));
  }, [scope, facilityId, query]);

  const totalCO2 = filtered.reduce((a, e) => a + e.co2e_tonnes, 0);
  const totalActual = filtered.reduce((a, e) => a + e.actual_cost, 0);
  const totalWaste = filtered.reduce((a, e) => a + e.waste_cost, 0);

  return (
    <div className="px-8 py-10 space-y-8">
      <SectionHeader
        eyebrow="Record · Emission ledger"
        title="Every molecule, every receipt."
        description="An auditable record of every emission calculation. Each row carries its input data, the emission factor applied, methodology, data quality, and cost pairing."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Filter className="w-3.5 h-3.5" /> Columns
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </Button>
          </>
        }
      />

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-4 border-y border-rule py-4">
        <div className="flex items-center gap-1 bg-paper-soft border border-rule">
          {(["all", 1, 2, 3] as const).map((s) => (
            <button
              key={String(s)}
              onClick={() => setScope(s)}
              className={cn(
                "px-3 h-8 text-xs font-mono uppercase tracking-wider transition-colors",
                scope === s
                  ? "bg-ink text-paper"
                  : "text-ink-soft hover:text-ink"
              )}
            >
              {s === "all" ? "All scopes" : `Scope ${s}`}
            </button>
          ))}
        </div>

        <select
          value={facilityId}
          onChange={(e) => setFacilityId(e.target.value)}
          className="h-8 px-3 text-xs bg-paper-soft border border-rule font-mono text-ink"
        >
          <option value="all">All facilities</option>
          {facilities.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>

        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search activity, ID…"
              className="w-full h-8 pl-8 pr-3 text-sm bg-paper-soft border border-rule focus:border-ink-muted outline-none"
            />
          </div>
        </div>

        <div className="ml-auto text-xs text-ink-muted font-mono">
          {fmt.int(filtered.length)} records · {fmt.int(totalCO2)} tCO₂e · {fmt.gbpShort(totalActual)} spend
        </div>
      </div>

      {/* Table */}
      <div className="border border-rule bg-paper-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm data-grid">
            <thead className="bg-paper-warm sticky top-0">
              <tr className="text-left border-b border-rule">
                <Th>ID</Th>
                <Th>Period</Th>
                <Th>Scope</Th>
                <Th>Category</Th>
                <Th>Activity</Th>
                <Th>Facility</Th>
                <Th align="right">Activity</Th>
                <Th align="right">EF</Th>
                <Th align="right">tCO₂e</Th>
                <Th align="right">Actual £</Th>
                <Th align="right">Waste £</Th>
                <Th align="center">DQ</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 60).map((e) => {
                const fac = facilities.find((f) => f.id === e.facility_id);
                return (
                  <tr
                    key={e.id}
                    onClick={() => setSelected(e)}
                    className="border-b border-rule last:border-0 hover:bg-paper-warm cursor-pointer transition-colors group"
                  >
                    <Td mono className="text-ink-muted">{e.id}</Td>
                    <Td mono>{e.period}</Td>
                    <Td>
                      <span className={cn(
                        "inline-flex items-center justify-center w-6 h-5 text-[10px] font-mono font-semibold",
                        e.scope === 1 && "bg-ember-faint text-ember",
                        e.scope === 2 && "bg-ochre-faint text-ochre",
                        e.scope === 3 && "bg-slate-faint text-slate"
                      )}>
                        {e.scope}
                      </span>
                    </Td>
                    <Td className="text-xs text-ink-soft">
                      {CATEGORY_LABELS[e.category] ?? e.category}
                    </Td>
                    <Td className="max-w-[200px] truncate">{e.activity}</Td>
                    <Td className="text-xs text-ink-soft">{fac?.name.split(" ")[0]}</Td>
                    <Td mono align="right">
                      {fmt.int(e.activity_value)}
                      <span className="text-ink-muted ml-1">{e.activity_unit}</span>
                    </Td>
                    <Td mono align="right" className="text-ink-muted">
                      {e.factor_value.toFixed(4)}
                    </Td>
                    <Td mono align="right" className="font-medium">
                      {fmt.dec(e.co2e_tonnes, 1)}
                    </Td>
                    <Td mono align="right">
                      {fmt.gbpShort(e.actual_cost)}
                    </Td>
                    <Td mono align="right" className="text-ember">
                      {e.waste_cost > 0 ? fmt.gbpShort(e.waste_cost) : "—"}
                    </Td>
                    <Td align="center">
                      <DQBadge score={e.data_quality} />
                    </Td>
                    <Td align="right">
                      <ChevronRight className="w-3.5 h-3.5 text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length > 60 && (
          <div className="border-t border-rule px-5 py-3 text-xs text-ink-muted font-mono flex items-center justify-between">
            <span>Showing 60 of {fmt.int(filtered.length)} records</span>
            <Button variant="ghost" size="sm">Load more</Button>
          </div>
        )}
      </div>

      {/* Drill-down drawer */}
      {selected && (
        <Drawer record={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function Th({ children, align = "left" }: { children?: React.ReactNode; align?: "left" | "right" | "center" }) {
  return (
    <th className={cn(
      "px-4 py-2.5 text-[10px] uppercase tracking-widest font-medium text-ink-muted whitespace-nowrap",
      align === "right" && "text-right",
      align === "center" && "text-center",
    )}>
      {children}
    </th>
  );
}

function Td({
  children,
  mono,
  align = "left",
  className,
}: {
  children?: React.ReactNode;
  mono?: boolean;
  align?: "left" | "right" | "center";
  className?: string;
}) {
  return (
    <td className={cn(
      "px-4 py-2.5 whitespace-nowrap",
      mono && "font-mono tabular",
      align === "right" && "text-right",
      align === "center" && "text-center",
      className,
    )}>
      {children}
    </td>
  );
}

function DQBadge({ score }: { score: number }) {
  const color =
    score >= 4 ? "text-moss bg-moss-faint" :
    score >= 3 ? "text-ochre bg-ochre-faint" :
    "text-ember bg-ember-faint";
  return (
    <span className={cn("inline-block w-5 h-5 text-[10px] font-mono font-semibold leading-5 text-center", color)}>
      {score}
    </span>
  );
}

function Drawer({ record, onClose }: { record: EmissionRecord; onClose: () => void }) {
  const factor = factors.find((f) => f.id === record.factor_id);
  const fac = facilities.find((f) => f.id === record.facility_id);
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-ink/20" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-paper border-l border-rule h-full overflow-y-auto animate-fade-in shadow-lift"
      >
        <div className="sticky top-0 bg-paper border-b border-rule px-6 py-5 flex items-start justify-between gap-4">
          <div>
            <div className="text-micro uppercase tracking-[0.2em] text-ember mb-2">
              Emission record · {record.id}
            </div>
            <h3 className="font-display text-2xl leading-tight">
              {record.activity}
            </h3>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <Badge variant={record.scope === 1 ? "ember" : record.scope === 2 ? "ochre" : "slate"}>
                Scope {record.scope}
              </Badge>
              <Badge variant="outline">{CATEGORY_LABELS[record.category]}</Badge>
              {record.verified ? (
                <Badge variant="moss">
                  <Verified className="w-2.5 h-2.5" /> Verified
                </Badge>
              ) : (
                <Badge variant="ember">
                  <AlertTriangle className="w-2.5 h-2.5" /> Unverified
                </Badge>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink text-lg leading-none"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-6 space-y-8">
          {/* Calculation */}
          <section>
            <h4 className="text-micro uppercase tracking-widest text-ink-muted mb-3">
              Calculation lineage
            </h4>
            <div className="bg-paper-soft border border-rule p-5 font-mono text-sm">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="tabular text-ink">
                  {fmt.int(record.activity_value)}
                </span>
                <span className="text-ink-muted">{record.activity_unit}</span>
                <span className="text-ember">×</span>
                <span className="tabular text-ink">
                  {record.factor_value.toFixed(4)}
                </span>
                <span className="text-ink-muted">{record.factor_unit}</span>
                <span className="text-ember">=</span>
                <span className="tabular text-ink font-semibold">
                  {fmt.dec(record.co2e_tonnes, 2)}
                </span>
                <span className="text-ink-muted">tCO₂e</span>
              </div>
            </div>
          </section>

          {/* Dual-metric */}
          <section>
            <h4 className="text-micro uppercase tracking-widest text-ink-muted mb-3">
              Dual-metric view
            </h4>
            <div className="grid grid-cols-3 gap-0 divide-x divide-rule border border-rule bg-paper-soft">
              <div className="p-4">
                <div className="text-[10px] uppercase tracking-widest text-ink-muted mb-1">Actual cost</div>
                <div className="display-number text-xl">{fmt.gbpShort(record.actual_cost)}</div>
              </div>
              <div className="p-4">
                <div className="text-[10px] uppercase tracking-widest text-ink-muted mb-1">Should cost</div>
                <div className="display-number text-xl text-slate">{fmt.gbpShort(record.should_cost)}</div>
              </div>
              <div className="p-4 bg-ember-faint/40">
                <div className="text-[10px] uppercase tracking-widest text-ember mb-1">Waste cost</div>
                <div className="display-number text-xl text-ember">{fmt.gbpShort(record.waste_cost)}</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-ink-muted">
              Intensity: <span className="font-mono tabular">£{fmt.dec(record.cost_intensity, 1)}/tCO₂e</span>
            </div>
          </section>

          {/* Metadata */}
          <section>
            <h4 className="text-micro uppercase tracking-widest text-ink-muted mb-3">
              Metadata
            </h4>
            <dl className="divide-y divide-rule border border-rule bg-paper-soft">
              <Row label="Facility" value={`${fac?.name} · ${fac?.geography}`} />
              <Row label="Period" value={record.period} mono />
              <Row label="Emission factor" value={factor?.name ?? record.factor_id} />
              <Row label="Factor source" value={`${factor?.source} (v${factor?.version})`} mono />
              <Row label="Methodology" value={record.methodology} />
              <Row label="Data quality score" value={`${record.data_quality}/5 — per GHG Protocol`} />
              <Row label="Invoice reference" value={record.invoice_ref ?? "—"} mono />
            </dl>
          </section>

          <div className="flex gap-2 pt-4 border-t border-rule">
            <Button variant="outline" className="flex-1">View invoice</Button>
            <Button className="flex-1">Approve</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-4 p-3.5 text-sm">
      <dt className="text-ink-muted text-xs uppercase tracking-wider">{label}</dt>
      <dd className={cn(mono && "font-mono tabular")}>{value}</dd>
    </div>
  );
}
