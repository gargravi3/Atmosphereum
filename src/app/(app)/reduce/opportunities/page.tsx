"use client";
import { useState, useMemo } from "react";
import { opportunities, facilities, CATEGORY_LABELS } from "@/lib/fixtures";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fmt, cn } from "@/lib/utils";
import { Zap, Flame, ShoppingBag, Trash2, Plane, Droplets, Leaf, Target, TrendingDown, PoundSterling } from "lucide-react";

const CAT_ICONS: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number | string }>> = {
  electricity: Zap,
  stationary_combustion: Flame,
  mobile_combustion: Flame,
  refrigerants: Flame,
  purchased_goods: ShoppingBag,
  waste: Trash2,
  business_travel: Plane,
  fan_travel: Plane,
  water: Droplets,
};

export default function OpportunitiesPage() {
  const [scope, setScope] = useState<"all" | 1 | 2 | 3>("all");
  const [status, setStatus] = useState<"all" | "proposed" | "approved" | "in_progress" | "completed">("all");

  const filtered = useMemo(
    () =>
      opportunities
        .filter((o) => scope === "all" || o.scope === scope)
        .filter((o) => status === "all" || o.status === status),
    [scope, status]
  );

  const totals = filtered.reduce(
    (acc, o) => ({
      abate: acc.abate + o.abatement_tco2e,
      savings: acc.savings + o.annual_savings_gbp,
      capex: acc.capex + o.capex_gbp,
    }),
    { abate: 0, savings: 0, capex: 0 }
  );

  return (
    <div className="px-8 py-10 space-y-8">
      <SectionHeader
        eyebrow="Reduce · Opportunity portfolio"
        title="Twelve ways forward."
        description="Every initiative carries a paired carbon and cost projection, with a confidence score. Filter, rank, commit."
        actions={<Button>New opportunity</Button>}
      />

      {/* Totals strip */}
      <div className="grid grid-cols-4 gap-0 divide-x divide-rule border-y border-rule py-6">
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">Opportunities</div>
          <div className="display-number text-3xl">{filtered.length}</div>
        </div>
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">Abatement potential</div>
          <div className="display-number text-3xl">{fmt.int(totals.abate)}</div>
          <div className="text-xs text-ink-muted font-mono mt-1">tCO₂e / year</div>
        </div>
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">Annual savings</div>
          <div className={cn("display-number text-3xl", totals.savings >= 0 ? "text-moss" : "text-ember")}>
            {totals.savings >= 0 ? "+" : ""}{fmt.gbpShort(totals.savings)}
          </div>
        </div>
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">Capital required</div>
          <div className="display-number text-3xl">{fmt.gbpShort(totals.capex)}</div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 border-y border-rule py-4">
        <div className="flex items-center gap-1 bg-paper-soft border border-rule">
          {(["all", 1, 2, 3] as const).map((s) => (
            <button
              key={String(s)}
              onClick={() => setScope(s)}
              className={cn(
                "px-3 h-8 text-xs font-mono uppercase tracking-wider transition-colors",
                scope === s ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
              )}
            >
              {s === "all" ? "All scopes" : `Scope ${s}`}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-paper-soft border border-rule">
          {(["all", "proposed", "approved", "in_progress", "completed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                "px-3 h-8 text-xs font-mono uppercase tracking-wider transition-colors",
                status === s ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
              )}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((o) => {
          const Icon = CAT_ICONS[o.category] ?? Leaf;
          const fac = facilities.find((f) => f.id === o.facility_id);
          const netSaving = o.annual_savings_gbp > 0;
          return (
            <div
              key={o.id}
              className="bg-paper-soft border border-rule hover:border-ink-muted transition-all p-5 flex flex-col"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 bg-paper-warm border border-rule flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-ink-soft" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono text-ink-muted uppercase tracking-widest">
                      {o.id}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Badge variant="default">Scope {o.scope}</Badge>
                      <Badge
                        variant={
                          o.status === "approved" ? "moss" :
                          o.status === "in_progress" ? "ochre" :
                          o.status === "completed" ? "slate" :
                          "outline"
                        }
                      >
                        {o.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                </div>
                <ConfidencePip conf={o.confidence} />
              </div>

              <h3 className="font-display text-lg leading-snug mb-2">
                {o.title}
              </h3>
              <p className="text-xs text-ink-soft leading-relaxed flex-1 mb-4">
                {o.description}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-rule text-xs">
                <Metric
                  icon={TrendingDown}
                  label="Abatement"
                  value={`${fmt.int(o.abatement_tco2e)} tCO₂e`}
                  color="ember"
                />
                <Metric
                  icon={PoundSterling}
                  label="Savings / yr"
                  value={`${netSaving ? "+" : ""}${fmt.gbpShort(o.annual_savings_gbp)}`}
                  color={netSaving ? "moss" : "ember"}
                />
                <Metric
                  icon={Target}
                  label="MAC"
                  value={`£${fmt.int(o.mac_cost)}/t`}
                  color={o.mac_cost < 0 ? "moss" : "ochre"}
                />
                <Metric
                  label="Payback"
                  value={o.payback_years === 0 ? "Immediate" : `${fmt.dec(o.payback_years, 1)} yrs`}
                />
              </div>

              {o.owner && (
                <div className="mt-4 pt-3 border-t border-rule text-[10px] text-ink-muted font-mono flex items-center justify-between">
                  <span>Owner: {o.owner}</span>
                  <span>{fac?.name.split(" ")[0]}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ConfidencePip({ conf }: { conf: "high" | "medium" | "low" }) {
  const n = conf === "high" ? 3 : conf === "medium" ? 2 : 1;
  const color = conf === "high" ? "bg-moss" : conf === "medium" ? "bg-ochre" : "bg-ember";
  return (
    <div className="flex flex-col items-end">
      <div className="text-[9px] uppercase tracking-widest text-ink-muted mb-1">{conf}</div>
      <div className="flex gap-0.5">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn("w-1.5 h-3", i <= n ? color : "bg-paper-warm border border-rule")}
          />
        ))}
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  color = "ink",
}: {
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number | string }>;
  label: string;
  value: string;
  color?: "ink" | "ember" | "moss" | "ochre";
}) {
  const colors = {
    ink: "text-ink",
    ember: "text-ember",
    moss: "text-moss",
    ochre: "text-ochre",
  };
  return (
    <div>
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-ink-muted mb-0.5">
        {Icon && <Icon className="w-2.5 h-2.5" strokeWidth={1.75} />}
        {label}
      </div>
      <div className={cn("font-mono tabular font-medium text-sm", colors[color])}>
        {value}
      </div>
    </div>
  );
}
