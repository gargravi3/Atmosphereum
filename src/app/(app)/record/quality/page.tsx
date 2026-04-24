import { loadEmissions, loadFacilities, loadQualityExceptions, CATEGORY_LABELS } from "@/lib/db";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fmt } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DataQualityPage() {
  const [emissions, facilities, exceptions] = await Promise.all([
    loadEmissions(),
    loadFacilities(),
    loadQualityExceptions(),
  ]);
  // Build heatmap: facility x category with avg DQ
  const categoriesInUse = Array.from(new Set(emissions.map((e) => e.category)));
  const cells = facilities.map((fac) => {
    return {
      facility: fac,
      cells: categoriesInUse.map((cat) => {
        const records = emissions.filter(
          (e) => e.facility_id === fac.id && e.category === cat
        );
        const avg =
          records.length > 0
            ? records.reduce((a, e) => a + e.data_quality, 0) / records.length
            : null;
        return { category: cat, score: avg, count: records.length };
      }),
    };
  });

  const total = emissions.length;
  const avg = emissions.reduce((a, e) => a + e.data_quality, 0) / total;
  const verified = emissions.filter((e) => e.verified).length;
  const dqCounts = [1, 2, 3, 4, 5].map(
    (s) => emissions.filter((e) => e.data_quality === s).length
  );

  return (
    <div className="px-8 py-10 space-y-10">
      <SectionHeader
        eyebrow="Record · Data quality"
        title="What we trust, and what we don't."
        description="Per-record data quality against the GHG Protocol's five-point scale — from primary-measured through industry-average spend-based."
        actions={<Button variant="outline">Configure gates</Button>}
      />

      {/* Overview */}
      <div className="grid grid-cols-4 gap-0 divide-x divide-rule border-y border-rule py-6">
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">Average DQ</div>
          <div className="display-number text-4xl text-moss">{fmt.dec(avg, 2)}</div>
          <div className="text-xs text-ink-muted font-mono mt-1">/ 5.0</div>
        </div>
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">Verified</div>
          <div className="display-number text-4xl">{fmt.int(verified)}</div>
          <div className="text-xs text-ink-muted font-mono mt-1">
            of {fmt.int(total)} ({fmt.dec((verified / total) * 100, 0)}%)
          </div>
        </div>
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">High quality</div>
          <div className="display-number text-4xl">{fmt.int(dqCounts[3] + dqCounts[4])}</div>
          <div className="text-xs text-ink-muted font-mono mt-1">DQ 4-5</div>
        </div>
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">Open gaps</div>
          <div className="display-number text-4xl text-ember">{exceptions.filter((e) => e.status !== "resolved" && e.status !== "dismissed").length}</div>
          <div className="text-xs text-ink-muted font-mono mt-1">exceptions open</div>
        </div>
      </div>

      {/* Heatmap */}
      <section>
        <h2 className="font-display text-2xl tracking-tight mb-2">
          Quality heatmap
        </h2>
        <p className="text-sm text-ink-soft mb-6">
          Rows: facilities. Columns: categories. Cells are coloured by average
          DQ score; hover for record count.
        </p>
        <div className="border border-rule bg-paper-soft overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-rule">
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-ink-muted whitespace-nowrap sticky left-0 bg-paper-warm">
                  Facility
                </th>
                {categoriesInUse.map((c) => (
                  <th
                    key={c}
                    className="text-center px-2 py-3 text-[10px] uppercase tracking-widest text-ink-muted whitespace-nowrap"
                  >
                    {CATEGORY_LABELS[c] ?? c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cells.map((row) => (
                <tr key={row.facility.id} className="border-b border-rule last:border-0">
                  <td className="px-4 py-3 whitespace-nowrap sticky left-0 bg-paper-soft">
                    <div className="font-medium text-sm">{row.facility.name}</div>
                    <div className="text-[10px] uppercase tracking-widest text-ink-muted">
                      {row.facility.type.replace("_", " ")}
                    </div>
                  </td>
                  {row.cells.map((c) => (
                    <td key={c.category} className="p-1">
                      <Cell score={c.score} count={c.count} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs">
          <span className="text-ink-muted">Legend:</span>
          {[
            { s: 5, label: "Primary measured" },
            { s: 4, label: "Measured, some gaps" },
            { s: 3, label: "Modeled + activity" },
            { s: 2, label: "Industry average" },
            { s: 1, label: "Spend-based est." },
          ].map((l) => (
            <span key={l.s} className="inline-flex items-center gap-1.5">
              <Cell score={l.s} count={0} mini />
              <span className="text-ink-soft">DQ {l.s} · {l.label}</span>
            </span>
          ))}
        </div>
      </section>

      {/* Gaps list */}
      <section>
        <h2 className="font-display text-2xl tracking-tight mb-6">
          Open exceptions
        </h2>
        {exceptions.length === 0 ? (
          <div className="border border-rule bg-paper-soft p-8 text-center text-ink-muted text-sm">
            No exceptions raised.
          </div>
        ) : (
          <div className="border border-rule bg-paper-soft divide-y divide-rule">
            {exceptions.map((g) => {
              const severity = g.severity === "critical" ? "high" : g.severity === "warning" ? "medium" : "low";
              return (
                <div key={g.id} className="px-5 py-4 flex items-start gap-4 hover:bg-paper-warm transition-colors">
                  <div
                    className={`shrink-0 w-8 h-8 flex items-center justify-center ${
                      severity === "high"
                        ? "bg-ember-faint text-ember"
                        : severity === "medium"
                        ? "bg-ochre-faint text-ochre"
                        : "bg-slate-faint text-slate"
                    }`}
                  >
                    {severity === "high" ? <AlertTriangle className="w-4 h-4" /> : severity === "medium" ? <Clock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={severity === "high" ? "ember" : severity === "medium" ? "ochre" : "slate"}>
                        {g.rule_name ?? g.rule_code ?? "Rule"}
                      </Badge>
                      <Badge variant="outline">{g.status}</Badge>
                    </div>
                    <div className="font-medium text-sm">{g.message}</div>
                    {g.ai_explanation && (
                      <div className="text-xs text-ink-muted mt-1 leading-relaxed">{g.ai_explanation}</div>
                    )}
                    {g.suggested_action && (
                      <div className="text-xs text-ember mt-1">Suggested: {g.suggested_action}</div>
                    )}
                  </div>
                  <Button variant="outline" size="sm">Resolve</Button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Cell({ score, count, mini }: { score: number | null; count: number; mini?: boolean }) {
  if (score === null) {
    return (
      <div className={`${mini ? "w-4 h-4" : "w-full h-9"} bg-paper-warm border border-rule`} />
    );
  }
  const colors = [
    "bg-ember/80 text-paper", // 1
    "bg-ember/60 text-paper", // 2
    "bg-ochre/60 text-ink", // 3
    "bg-moss/60 text-paper", // 4
    "bg-moss/85 text-paper", // 5
  ];
  const color = colors[Math.round(score) - 1] ?? colors[0];
  const display = Math.round(score * 10) / 10;
  return (
    <div
      className={`${mini ? "w-4 h-4 text-[8px]" : "w-full h-9 text-xs"} ${color} flex flex-col items-center justify-center font-mono tabular leading-none`}
      title={`${count} records · DQ ${score.toFixed(2)}`}
    >
      {!mini && <span className="font-semibold">{display}</span>}
      {!mini && <span className="text-[9px] opacity-75">n={count}</span>}
    </div>
  );
}
