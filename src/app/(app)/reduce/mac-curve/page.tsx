"use client";
import { useState, useMemo } from "react";
import { opportunities } from "@/lib/fixtures";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fmt, cn } from "@/lib/utils";

export default function MacCurvePage() {
  const [hover, setHover] = useState<string | null>(null);
  const [capexLimit, setCapexLimit] = useState<number | null>(null);

  const sorted = useMemo(
    () =>
      [...opportunities]
        .filter((o) => !capexLimit || o.capex_gbp <= capexLimit)
        .sort((a, b) => a.mac_cost - b.mac_cost),
    [capexLimit]
  );

  const totalAbate = sorted.reduce((a, o) => a + o.abatement_tco2e, 0);
  const maxMac = Math.max(...sorted.map((o) => o.mac_cost));
  const minMac = Math.min(...sorted.map((o) => o.mac_cost));
  const range = maxMac - minMac;

  // Cumulative positions for x-axis
  let cumX = 0;
  const plotted = sorted.map((o) => {
    const x0 = cumX;
    cumX += o.abatement_tco2e;
    const width = (o.abatement_tco2e / totalAbate) * 100;
    const startPct = (x0 / totalAbate) * 100;
    // y: higher bars go up (positive MAC), negative go down
    const heightPct = Math.abs(o.mac_cost - 0) / Math.max(Math.abs(maxMac), Math.abs(minMac)) * 45;
    return { opp: o, startPct, width, heightPct, x0, x1: cumX };
  });

  const belowLine = sorted.filter((o) => o.mac_cost < 0);
  const aboveLine = sorted.filter((o) => o.mac_cost >= 0);
  const belowLineAbate = belowLine.reduce((a, o) => a + o.abatement_tco2e, 0);
  const belowLineSavings = belowLine.reduce((a, o) => a + o.annual_savings_gbp, 0);

  return (
    <div className="px-8 py-10 space-y-10">
      <SectionHeader
        eyebrow="Reduce · Marginal abatement cost curve"
        title="Cheap carbon, first."
        description="Initiatives ranked by £/tCO₂e abated. Bars below the line save money while reducing carbon. Bars above the line require investment to buy abatement."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={capexLimit === null ? "default" : "outline"}
              size="sm"
              onClick={() => setCapexLimit(null)}
            >
              Unconstrained
            </Button>
            <Button
              variant={capexLimit === 500_000 ? "default" : "outline"}
              size="sm"
              onClick={() => setCapexLimit(500_000)}
            >
              Capex ≤ £500k
            </Button>
            <Button
              variant={capexLimit === 100_000 ? "default" : "outline"}
              size="sm"
              onClick={() => setCapexLimit(100_000)}
            >
              Capex ≤ £100k
            </Button>
          </div>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-4 gap-0 divide-x divide-rule border-y border-rule py-6">
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">
            Total abatement
          </div>
          <div className="display-number text-3xl">
            {fmt.int(totalAbate)}<span className="text-sm text-ink-muted ml-1">tCO₂e</span>
          </div>
        </div>
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-moss mb-2">
            Net-positive abatement
          </div>
          <div className="display-number text-3xl text-moss">
            {fmt.int(belowLineAbate)}<span className="text-sm text-moss/70 ml-1">tCO₂e</span>
          </div>
          <div className="text-xs text-ink-muted font-mono mt-1">
            from {belowLine.length} initiatives
          </div>
        </div>
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-moss mb-2">
            Annual savings
          </div>
          <div className="display-number text-3xl text-moss">
            +{fmt.gbpShort(belowLineSavings)}
          </div>
          <div className="text-xs text-ink-muted font-mono mt-1">
            if fully executed
          </div>
        </div>
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">
            Paid abatement
          </div>
          <div className="display-number text-3xl text-ochre">
            {fmt.int(totalAbate - belowLineAbate)}<span className="text-sm text-ink-muted ml-1">tCO₂e</span>
          </div>
          <div className="text-xs text-ink-muted font-mono mt-1">
            from {aboveLine.length} initiatives
          </div>
        </div>
      </div>

      {/* The chart */}
      <section>
        <div className="text-micro uppercase tracking-[0.25em] text-ink-muted mb-3">
          § Abatement cost curve
        </div>
        <div className="bg-paper-soft border border-rule p-8">
          <div className="relative" style={{ height: "360px" }}>
            {/* Zero line */}
            <div
              className="absolute left-0 right-0 border-t border-ink-muted border-dashed"
              style={{ top: "50%" }}
            />
            <div
              className="absolute right-0 text-[10px] font-mono text-ink-muted px-2"
              style={{ top: "calc(50% - 10px)" }}
            >
              £0/tCO₂e
            </div>

            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 text-[10px] font-mono text-ink-muted">
              {`£${fmt.int(Math.max(maxMac, 1))}/t`}
            </div>
            <div className="absolute left-0 bottom-0 text-[10px] font-mono text-ink-muted">
              {`£${fmt.int(Math.min(minMac, -1))}/t`}
            </div>

            {/* Bars */}
            <div className="absolute left-16 right-0 top-0 bottom-0">
              {plotted.map((p) => {
                const isSaving = p.opp.mac_cost < 0;
                const isHover = hover === p.opp.id;
                return (
                  <div
                    key={p.opp.id}
                    className="absolute top-0 bottom-0 group cursor-pointer"
                    style={{
                      left: `${p.startPct}%`,
                      width: `${p.width}%`,
                    }}
                    onMouseEnter={() => setHover(p.opp.id)}
                    onMouseLeave={() => setHover(null)}
                  >
                    <div
                      className={cn(
                        "absolute left-0 right-0 border-r border-paper transition-all",
                        isSaving ? "bg-moss" : "bg-ember",
                        isHover && "brightness-110"
                      )}
                      style={{
                        top: isSaving ? "50%" : `${50 - p.heightPct}%`,
                        height: `${p.heightPct}%`,
                      }}
                    />
                    {isHover && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full z-10 bg-ink text-paper text-xs p-3 whitespace-nowrap shadow-lift font-mono tabular">
                        <div className="font-sans font-medium mb-1 normal-case max-w-xs whitespace-normal">
                          {p.opp.title}
                        </div>
                        <div>
                          <span className="text-ink-muted">Abatement:</span>{" "}
                          {fmt.int(p.opp.abatement_tco2e)} tCO₂e
                        </div>
                        <div>
                          <span className="text-ink-muted">MAC:</span>{" "}
                          <span className={isSaving ? "text-moss-soft" : "text-ember-soft"}>
                            £{fmt.int(p.opp.mac_cost)}/t
                          </span>
                        </div>
                        <div>
                          <span className="text-ink-muted">Savings/yr:</span>{" "}
                          {fmt.gbpShort(p.opp.annual_savings_gbp)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* X-axis label */}
            <div className="absolute left-16 right-0 -bottom-6 text-[10px] font-mono text-ink-muted flex justify-between">
              <span>0 tCO₂e</span>
              <span>Cumulative abatement</span>
              <span>{fmt.int(totalAbate)} tCO₂e</span>
            </div>
          </div>
        </div>
      </section>

      {/* Legend + table */}
      <section>
        <div className="flex items-center gap-6 mb-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-moss" />
            <span>Net-positive — saves money + reduces carbon</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-ember" />
            <span>Net-cost — investment to buy abatement</span>
          </div>
        </div>
        <div className="border border-rule bg-paper-soft overflow-hidden">
          <table className="w-full text-sm data-grid">
            <thead className="bg-paper-warm">
              <tr className="border-b border-rule text-left">
                <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-ink-muted">Rank</th>
                <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-ink-muted">Initiative</th>
                <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-ink-muted text-right">MAC</th>
                <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-ink-muted text-right">Abatement</th>
                <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-ink-muted text-right">Cumulative</th>
                <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-ink-muted text-right">Capex</th>
              </tr>
            </thead>
            <tbody>
              {plotted.map((p, i) => (
                <tr
                  key={p.opp.id}
                  className="border-b border-rule last:border-0 hover:bg-paper-warm transition-colors"
                  onMouseEnter={() => setHover(p.opp.id)}
                  onMouseLeave={() => setHover(null)}
                >
                  <td className="px-4 py-2.5 text-[10px] font-mono text-ink-muted">{String(i + 1).padStart(2, "0")}</td>
                  <td className="px-4 py-2.5 truncate max-w-[260px]">{p.opp.title}</td>
                  <td className={cn("px-4 py-2.5 font-mono tabular text-right font-medium", p.opp.mac_cost < 0 ? "text-moss" : "text-ember")}>
                    £{fmt.int(p.opp.mac_cost)}/t
                  </td>
                  <td className="px-4 py-2.5 font-mono tabular text-right">{fmt.int(p.opp.abatement_tco2e)} t</td>
                  <td className="px-4 py-2.5 font-mono tabular text-right text-ink-muted">{fmt.int(p.x1)} t</td>
                  <td className="px-4 py-2.5 font-mono tabular text-right">{fmt.gbpShort(p.opp.capex_gbp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
