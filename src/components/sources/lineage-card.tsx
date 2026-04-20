"use client";
import { ArrowRight } from "lucide-react";
import { fmt } from "@/lib/utils";
import type { LineageEntry } from "@/lib/fixtures/sources";

const categoryLabels: Record<string, string> = {
  electricity: "Electricity",
  stationary_combustion: "Stationary combustion",
  mobile_combustion: "Mobile combustion",
  refrigerants: "Refrigerants",
  heat_steam: "Heat & steam",
  purchased_goods: "Purchased goods",
  fuel_energy_upstream: "Fuel & energy upstream",
  upstream_transport: "Upstream transport",
  waste: "Waste",
  business_travel: "Business travel",
  commuting: "Employee commuting",
  fan_travel: "Fan travel",
  water: "Water",
};

/**
 * "Connector → Ledger" flow:
 * Left = connector badge, right = the emission categories it populates.
 */
export function LineageCard({
  connectorName,
  lineage,
}: {
  connectorName: string;
  lineage: LineageEntry[];
}) {
  const total = lineage.reduce((a, l) => a + l.records, 0);

  return (
    <div className="border border-rule bg-paper">
      <div className="px-4 py-3 border-b border-rule">
        <div className="text-micro uppercase tracking-widest text-ink-muted">
          Lineage · where this data lands
        </div>
      </div>
      <div className="p-4 flex items-stretch gap-4">
        <div className="flex flex-col items-center justify-center px-3 py-2 border border-rule bg-paper-warm shrink-0 min-w-[120px]">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted">
            Source
          </div>
          <div className="font-display text-sm mt-1 text-center">
            {connectorName}
          </div>
          <div className="font-mono text-[10px] text-ink-muted mt-1 tabular">
            {fmt.int(total)} records
          </div>
        </div>

        <div className="flex items-center text-ink-faint">
          <ArrowRight className="w-4 h-4" strokeWidth={1.25} />
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          {lineage.map((l, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 px-3 py-1.5 bg-paper border border-rule"
            >
              <div className="min-w-0">
                <div className="text-sm truncate">
                  {categoryLabels[l.category] || l.category}
                </div>
                <div className="text-[10px] text-ink-muted truncate font-mono">
                  {l.description}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] uppercase tracking-wider text-ink-muted font-mono">
                  S{l.scope}
                </span>
                <span className="font-mono tabular text-xs text-ink">
                  {fmt.int(l.records)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
