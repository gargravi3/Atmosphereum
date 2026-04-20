"use client";
import { useState } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock, FileText, Sparkles, Database } from "lucide-react";
import { fmt, cn } from "@/lib/utils";

type Approval = {
  id: string;
  type: "report" | "factor" | "methodology" | "initiative";
  title: string;
  requester: string;
  submitted: string;
  value?: string;
  severity: "routine" | "significant" | "material";
};

const PENDING: Approval[] = [
  { id: "ap-01", type: "report", title: "FY25 Interim BRSR Principle 6 — v1.3", requester: "Kira Ellis", submitted: "2h ago", value: "4,183 tCO₂e", severity: "material" },
  { id: "ap-02", type: "factor", title: "Custom emission factor — Umbrae recycled poly kit", requester: "Serena Raman", submitted: "6h ago", value: "0.412 kgCO₂e/£", severity: "significant" },
  { id: "ap-03", type: "methodology", title: "Switch refrigerant reporting to AR6 GWP values", requester: "System", submitted: "yesterday", value: "R-410A: 2088 → 2256", severity: "significant" },
  { id: "ap-04", type: "initiative", title: "Approve capex for LED retrofit (opp-01)", requester: "Marcus Chen", submitted: "yesterday", value: "£1,420,000", severity: "material" },
  { id: "ap-05", type: "report", title: "TCFD 2024 — v1.1 narrative update", requester: "CFO Office", submitted: "3d ago", value: "Governance section only", severity: "routine" },
  { id: "ap-06", type: "initiative", title: "Fleet EV transition — phase 1 (opp-05)", requester: "Jess Hartley", submitted: "3d ago", value: "£62,000 capex", severity: "routine" },
];

const TYPE_META = {
  report: { icon: FileText, label: "Report", color: "ember" as const },
  factor: { icon: Sparkles, label: "Factor", color: "ochre" as const },
  methodology: { icon: Database, label: "Methodology", color: "slate" as const },
  initiative: { icon: CheckCircle2, label: "Initiative", color: "moss" as const },
};

export default function ApprovalsPage() {
  const [decided, setDecided] = useState<Record<string, "approved" | "rejected">>({});

  return (
    <div className="px-8 py-10 space-y-8">
      <SectionHeader
        eyebrow="Govern · Approvals"
        title="Nothing ships without a signature."
        description="A routed queue of pending decisions. Every approval or rejection writes to the audit trail with actor, timestamp, and justification."
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-0 divide-x divide-rule border-y border-rule py-6">
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">Pending</div>
          <div className="display-number text-3xl">{PENDING.length - Object.keys(decided).length}</div>
        </div>
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">Material items</div>
          <div className="display-number text-3xl text-ember">{PENDING.filter(p => p.severity === "material" && !decided[p.id]).length}</div>
        </div>
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">Avg wait</div>
          <div className="display-number text-3xl">18<span className="text-base text-ink-muted">h</span></div>
        </div>
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">SLA breach</div>
          <div className="display-number text-3xl text-moss">0</div>
        </div>
      </div>

      <div className="space-y-3">
        {PENDING.map((p) => {
          const d = decided[p.id];
          const meta = TYPE_META[p.type];
          const Icon = meta.icon;
          return (
            <div
              key={p.id}
              className={cn(
                "bg-paper-soft border p-5 transition-colors",
                d === "approved" && "border-moss/40 bg-moss-faint/30",
                d === "rejected" && "border-ember/40 bg-ember-faint/30",
                !d && "border-rule hover:border-ink-muted"
              )}
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className={cn(
                    "w-10 h-10 flex items-center justify-center shrink-0 border",
                    meta.color === "ember" && "bg-ember-faint text-ember border-ember/30",
                    meta.color === "moss" && "bg-moss-faint text-moss border-moss/30",
                    meta.color === "ochre" && "bg-ochre-faint text-ochre border-ochre/30",
                    meta.color === "slate" && "bg-slate-faint text-slate border-slate/30",
                  )}>
                    <Icon className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={meta.color}>{meta.label}</Badge>
                      <Badge variant={p.severity === "material" ? "ember" : p.severity === "significant" ? "ochre" : "outline"}>
                        {p.severity}
                      </Badge>
                    </div>
                    <h3 className="font-display text-lg leading-snug mb-1">{p.title}</h3>
                    <div className="text-xs text-ink-muted font-mono">
                      {p.requester} · Submitted {p.submitted}{p.value && ` · ${p.value}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {d ? (
                    <Badge variant={d === "approved" ? "moss" : "ember"}>
                      {d === "approved" ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {d === "approved" ? "Approved" : "Rejected"}
                    </Badge>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDecided((prev) => ({ ...prev, [p.id]: "rejected" }))}
                      >
                        <XCircle className="w-3 h-3" />
                        Reject
                      </Button>
                      <Button
                        variant="moss"
                        size="sm"
                        onClick={() => setDecided((prev) => ({ ...prev, [p.id]: "approved" }))}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Approve
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
