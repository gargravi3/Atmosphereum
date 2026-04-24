import { loadMaterialityTopics, loadComplianceDeadlines } from "@/lib/db";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fmt, cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Clock, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

const PILLAR_COLORS: Record<string, "ember" | "ochre" | "slate" | "moss"> = {
  E: "moss",
  Environmental: "moss",
  S: "ochre",
  Social: "ochre",
  G: "slate",
  Governance: "slate",
};

export default async function MaterialityPage() {
  const [topics, deadlines] = await Promise.all([
    loadMaterialityTopics(),
    loadComplianceDeadlines(),
  ]);

  const material = topics.filter((t) => t.is_material);
  const upcomingDeadlines = deadlines
    .filter((d) => d.status !== "completed")
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  const maxImpact = Math.max(...topics.map((t) => t.impact_score), 1);
  const maxFin = Math.max(...topics.map((t) => t.financial_score), 1);

  return (
    <div className="px-8 py-10 space-y-10">
      <SectionHeader
        eyebrow="Govern · Materiality & compliance"
        title="What matters, and when it's due."
        description="Double-materiality assessment plots topics by financial impact × impact on people and planet. Compliance deadlines track disclosure obligations across jurisdictions."
        actions={<Button>Run reassessment</Button>}
      />

      <div className="grid grid-cols-4 gap-0 divide-x divide-rule border-y border-rule py-6">
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">Assessed topics</div>
          <div className="display-number text-3xl">{topics.length}</div>
        </div>
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ember mb-2">Material topics</div>
          <div className="display-number text-3xl text-ember">{material.length}</div>
        </div>
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">Compliance deadlines</div>
          <div className="display-number text-3xl">{deadlines.length}</div>
        </div>
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ochre mb-2">Upcoming (90d)</div>
          <div className="display-number text-3xl text-ochre">
            {
              upcomingDeadlines.filter(
                (d) => new Date(d.due_date).getTime() - Date.now() < 90 * 86400_000
              ).length
            }
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="text-micro uppercase tracking-[0.25em] text-ink-muted mb-3">§ Double-materiality map</div>
          <h3 className="font-display text-2xl tracking-tight mb-6">Impact × financial.</h3>

          <div className="bg-paper-soft border border-rule p-6">
            <div className="relative aspect-square">
              <div className="absolute inset-0 border border-ink-muted" />
              <div className="absolute left-0 right-0 top-1/2 border-t border-rule border-dashed" />
              <div className="absolute top-0 bottom-0 left-1/2 border-l border-rule border-dashed" />

              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-ink-muted">
                Impact materiality →
              </div>
              <div className="absolute top-1/2 -left-14 -translate-y-1/2 text-[10px] uppercase tracking-widest text-ink-muted -rotate-90 whitespace-nowrap">
                Financial materiality →
              </div>

              {topics.map((t) => {
                const x = (t.impact_score / maxImpact) * 100;
                const y = 100 - (t.financial_score / maxFin) * 100;
                const color = PILLAR_COLORS[t.pillar] ?? "slate";
                const size = Math.max(t.overall_score * 2, 8);
                return (
                  <div
                    key={t.id}
                    className={cn(
                      "absolute flex items-center justify-center group cursor-pointer transition-all hover:z-10",
                      color === "moss" && "text-moss",
                      color === "ochre" && "text-ochre",
                      color === "slate" && "text-slate",
                      color === "ember" && "text-ember"
                    )}
                    style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
                  >
                    <div
                      className={cn(
                        "rounded-full border-2 transition-all",
                        color === "moss" && "bg-moss/20 border-moss",
                        color === "ochre" && "bg-ochre/20 border-ochre",
                        color === "slate" && "bg-slate/20 border-slate",
                        color === "ember" && "bg-ember/20 border-ember",
                        t.is_material && "ring-2 ring-ink/20"
                      )}
                      style={{ width: `${size}px`, height: `${size}px` }}
                    />
                    <div className="absolute top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity bg-ink text-paper text-xs px-2 py-1 whitespace-nowrap shadow-lift z-20 font-mono pointer-events-none">
                      {t.name}
                      <div className="text-[10px] text-ink-muted">
                        Impact {fmt.dec(t.impact_score, 1)} · Fin {fmt.dec(t.financial_score, 1)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs">
              {(["moss", "ochre", "slate"] as const).map((c) => (
                <div key={c} className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      c === "moss" && "bg-moss",
                      c === "ochre" && "bg-ochre",
                      c === "slate" && "bg-slate"
                    )}
                  />
                  <span className="text-ink-soft">
                    {c === "moss" ? "Environmental" : c === "ochre" ? "Social" : "Governance"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="text-micro uppercase tracking-[0.25em] text-ink-muted mb-3">§ Material topics</div>
          <h3 className="font-display text-2xl tracking-tight mb-5">
            {material.length} topics at or above threshold.
          </h3>
          <div className="border border-rule bg-paper-soft">
            {material.slice(0, 10).map((t) => (
              <div key={t.id} className="px-4 py-3 border-b border-rule last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={PILLAR_COLORS[t.pillar] ?? "outline"}>{t.pillar}</Badge>
                  <span className="text-[10px] font-mono text-ink-muted">{t.code}</span>
                </div>
                <div className="font-medium text-sm">{t.name}</div>
                <div className="mt-2 flex items-center gap-3 text-[11px] text-ink-muted font-mono">
                  <span>Overall {fmt.dec(t.overall_score, 1)}</span>
                  <span>·</span>
                  <span>Impact {fmt.dec(t.impact_score, 1)}</span>
                  <span>·</span>
                  <span>Fin {fmt.dec(t.financial_score, 1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="text-micro uppercase tracking-[0.25em] text-ink-muted mb-3">§ Compliance deadlines</div>
        <h3 className="font-display text-2xl tracking-tight mb-6">{deadlines.length} obligations tracked.</h3>
        <div className="border border-rule bg-paper-soft overflow-hidden">
          <table className="w-full text-sm data-grid">
            <thead className="bg-paper-warm">
              <tr className="border-b border-rule text-left">
                <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-ink-muted">Framework</th>
                <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-ink-muted">Obligation</th>
                <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-ink-muted">Type</th>
                <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-ink-muted">Due date</th>
                <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-ink-muted">Owner</th>
                <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-ink-muted text-right">Progress</th>
                <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-ink-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              {deadlines.map((d) => {
                const daysOut = Math.round(
                  (new Date(d.due_date).getTime() - Date.now()) / 86400_000
                );
                return (
                  <tr key={d.id} className="border-b border-rule last:border-0 hover:bg-paper-warm transition-colors">
                    <td className="px-4 py-3">
                      <Badge variant="outline">{d.framework}</Badge>
                    </td>
                    <td className="px-4 py-3 font-medium">{d.name}</td>
                    <td className="px-4 py-3 text-xs text-ink-soft">{d.type.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3 font-mono tabular text-xs">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-ink-muted" />
                        {new Date(d.due_date).toLocaleDateString()}
                        {daysOut > 0 && daysOut < 90 && (
                          <span className="text-[10px] text-ochre font-mono">
                            {daysOut}d
                          </span>
                        )}
                        {daysOut < 0 && (
                          <span className="text-[10px] text-ember font-mono">OVERDUE</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-soft">{d.owner ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <div className="w-20 h-1 bg-paper-warm">
                          <div
                            className={cn(
                              "h-full",
                              d.completion_pct >= 100
                                ? "bg-moss"
                                : d.completion_pct >= 50
                                ? "bg-ochre"
                                : "bg-ember"
                            )}
                            style={{ width: `${Math.min(d.completion_pct, 100)}%` }}
                          />
                        </div>
                        <span className="font-mono tabular text-xs w-10 text-right">
                          {d.completion_pct}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={d.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {deadlines.length === 0 && (
            <div className="p-8 text-center text-ink-muted text-sm">No compliance deadlines tracked.</div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: "moss" | "ochre" | "ember" | "outline"; icon?: React.ComponentType<{ className?: string }> }> = {
    completed: { variant: "moss", icon: CheckCircle2 },
    in_progress: { variant: "ochre", icon: Clock },
    not_started: { variant: "outline" },
    overdue: { variant: "ember", icon: AlertTriangle },
    at_risk: { variant: "ember", icon: AlertTriangle },
  };
  const entry = map[status] ?? { variant: "outline" as const };
  const Icon = entry.icon;
  return (
    <Badge variant={entry.variant}>
      {Icon && <Icon className="w-2.5 h-2.5" />}
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
