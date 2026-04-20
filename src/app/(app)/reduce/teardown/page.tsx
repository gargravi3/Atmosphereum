"use client";
import { useState } from "react";
import {
  Scissors,
  AlertCircle,
  Target,
  TrendingDown,
  ArrowRight,
} from "lucide-react";
import { teardowns, facilities } from "@/lib/fixtures";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fmt, cn } from "@/lib/utils";

export default function TeardownPage() {
  const [facilityId, setFacilityId] = useState("fac-stadium");
  const teardown = teardowns.find((t) => t.facility_id === facilityId)!;
  const facility = facilities.find((f) => f.id === facilityId)!;

  const totalKwh = teardown.base_load_kwh + teardown.production_load_kwh + teardown.waste_load_kwh;
  const totalCost = teardown.base_load_cost + teardown.production_load_cost + teardown.waste_load_cost;
  const basePct = (teardown.base_load_kwh / totalKwh) * 100;
  const prodPct = (teardown.production_load_kwh / totalKwh) * 100;
  const wastePct = (teardown.waste_load_kwh / totalKwh) * 100;
  const gapPct = ((teardown.actual_kwh_per_sqm - teardown.benchmark_kwh_per_sqm) / teardown.benchmark_kwh_per_sqm) * 100;
  const wasteCo2 = teardown.waste_drivers.reduce((a, d) => a + d.co2e, 0);

  return (
    <div className="px-8 py-10 space-y-10">
      <SectionHeader
        eyebrow="Reduce · Zero-based teardown"
        title="The anatomy of waste."
        description="We decompose every energy pound into three layers: base load (what you'd pay if the building were empty), production load (the legitimate cost of running your operation), and waste — the layer that shouldn't exist."
        actions={
          <div className="flex items-center gap-2">
            <select
              value={facilityId}
              onChange={(e) => setFacilityId(e.target.value)}
              className="h-9 px-3 text-sm bg-paper-soft border border-rule"
            >
              {teardowns.map((t) => {
                const f = facilities.find((x) => x.id === t.facility_id);
                return (
                  <option key={t.facility_id} value={t.facility_id}>
                    {f?.name}
                  </option>
                );
              })}
            </select>
            <Button variant="outline">
              <Scissors className="w-3.5 h-3.5" />
              Export teardown
            </Button>
          </div>
        }
      />

      {/* Hero split: decomposition bar + benchmark */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="text-micro uppercase tracking-[0.25em] text-ink-muted mb-3">
            § Energy decomposition · {facility.name} · {teardown.period}
          </div>
          <h2 className="font-display text-3xl tracking-tight mb-8">
            {fmt.int(totalKwh)} kWh, disassembled.
          </h2>

          {/* Big decomposition bar */}
          <div className="bg-paper-soft border border-rule p-6">
            <div className="flex h-16 border border-rule overflow-hidden">
              <div
                className="bg-slate/25 border-r border-slate flex items-center justify-center text-xs font-mono tabular text-slate font-medium relative group"
                style={{ width: `${basePct}%` }}
              >
                {fmt.dec(basePct, 0)}%
              </div>
              <div
                className="bg-moss/25 border-r border-moss flex items-center justify-center text-xs font-mono tabular text-moss font-medium relative group"
                style={{ width: `${prodPct}%` }}
              >
                {fmt.dec(prodPct, 0)}%
              </div>
              <div
                className="bg-ember/30 flex items-center justify-center text-xs font-mono tabular text-ember font-medium relative group"
                style={{ width: `${wastePct}%` }}
              >
                {fmt.dec(wastePct, 0)}%
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 grid grid-cols-3 gap-6">
              <Stratum
                color="bg-slate"
                label="Base load"
                description="What you'd pay if the building were empty — security, refrigeration, standby."
                kwh={teardown.base_load_kwh}
                cost={teardown.base_load_cost}
              />
              <Stratum
                color="bg-moss"
                label="Production load"
                description="The legitimate energy cost of actually running your operation."
                kwh={teardown.production_load_kwh}
                cost={teardown.production_load_cost}
              />
              <Stratum
                color="bg-ember"
                label="Waste load"
                description="Recoverable through operational, procurement, and retrofit action."
                kwh={teardown.waste_load_kwh}
                cost={teardown.waste_load_cost}
                highlight
              />
            </div>
          </div>
        </div>

        {/* Benchmark card */}
        <div>
          <div className="text-micro uppercase tracking-[0.25em] text-ink-muted mb-3">
            § Intensity benchmark
          </div>
          <h3 className="font-display text-2xl tracking-tight mb-5">
            {gapPct > 0 ? `${fmt.dec(gapPct, 0)}% above benchmark` : "At benchmark"}
          </h3>
          <div className="bg-paper-soft border border-rule p-6">
            <div className="space-y-5">
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <div className="text-micro uppercase tracking-widest text-ink-muted">
                    Actual
                  </div>
                  <div className="display-number text-3xl text-ember tabular">
                    {teardown.actual_kwh_per_sqm}
                  </div>
                </div>
                <div className="h-2 bg-paper-warm">
                  <div className="h-full bg-ember" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <div className="text-micro uppercase tracking-widest text-ink-muted">
                    Benchmark
                  </div>
                  <div className="display-number text-3xl text-moss tabular">
                    {teardown.benchmark_kwh_per_sqm}
                  </div>
                </div>
                <div className="h-2 bg-paper-warm">
                  <div
                    className="h-full bg-moss"
                    style={{
                      width: `${(teardown.benchmark_kwh_per_sqm / teardown.actual_kwh_per_sqm) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-5 pt-5 border-t border-rule text-xs text-ink-soft leading-relaxed">
              <span className="font-mono">kWh/m²/yr</span> — benchmark sourced
              from CIBSE TM-46 for stadiums of similar size and operating
              profile. Gap represents {fmt.gbpShort(teardown.actual_kwh_per_sqm * facility.area_sqm * 0.34 - teardown.benchmark_kwh_per_sqm * facility.area_sqm * 0.34)} of excess annual cost.
            </div>
          </div>
        </div>
      </section>

      {/* Waste drivers + big number */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Big waste number card */}
        <div className="bg-ember/5 border border-ember/30 p-8 flex flex-col justify-between">
          <div>
            <div className="text-micro uppercase tracking-[0.25em] text-ember mb-2">
              Waste pool
            </div>
            <div className="flex items-center gap-2 mb-5 text-ember">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">Addressable</span>
            </div>
            <div className="display-number text-6xl text-ember leading-none">
              {fmt.gbpShort(teardown.waste_load_cost)}
            </div>
            <div className="text-sm text-ember/70 font-mono mt-2">
              annual waste cost
            </div>
            <div className="display-number text-3xl text-ember leading-none mt-6">
              {fmt.int(wasteCo2)}
            </div>
            <div className="text-sm text-ember/70 font-mono mt-1">
              tCO₂e avoidable
            </div>
          </div>
          <Button variant="accent" className="w-full mt-8">
            <Target className="w-3.5 h-3.5" />
            Generate abatement plan
          </Button>
        </div>

        {/* Waste drivers list */}
        <div className="lg:col-span-2">
          <div className="text-micro uppercase tracking-[0.25em] text-ink-muted mb-3">
            § Waste attribution
          </div>
          <h3 className="font-display text-2xl tracking-tight mb-5">
            Five drivers, ranked.
          </h3>
          <div className="bg-paper-soft border border-rule">
            {teardown.waste_drivers.map((d, i) => {
              const maxCost = teardown.waste_drivers[0].cost;
              const pct = (d.cost / maxCost) * 100;
              return (
                <div
                  key={i}
                  className="px-5 py-4 border-b border-rule last:border-0 hover:bg-paper-warm transition-colors"
                >
                  <div className="flex items-baseline gap-4 mb-2">
                    <span className="text-[10px] font-mono text-ink-muted tabular shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 text-sm font-medium">{d.driver}</div>
                    <div className="text-sm font-mono tabular text-ember font-semibold">
                      {fmt.gbpShort(d.cost)}
                    </div>
                    <div className="text-xs font-mono tabular text-ink-muted w-20 text-right">
                      {fmt.int(d.co2e)} tCO₂e
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-7">
                    <div className="flex-1 h-1 bg-paper-warm">
                      <div
                        className="h-full bg-ember"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <Button variant="ghost" size="sm" className="text-[11px] shrink-0">
                      <ArrowRight className="w-3 h-3" />
                      Build initiative
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Methodology note */}
      <section className="bg-paper-soft border border-rule p-8">
        <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-6">
          <div>
            <div className="text-micro uppercase tracking-[0.25em] text-ink-muted mb-2">
              Methodology
            </div>
            <div className="font-display text-xl">Zero-based teardown</div>
          </div>
          <div className="text-sm text-ink-soft leading-relaxed space-y-3 max-w-3xl">
            <p>
              Unlike spend variance or YoY comparisons, zero-based teardown
              reconstructs what your energy spend <em>should</em> be from first
              principles — equipment inventory, operating schedules, occupancy
              patterns, and industry benchmarks — then attributes the gap to
              specific operational drivers.
            </p>
            <p>
              The method is adapted from zero-based budgeting (Kraft Heinz,
              3G Capital) and applied to energy and carbon. It's the layer
              that makes our cost-carbon reduction engine more than just
              another footprint tool.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stratum({
  color,
  label,
  description,
  kwh,
  cost,
  highlight,
}: {
  color: string;
  label: string;
  description: string;
  kwh: number;
  cost: number;
  highlight?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className={cn("w-2 h-2", color)} />
        <span className={cn("text-sm font-medium", highlight && "text-ember")}>
          {label}
        </span>
      </div>
      <div className={cn("display-number text-2xl mb-0.5", highlight && "text-ember")}>
        {fmt.compact(kwh)}
        <span className="text-xs text-ink-muted font-mono ml-1">kWh</span>
      </div>
      <div className={cn("text-sm font-mono tabular mb-3", highlight ? "text-ember" : "text-ink-soft")}>
        {fmt.gbpShort(cost)}
      </div>
      <div className="text-xs text-ink-muted leading-relaxed">
        {description}
      </div>
    </div>
  );
}
