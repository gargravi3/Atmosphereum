"use client";
import { opportunities } from "@/lib/fixtures";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fmt, cn } from "@/lib/utils";
import { Calendar, User, TrendingUp } from "lucide-react";

const COLUMNS = [
  { id: "proposed", label: "Proposed", tone: "slate" as const },
  { id: "approved", label: "Approved", tone: "moss" as const },
  { id: "in_progress", label: "In progress", tone: "ochre" as const },
  { id: "completed", label: "Completed", tone: "ember" as const },
];

export default function InitiativesPage() {
  const cols = COLUMNS.map((c) => ({
    ...c,
    items: opportunities.filter((o) => o.status === c.id),
  }));

  return (
    <div className="px-8 py-10 space-y-8">
      <SectionHeader
        eyebrow="Reduce · Initiative tracker"
        title="From idea to impact."
        description="Each initiative moves through four states. Projected versus actual savings reconcile automatically once meter data flows."
        actions={<Button>New initiative</Button>}
      />

      <div className="grid grid-cols-4 gap-4">
        {cols.map((col) => {
          const totalAbate = col.items.reduce((a, o) => a + o.abatement_tco2e, 0);
          const totalSave = col.items.reduce((a, o) => a + o.annual_savings_gbp, 0);
          return (
            <div key={col.id} className="bg-paper-soft border border-rule flex flex-col min-h-[600px]">
              {/* Column header */}
              <div className="p-4 border-b border-rule">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      col.tone === "moss" && "bg-moss",
                      col.tone === "ochre" && "bg-ochre",
                      col.tone === "slate" && "bg-slate",
                      col.tone === "ember" && "bg-ember",
                    )} />
                    <span className="font-display text-base">{col.label}</span>
                  </div>
                  <span className="text-xs font-mono text-ink-muted tabular">{col.items.length}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-mono text-ink-muted tabular">
                  <span>{fmt.int(totalAbate)} tCO₂e</span>
                  <span>·</span>
                  <span>{fmt.gbpShort(totalSave)}</span>
                </div>
              </div>

              {/* Cards */}
              <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {col.items.map((o) => (
                  <InitiativeCard key={o.id} opp={o} />
                ))}
                {col.items.length === 0 && (
                  <div className="p-6 text-center text-xs text-ink-muted italic border border-dashed border-rule m-2">
                    No items
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InitiativeCard({ opp }: { opp: typeof opportunities[number] }) {
  const progress =
    opp.actual_abatement && opp.abatement_tco2e
      ? (opp.actual_abatement / opp.abatement_tco2e) * 100
      : 0;

  return (
    <div className="bg-paper border border-rule p-3 hover:border-ink-muted transition-colors cursor-grab active:cursor-grabbing">
      <div className="flex items-center gap-1 mb-2">
        <Badge variant="outline">Scope {opp.scope}</Badge>
        <span className="text-[10px] font-mono text-ink-muted ml-auto">{opp.id}</span>
      </div>
      <h4 className="font-display text-sm leading-snug mb-3">{opp.title}</h4>

      <div className="grid grid-cols-2 gap-2 text-[10px] mb-3">
        <div>
          <div className="text-ink-muted uppercase tracking-widest">Abate</div>
          <div className="font-mono tabular text-ember font-medium">{fmt.int(opp.abatement_tco2e)} t</div>
        </div>
        <div>
          <div className="text-ink-muted uppercase tracking-widest">Save/yr</div>
          <div className={cn("font-mono tabular font-medium", opp.annual_savings_gbp >= 0 ? "text-moss" : "text-ember")}>
            {fmt.gbpShort(opp.annual_savings_gbp)}
          </div>
        </div>
      </div>

      {opp.actual_abatement !== undefined && (
        <div className="mb-3">
          <div className="flex items-baseline justify-between text-[9px] uppercase tracking-widest text-ink-muted mb-1">
            <span>Progress</span>
            <span>{fmt.dec(progress, 0)}%</span>
          </div>
          <div className="h-1 bg-paper-warm">
            <div className="h-full bg-moss" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-1 text-[10px] font-mono text-ink-muted">
            {fmt.int(opp.actual_abatement)} of {fmt.int(opp.abatement_tco2e)} tCO₂e
          </div>
        </div>
      )}

      {(opp.owner || opp.target_date) && (
        <div className="pt-2 border-t border-rule space-y-1 text-[10px] text-ink-muted font-mono">
          {opp.owner && (
            <div className="flex items-center gap-1.5">
              <User className="w-2.5 h-2.5" />
              <span className="truncate">{opp.owner}</span>
            </div>
          )}
          {opp.target_date && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-2.5 h-2.5" />
              <span>{opp.target_date}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
