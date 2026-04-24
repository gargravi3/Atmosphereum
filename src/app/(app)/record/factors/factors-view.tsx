"use client";
import { useMemo, useState } from "react";
import { Search, Plus, Info, Download } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FactorRow } from "@/lib/db";

export function FactorsView({
  factors,
  categoryLabels,
}: {
  factors: FactorRow[];
  categoryLabels: Record<string, string>;
}) {
  const allSources = useMemo(() => {
    const set = new Set<string>();
    factors.forEach((f) => set.add(f.source));
    return ["all", ...Array.from(set).sort()] as const;
  }, [factors]);

  const [source, setSource] = useState<string>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return factors
      .filter((f) => source === "all" || f.source === source)
      .filter((f) =>
        query === ""
          ? true
          : f.name.toLowerCase().includes(query.toLowerCase()) ||
            (f.code ?? "").toLowerCase().includes(query.toLowerCase())
      );
  }, [factors, source, query]);

  const defraCount = factors.filter((f) => /defra/i.test(f.source)).length;
  const useeioCount = factors.filter((f) => /useeio/i.test(f.source)).length;
  const customCount = factors.filter((f) => /custom/i.test(f.source)).length;

  return (
    <div className="px-8 py-10 space-y-8">
      <SectionHeader
        eyebrow="Record · Emission factor library"
        title="The coefficients that matter."
        description="Versioned, source-attributed, geography-aware. Every factor carries its provenance so the calculation can be reproduced years from now."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="w-3.5 h-3.5" />
              Export library
            </Button>
            <Button size="sm">
              <Plus className="w-3.5 h-3.5" />
              Custom factor
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-0 divide-x divide-rule border-y border-rule py-6">
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">Total factors</div>
          <div className="display-number text-3xl">{factors.length}</div>
        </div>
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">DEFRA</div>
          <div className="display-number text-3xl">{defraCount}</div>
        </div>
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">USEEIO</div>
          <div className="display-number text-3xl">{useeioCount}</div>
        </div>
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">Custom</div>
          <div className="display-number text-3xl">{customCount}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-y border-rule py-4">
        <div className="flex items-center gap-1 bg-paper-soft border border-rule overflow-x-auto">
          {allSources.map((s) => (
            <button
              key={s}
              onClick={() => setSource(s)}
              className={cn(
                "px-3 h-8 text-xs font-mono uppercase tracking-wider transition-colors whitespace-nowrap",
                source === s ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
              )}
            >
              {s === "all" ? "All sources" : s}
            </button>
          ))}
        </div>
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search factors…"
              className="w-full h-8 pl-8 pr-3 text-sm bg-paper-soft border border-rule focus:border-ink-muted outline-none"
            />
          </div>
        </div>
        <div className="ml-auto text-xs text-ink-muted font-mono">
          {filtered.length} factors
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-0 border border-rule bg-paper-soft">
        {filtered.slice(0, 120).map((f, i) => (
          <div
            key={f.id}
            className={cn(
              "p-5 border-b border-rule hover:bg-paper-warm transition-colors",
              i % 3 !== 2 && "xl:border-r",
              i % 2 === 0 && "md:border-r xl:border-r"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-mono text-ink-muted uppercase tracking-widest mb-1.5">
                  {f.code ?? f.id.slice(0, 8)}
                </div>
                <h3 className="font-display text-base leading-tight mb-2">
                  {f.name}
                </h3>
                <div className="flex flex-wrap gap-1 mb-3">
                  <Badge variant="outline">{f.source}</Badge>
                  <Badge variant="default">{categoryLabels[f.category] ?? f.category}</Badge>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-rule">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-ink-muted mb-0.5">
                  Value
                </div>
                <div className="font-mono tabular text-sm">{f.value}</div>
                <div className="text-[10px] font-mono text-ink-muted">{f.unit}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-ink-muted mb-0.5">
                  Geography
                </div>
                <div className="font-mono tabular text-sm">{f.geography}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-ink-muted mb-0.5">
                  Version
                </div>
                <div className="font-mono tabular text-sm">{f.version}</div>
                <div className="text-[10px] font-mono text-ink-muted">{f.year}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-3 text-xs text-ink-soft bg-paper-soft border border-rule p-4">
        <Info className="w-4 h-4 shrink-0 text-ink-muted mt-0.5" strokeWidth={1.5} />
        <div>
          Factor selection is automatic. Atmosphereum matches your activity data to
          the best-available factor using geography, year, activity type and
          data quality. Manual overrides are supported but create an audit
          event.
        </div>
      </div>
    </div>
  );
}
