import Link from "next/link";
import { ArrowUpRight, Zap, Flame, ShoppingBag, Trash2, Plane, Droplets } from "lucide-react";
import {
  totalsByScope,
  totalsByMonth,
  totalCostMetrics,
  byCategory,
  byFacility,
  loadOpportunities,
  loadOrg,
  CATEGORY_LABELS,
} from "@/lib/db";
import { Stat } from "@/components/ui/stat";
import { Badge } from "@/components/ui/badge";
import { ScopeTrend } from "@/components/charts/scope-trend";
import { ScopeDonut } from "@/components/charts/scope-donut";
import { CostWaterfall } from "@/components/charts/cost-waterfall";
import { fmt } from "@/lib/utils";

export const dynamic = "force-dynamic";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number | string }>> = {
  electricity: Zap,
  stationary_combustion: Flame,
  mobile_combustion: Flame,
  purchased_goods: ShoppingBag,
  waste: Trash2,
  business_travel: Plane,
  fan_travel: Plane,
  water: Droplets,
};

export default async function HomePage() {
  const [totals, cost, trend, catsAll, fac, opportunities, org] = await Promise.all([
    totalsByScope(),
    totalCostMetrics(),
    totalsByMonth(),
    byCategory(),
    byFacility(),
    loadOpportunities(),
    loadOrg(),
  ]);
  const cats = catsAll.slice(0, 8);
  const intensity = totals.total / (org.revenue_gbp / 1_000_000 || 1);
  const activeInitiatives = opportunities.filter((o) => o.status === "in_progress" || o.status === "approved");
  const topOpps = [...opportunities]
    .sort((a, b) => b.abatement_tco2e - a.abatement_tco2e)
    .slice(0, 5);

  return (
    <div>
      {/* Editorial masthead */}
      <div className="px-8 pt-10 pb-8 border-b border-rule bg-paper-soft/50">
        <div className="flex items-end justify-between gap-8">
          <div>
            <div className="text-micro uppercase tracking-[0.25em] text-ember mb-4 flex items-center gap-3">
              <span>Vol. III</span>
              <span className="w-8 h-px bg-ember" />
              <span>Issue 04 · FY25</span>
            </div>
            <h1 className="font-display text-6xl md:text-7xl tracking-tight leading-[0.95] max-w-3xl">
              The state of {org.name}'s carbon ledger.
            </h1>
            <p className="mt-5 text-ink-soft text-lg max-w-2xl leading-relaxed font-light">
              A 12-month look at what we emit, what it cost, and where {fmt.gbpShort(cost.waste_cost)} of
              avoidable spend hides inside our operations.
            </p>
          </div>
          <div className="hidden md:block text-right text-xs text-ink-muted font-mono leading-loose">
            <div>{org.name.toUpperCase()}</div>
            <div>{org.fiscal_year}</div>
            <div>Reporting boundary:</div>
            <div>operational control</div>
          </div>
        </div>
      </div>

      {/* Hero KPI strip — editorial ledger */}
      <section className="px-8 py-10 border-b border-rule">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-rule">
          <div className="px-6 first:pl-0">
            <Stat
              label="Total emissions"
              value={fmt.dec(totals.total / 1000, 2)}
              unit="ktCO₂e"
              delta="−6.4% YoY"
              trend="down"
              footnote="Scope 1+2+3"
            />
          </div>
          <div className="px-6">
            <Stat
              label="Intensity"
              value={fmt.dec(intensity, 1)}
              unit="tCO₂e / £M rev"
              delta="−11.2% YoY"
              trend="down"
            />
          </div>
          <div className="px-6">
            <Stat
              label="Waste cost identified"
              value={fmt.gbpShort(cost.waste_cost)}
              unit={`of ${fmt.gbpShort(cost.actual_cost)}`}
              delta={`${fmt.dec(cost.waste_pct, 1)}% of spend`}
              trend="up"
              emphasis="ember"
              footnote="Recoverable"
            />
          </div>
          <div className="px-6">
            <Stat
              label="Initiatives in flight"
              value={String(activeInitiatives.length)}
              unit={`of ${opportunities.length}`}
              delta={`${fmt.int(activeInitiatives.reduce((a, o) => a + o.abatement_tco2e, 0))} tCO₂e targeted`}
              trend="down"
              emphasis="moss"
            />
          </div>
        </div>
      </section>

      {/* Two-column editorial layout: feature + chart */}
      <section className="px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10 border-b border-rule">
        {/* Lead story: cost-carbon waterfall */}
        <div className="lg:col-span-2">
          <div className="text-micro uppercase tracking-[0.25em] text-ember mb-3">
            ★ Feature · The differentiator
          </div>
          <h2 className="font-display text-3xl tracking-tight mb-5 max-w-xl">
            Carbon and cost, torn apart and reassembled.
          </h2>
          <p className="text-ink-soft mb-8 max-w-2xl leading-relaxed drop-cap">
            Traditional GHG accounting tells you what you emit. It does not tell
            you what you should emit, or what that gap costs. Atmosphereum models
            every emission record as a dual-metric pair — so the carbon ledger
            and the financial ledger reconcile. The gap between actual and
            benchmark is our waste pool — the addressable market for the next
            decade of decarbonisation.
          </p>
          <div className="bg-paper-soft border border-rule p-8">
            <CostWaterfall
              actual={cost.actual_cost}
              should={cost.should_cost}
              waste={cost.waste_cost}
            />
          </div>
          <Link
            href="/reduce/teardown"
            className="inline-flex items-center gap-2 mt-5 text-sm text-ember hover:text-ember/80 transition-colors"
          >
            Open teardown analysis
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Sidebar: scope donut */}
        <div>
          <div className="text-micro uppercase tracking-[0.25em] text-ink-muted mb-3">
            § Scope breakdown
          </div>
          <h3 className="font-display text-2xl tracking-tight mb-5">
            Where the molecules come from.
          </h3>
          <div className="bg-paper-soft border border-rule p-6">
            <ScopeDonut
              scope1={totals.scope1}
              scope2={totals.scope2}
              scope3={totals.scope3}
            />
            <div className="mt-4 space-y-2 border-t border-rule pt-4">
              {[
                { label: "Scope 1", value: totals.scope1, color: "bg-ember" },
                { label: "Scope 2", value: totals.scope2, color: "bg-ochre" },
                { label: "Scope 3", value: totals.scope3, color: "bg-slate" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 ${s.color}`} />
                    <span>{s.label}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono tabular text-ink">
                      {fmt.int(s.value)}
                    </span>
                    <span className="text-xs text-ink-muted font-mono">
                      {fmt.dec((s.value / totals.total) * 100, 1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trend + categories */}
      <section className="px-8 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10 border-b border-rule">
        <div>
          <div className="text-micro uppercase tracking-[0.25em] text-ink-muted mb-3">
            § Twelve months
          </div>
          <h3 className="font-display text-2xl tracking-tight mb-1">
            Monthly emissions trajectory.
          </h3>
          <p className="text-ink-soft text-sm mb-6">
            Matchday intensity and winter heating visible in the curve.
          </p>
          <div className="bg-paper-soft border border-rule p-6">
            <ScopeTrend data={trend} />
          </div>
        </div>

        <div>
          <div className="text-micro uppercase tracking-[0.25em] text-ink-muted mb-3">
            § By category
          </div>
          <h3 className="font-display text-2xl tracking-tight mb-1">
            The top of the stack.
          </h3>
          <p className="text-ink-soft text-sm mb-6">
            Eight categories carry the majority of our footprint.
          </p>
          <div className="bg-paper-soft border border-rule">
            {cats.map((c, i) => {
              const maxV = cats[0].co2e_tonnes;
              const pct = (c.co2e_tonnes / maxV) * 100;
              const Icon = CATEGORY_ICONS[c.category] ?? Zap;
              return (
                <div
                  key={c.category}
                  className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-5 py-3 border-b border-rule last:border-0"
                >
                  <div className="text-[10px] font-mono text-ink-muted w-4 tabular">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="w-3.5 h-3.5 text-ink-muted shrink-0" strokeWidth={1.5} />
                    <span className="text-sm truncate">
                      {CATEGORY_LABELS[c.category] ?? c.category}
                    </span>
                  </div>
                  <div className="w-36 h-1.5 bg-paper-warm relative">
                    <div
                      className="absolute inset-y-0 left-0 bg-ember"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-xs font-mono tabular text-ink min-w-[60px] text-right">
                    {fmt.int(c.co2e_tonnes)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Facility comparison + top opportunities */}
      <section className="px-8 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10 border-b border-rule">
        <div>
          <div className="text-micro uppercase tracking-[0.25em] text-ink-muted mb-3">
            § Facility comparison
          </div>
          <h3 className="font-display text-2xl tracking-tight mb-6">
            Three sites, three footprints.
          </h3>
          <div className="bg-paper-soft border border-rule overflow-hidden">
            <table className="w-full text-sm data-grid">
              <thead>
                <tr className="border-b border-rule text-left">
                  <th className="px-5 py-3 font-medium text-[10px] uppercase tracking-widest text-ink-muted">
                    Facility
                  </th>
                  <th className="px-3 py-3 font-medium text-[10px] uppercase tracking-widest text-ink-muted text-right">
                    S1
                  </th>
                  <th className="px-3 py-3 font-medium text-[10px] uppercase tracking-widest text-ink-muted text-right">
                    S2
                  </th>
                  <th className="px-3 py-3 font-medium text-[10px] uppercase tracking-widest text-ink-muted text-right">
                    S3
                  </th>
                  <th className="px-3 py-3 font-medium text-[10px] uppercase tracking-widest text-ink-muted text-right">
                    Total
                  </th>
                  <th className="px-5 py-3 font-medium text-[10px] uppercase tracking-widest text-ember text-right">
                    Waste £
                  </th>
                </tr>
              </thead>
              <tbody>
                {fac.map((f) => (
                  <tr
                    key={f.facility.id}
                    className="border-b border-rule last:border-0 hover:bg-paper-warm transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="font-medium">{f.facility.name}</div>
                      <div className="text-[10px] uppercase tracking-widest text-ink-muted mt-0.5">
                        {f.facility.type.replace("_", " ")} · {f.facility.geography}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right font-mono tabular text-ember">
                      {fmt.int(f.scope1)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono tabular text-ochre">
                      {fmt.int(f.scope2)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono tabular text-slate">
                      {fmt.int(f.scope3)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono tabular font-medium">
                      {fmt.int(f.total)}
                    </td>
                    <td className="px-5 py-3 text-right font-mono tabular text-ember font-medium">
                      {fmt.gbpShort(f.waste_cost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="text-micro uppercase tracking-[0.25em] text-ink-muted mb-3">
            § Top opportunities
          </div>
          <h3 className="font-display text-2xl tracking-tight mb-6">
            Where we lean in next.
          </h3>
          <div className="space-y-3">
            {topOpps.map((o, i) => (
              <Link
                key={o.id}
                href="/reduce/opportunities"
                className="block bg-paper-soft border border-rule hover:border-ink-muted transition-all p-5 group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-mono text-ink-muted tabular">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <Badge variant={o.status === "approved" ? "moss" : o.status === "in_progress" ? "ochre" : "outline"}>
                        {o.status.replace("_", " ")}
                      </Badge>
                      <Badge variant="default">Scope {o.scope}</Badge>
                    </div>
                    <h4 className="font-display text-lg leading-snug group-hover:text-ember transition-colors">
                      {o.title}
                    </h4>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-ink-muted group-hover:text-ember transition-colors shrink-0" />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-rule">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-ink-muted">
                      Abatement
                    </div>
                    <div className="font-mono text-sm tabular mt-0.5">
                      {fmt.int(o.abatement_tco2e)} <span className="text-xs text-ink-muted">tCO₂e</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-ink-muted">
                      Annual savings
                    </div>
                    <div className={`font-mono text-sm tabular mt-0.5 ${o.annual_savings_gbp > 0 ? "text-moss" : "text-ember"}`}>
                      {o.annual_savings_gbp > 0 ? "+" : ""}
                      {fmt.gbpShort(o.annual_savings_gbp)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-ink-muted">
                      MAC
                    </div>
                    <div className={`font-mono text-sm tabular mt-0.5 ${o.mac_cost < 0 ? "text-moss" : "text-ember"}`}>
                      £{fmt.int(o.mac_cost)}/t
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Report readiness footer strip */}
      <section className="px-8 py-10">
        <div className="text-micro uppercase tracking-[0.25em] text-ink-muted mb-6">
          § Report readiness
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "BRSR", pct: 88, status: "ready" },
            { label: "CDP", pct: 72, status: "in progress" },
            { label: "CSRD", pct: 34, status: "scoping" },
            { label: "TCFD", pct: 95, status: "ready" },
          ].map((r) => (
            <div key={r.label} className="bg-paper-soft border border-rule p-5">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="font-display text-xl">{r.label}</div>
                  <div className="text-[10px] uppercase tracking-widest text-ink-muted mt-0.5">
                    {r.status}
                  </div>
                </div>
                <div className="display-number text-3xl text-ink">
                  {r.pct}
                  <span className="text-sm text-ink-muted ml-0.5">%</span>
                </div>
              </div>
              <div className="mt-4 h-0.5 bg-paper-warm relative">
                <div
                  className={`absolute inset-y-0 left-0 ${r.pct > 80 ? "bg-moss" : r.pct > 50 ? "bg-ochre" : "bg-ember"}`}
                  style={{ width: `${r.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/report/builder"
            className="inline-flex items-center gap-2 text-sm text-ember hover:text-ember/80 transition-colors"
          >
            Open Report Builder
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Colophon / footer */}
      <footer className="px-8 py-10 border-t border-rule bg-paper-soft/30">
        <div className="flex items-center justify-between text-xs text-ink-muted font-mono">
          <div>Atmosphereum · by EMIRLabs.ai</div>
          <div>Compiled {fmt.date(new Date())} · GHG Protocol + DEFRA 2023</div>
        </div>
      </footer>
    </div>
  );
}
