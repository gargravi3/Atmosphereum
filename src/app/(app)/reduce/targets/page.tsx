import { loadTargets, loadYearlyProjections, loadPerformanceSummary } from "@/lib/db";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fmt, cn } from "@/lib/utils";
import { Target, TrendingDown, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TargetsPage() {
  const [targets, projections, performance] = await Promise.all([
    loadTargets(),
    loadYearlyProjections(),
    loadPerformanceSummary(),
  ]);

  const latest = performance[0];
  const sbtiCount = targets.filter((t) => t.sbti_validated).length;

  return (
    <div className="px-8 py-10 space-y-10">
      <SectionHeader
        eyebrow="Reduce · Net Zero targets"
        title="The trajectory we committed to."
        description="Every target with its base year, glide path, and actual-vs-allowed performance. SBTi-validated targets carry a paired interim milestone schedule."
        actions={<Button>Set new target</Button>}
      />

      <div className="grid grid-cols-4 gap-0 divide-x divide-rule border-y border-rule py-6">
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">Active targets</div>
          <div className="display-number text-3xl">{targets.length}</div>
        </div>
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-moss mb-2">SBTi validated</div>
          <div className="display-number text-3xl text-moss">{sbtiCount}</div>
        </div>
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">Latest year actuals</div>
          <div className="display-number text-3xl">
            {latest ? fmt.int(latest.total_actual) : "—"}
            <span className="text-sm text-ink-muted ml-1">tCO₂e</span>
          </div>
          <div className="text-xs text-ink-muted font-mono mt-1">{latest?.year ?? ""}</div>
        </div>
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">Gap to glide path</div>
          <div
            className={cn(
              "display-number text-3xl",
              !latest ? "text-ink-muted" : latest.total_gap <= 0 ? "text-moss" : "text-ember"
            )}
          >
            {latest ? `${latest.total_gap > 0 ? "+" : ""}${fmt.int(latest.total_gap)}` : "—"}
          </div>
          <div className="text-xs text-ink-muted font-mono mt-1">tCO₂e vs allowed</div>
        </div>
      </div>

      <section>
        <div className="text-micro uppercase tracking-[0.25em] text-ink-muted mb-3">§ Committed targets</div>
        <h3 className="font-display text-2xl tracking-tight mb-6">{targets.length} pathways on the books.</h3>

        <div className="space-y-4">
          {targets.map((t) => {
            const related = projections.filter((p) => p.target_id === t.id);
            const latestProj = related.sort((a, b) => b.year - a.year)[0];
            return (
              <article key={t.id} className="bg-paper-soft border border-rule p-5">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant={t.scope_category === "scope1" ? "ember" : t.scope_category === "scope2" ? "ochre" : "slate"}>
                        {t.scope_category.replace("scope", "Scope ")}
                      </Badge>
                      {t.sbti_method && <Badge variant="outline">{t.sbti_method}</Badge>}
                      {t.sbti_validated && (
                        <Badge variant="moss">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          SBTi validated
                        </Badge>
                      )}
                      <Badge variant={t.status === "active" ? "moss" : "outline"}>{t.status}</Badge>
                    </div>
                    <h4 className="font-display text-lg leading-snug mb-1">{t.name}</h4>
                    <div className="text-xs text-ink-muted font-mono">
                      {t.code} · {t.emission_source ?? t.scope_category} · base {t.base_year} → target {t.target_year}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-[10px] uppercase tracking-widest text-ink-muted">Reduction</div>
                    <div className="display-number text-3xl text-moss">
                      −{fmt.dec(t.reduction_pct, 0)}
                      <span className="text-base text-ink-muted font-mono ml-1">%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-rule grid grid-cols-4 gap-4 text-xs">
                  <Metric
                    icon={Target}
                    label={`${t.base_year} baseline`}
                    value={`${fmt.int(t.base_emissions_t)} tCO₂e`}
                  />
                  <Metric
                    icon={TrendingDown}
                    label={`${t.target_year} target`}
                    value={`${fmt.int(t.target_emissions_t)} tCO₂e`}
                    color="moss"
                  />
                  {latestProj && (
                    <>
                      <Metric
                        label={`${latestProj.year} allowed`}
                        value={`${fmt.int(latestProj.allowed_t)} tCO₂e`}
                      />
                      {latestProj.actual_t != null && (
                        <Metric
                          label={`${latestProj.year} actual`}
                          value={`${fmt.int(latestProj.actual_t)} tCO₂e`}
                          color={
                            latestProj.variance != null && latestProj.variance < 0 ? "moss" : "ember"
                          }
                        />
                      )}
                    </>
                  )}
                </div>

                {related.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-rule">
                    <div className="text-[10px] uppercase tracking-widest text-ink-muted mb-2">
                      Interim trajectory ({related.length} years)
                    </div>
                    <div className="flex items-end gap-1 h-10">
                      {related
                        .sort((a, b) => a.year - b.year)
                        .map((p) => {
                          const allowedH = Math.max(
                            (p.allowed_t / Math.max(...related.map((r) => r.allowed_t), 1)) * 100,
                            2
                          );
                          const actualH =
                            p.actual_t != null
                              ? Math.max((p.actual_t / Math.max(...related.map((r) => r.allowed_t), 1)) * 100, 2)
                              : 0;
                          return (
                            <div key={p.id} className="flex-1 flex items-end gap-px h-full">
                              <div className="flex-1 bg-slate/40 border-t border-slate" style={{ height: `${allowedH}%` }} title={`${p.year} allowed ${fmt.int(p.allowed_t)}t`} />
                              {actualH > 0 && (
                                <div className="flex-1 bg-ember/70 border-t border-ember" style={{ height: `${actualH}%` }} title={`${p.year} actual ${fmt.int(p.actual_t!)}t`} />
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {targets.length === 0 && (
          <div className="border border-rule bg-paper-soft p-8 text-center text-ink-muted text-sm">
            No targets committed yet.
          </div>
        )}
      </section>

      {performance.length > 0 && (
        <section>
          <div className="text-micro uppercase tracking-[0.25em] text-ink-muted mb-3">§ Annual performance</div>
          <div className="border border-rule bg-paper-soft overflow-hidden">
            <table className="w-full text-sm data-grid">
              <thead className="bg-paper-warm">
                <tr className="border-b border-rule text-left">
                  <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-ink-muted">Year</th>
                  <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-ember text-right">Scope 1</th>
                  <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-ochre text-right">Scope 2</th>
                  <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-slate text-right">Scope 3</th>
                  <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-ink-muted text-right">Total actual</th>
                  <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-ink-muted text-right">Total allowed</th>
                  <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-ink-muted text-right">Gap</th>
                  <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-ink-muted">Status</th>
                </tr>
              </thead>
              <tbody>
                {performance.map((p) => (
                  <tr key={p.id} className="border-b border-rule last:border-0 hover:bg-paper-warm transition-colors">
                    <td className="px-4 py-3 font-mono tabular">{p.year}</td>
                    <td className="px-4 py-3 text-right font-mono tabular text-ember">{fmt.int(p.scope1_actual)}</td>
                    <td className="px-4 py-3 text-right font-mono tabular text-ochre">{fmt.int(p.scope2_actual)}</td>
                    <td className="px-4 py-3 text-right font-mono tabular text-slate">{fmt.int(p.scope3_actual)}</td>
                    <td className="px-4 py-3 text-right font-mono tabular font-medium">{fmt.int(p.total_actual)}</td>
                    <td className="px-4 py-3 text-right font-mono tabular text-ink-muted">{fmt.int(p.total_allowed)}</td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right font-mono tabular",
                        p.total_gap <= 0 ? "text-moss" : "text-ember"
                      )}
                    >
                      {p.total_gap > 0 ? "+" : ""}
                      {fmt.int(p.total_gap)}
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const status = p.overall_status ?? "unknown";
                        return (
                          <Badge variant={status === "on_track" ? "moss" : status === "at_risk" ? "ochre" : "ember"}>
                            {status.replace(/_/g, " ")}
                          </Badge>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
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
  color?: "ink" | "moss" | "ember" | "ochre";
}) {
  const colors = {
    ink: "text-ink",
    moss: "text-moss",
    ember: "text-ember",
    ochre: "text-ochre",
  };
  return (
    <div>
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-ink-muted mb-0.5">
        {Icon && <Icon className="w-2.5 h-2.5" strokeWidth={1.75} />}
        {label}
      </div>
      <div className={cn("font-mono tabular font-medium text-sm", colors[color])}>{value}</div>
    </div>
  );
}
