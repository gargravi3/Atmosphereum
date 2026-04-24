"use client";
import { useState } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  FileText,
  Sparkles,
  Database,
  ChevronDown,
  User2,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApprovalRow } from "@/lib/db";

const TYPE_META: Record<string, { icon: React.ComponentType<{ className?: string; strokeWidth?: number | string }>; label: string; color: "ember" | "moss" | "ochre" | "slate" }> = {
  report: { icon: FileText, label: "Report", color: "ember" },
  factor: { icon: Sparkles, label: "Factor", color: "ochre" },
  methodology: { icon: Database, label: "Methodology", color: "slate" },
  initiative: { icon: CheckCircle2, label: "Initiative", color: "moss" },
  data_entry: { icon: Database, label: "Data entry", color: "slate" },
  emission_record: { icon: Database, label: "Emission record", color: "slate" },
};

function metaFor(type: string) {
  const key = type.toLowerCase();
  return (
    TYPE_META[key] ?? {
      icon: FileText,
      label: type.replace(/_/g, " "),
      color: "slate" as const,
    }
  );
}

export function ApprovalsView({ approvals }: { approvals: ApprovalRow[] }) {
  const [decided, setDecided] = useState<Record<string, "approved" | "rejected">>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => setExpandedId((prev) => (prev === id ? null : id));

  const pendingApprovals = approvals.filter((a) => a.status === "pending" || a.status === "in_review");
  const materialCount = pendingApprovals.filter((a) => a.priority === "high" || a.priority === "urgent").length;

  return (
    <div className="px-8 py-10 space-y-8">
      <SectionHeader
        eyebrow="Govern · Approvals"
        title="Nothing ships without a signature."
        description="A routed queue of pending decisions. Click any item to open the full submission — requester, approval chain, and comments. Every decision writes to the audit trail."
      />

      <div className="grid grid-cols-4 gap-0 divide-x divide-rule border-y border-rule py-6">
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">Pending</div>
          <div className="display-number text-3xl">{pendingApprovals.length - Object.keys(decided).length}</div>
        </div>
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">High priority</div>
          <div className="display-number text-3xl text-ember">{materialCount}</div>
        </div>
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">Total tracked</div>
          <div className="display-number text-3xl">{approvals.length}</div>
        </div>
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">Overdue</div>
          <div className="display-number text-3xl text-ochre">{approvals.filter((a) => a.is_overdue).length}</div>
        </div>
      </div>

      <div className="space-y-3">
        {approvals.map((p) => {
          const d = decided[p.id];
          const expanded = expandedId === p.id;
          const meta = metaFor(p.approval_type);
          const Icon = meta.icon;

          return (
            <article
              key={p.id}
              className={cn(
                "bg-paper-soft border transition-colors",
                d === "approved" && "border-moss/40 bg-moss-faint/30",
                d === "rejected" && "border-ember/40 bg-ember-faint/30",
                !d && expanded && "border-ink-muted",
                !d && !expanded && "border-rule hover:border-ink-muted"
              )}
            >
              <button
                type="button"
                onClick={() => toggle(p.id)}
                className="w-full text-left p-5 focus:outline-none focus-visible:bg-paper-warm"
                aria-expanded={expanded}
                aria-controls={`detail-${p.id}`}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div
                      className={cn(
                        "w-10 h-10 flex items-center justify-center shrink-0 border",
                        meta.color === "ember" && "bg-ember-faint text-ember border-ember/30",
                        meta.color === "moss" && "bg-moss-faint text-moss border-moss/30",
                        meta.color === "ochre" && "bg-ochre-faint text-ochre border-ochre/30",
                        meta.color === "slate" && "bg-slate-faint text-slate border-slate/30"
                      )}
                    >
                      <Icon className="w-4 h-4" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant={meta.color}>{meta.label}</Badge>
                        <Badge
                          variant={
                            p.priority === "urgent" || p.priority === "high"
                              ? "ember"
                              : p.priority === "normal"
                              ? "ochre"
                              : "outline"
                          }
                        >
                          {p.priority}
                        </Badge>
                        <Badge variant={p.status === "approved" ? "moss" : p.status === "rejected" ? "ember" : "outline"}>
                          {p.status}
                        </Badge>
                        {p.is_overdue && <Badge variant="ember">Overdue</Badge>}
                      </div>
                      <h3 className="font-display text-lg leading-snug mb-1">
                        {p.entity_description}
                      </h3>
                      <div className="text-xs text-ink-muted font-mono">
                        {p.requested_by} · {new Date(p.requested_at).toLocaleDateString()}
                        {p.due_date && ` · Due ${new Date(p.due_date).toLocaleDateString()}`}
                        {` · Level ${p.approval_level}/${p.max_level}`}
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
                      <span className="text-[10px] uppercase tracking-wider text-ink-muted font-mono">
                        {expanded ? "Hide detail" : "View detail"}
                      </span>
                    )}
                    <ChevronDown
                      className={cn("w-4 h-4 text-ink-muted transition-transform duration-200", expanded && "rotate-180")}
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
              </button>

              {expanded && (
                <div id={`detail-${p.id}`} className="border-t border-rule bg-paper animate-fade-in">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-rule">
                    <div className="lg:col-span-2 p-6 space-y-6 min-w-0">
                      <section>
                        <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">Request context</div>
                        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                          <div>
                            <dt className="text-[10px] uppercase tracking-widest text-ink-muted">Entity type</dt>
                            <dd className="font-mono mt-0.5">{p.entity_type}</dd>
                          </div>
                          <div>
                            <dt className="text-[10px] uppercase tracking-widest text-ink-muted">Entity ID</dt>
                            <dd className="font-mono text-xs mt-0.5">{p.entity_id.slice(0, 16)}…</dd>
                          </div>
                          <div>
                            <dt className="text-[10px] uppercase tracking-widest text-ink-muted">Current approver</dt>
                            <dd className="mt-0.5">{p.current_approver ?? "—"}</dd>
                          </div>
                          {p.resolved_at && (
                            <div>
                              <dt className="text-[10px] uppercase tracking-widest text-ink-muted">Resolved at</dt>
                              <dd className="font-mono text-xs mt-0.5">{new Date(p.resolved_at).toLocaleString()}</dd>
                            </div>
                          )}
                        </dl>
                      </section>

                      {p.comments && (
                        <section>
                          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">Comments</div>
                          <p className="text-sm text-ink-soft leading-relaxed italic">&ldquo;{p.comments}&rdquo;</p>
                        </section>
                      )}
                    </div>

                    <aside className="p-6 space-y-6 bg-paper-soft/50">
                      <section>
                        <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">Submitted by</div>
                        <div className="flex items-start gap-3 border border-rule bg-paper p-3">
                          <div className="w-8 h-8 bg-ochre-faint border border-ochre/30 flex items-center justify-center text-[11px] font-mono font-medium text-ochre shrink-0">
                            {initials(p.requested_by)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{p.requested_by}</div>
                            <div className="text-[10px] text-ink-faint font-mono mt-0.5">{new Date(p.requested_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </section>

                      <section>
                        <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">Approval chain</div>
                        <ol className="border border-rule bg-paper">
                          {p.steps.map((s, i) => {
                            const isLast = i === p.steps.length - 1;
                            const isNext = s.status === "pending" && (i === 0 || p.steps[i - 1].status === "approved");
                            return (
                              <li
                                key={s.id}
                                className={cn("relative flex items-start gap-3 px-3 py-3", !isLast && "border-b border-rule")}
                              >
                                <div className="shrink-0 pt-0.5">
                                  {s.status === "approved" ? (
                                    <CheckCircle2 className="w-4 h-4 text-moss" strokeWidth={1.5} />
                                  ) : s.status === "rejected" ? (
                                    <XCircle className="w-4 h-4 text-ember" strokeWidth={1.5} />
                                  ) : isNext ? (
                                    <span className="relative inline-flex w-4 h-4 items-center justify-center">
                                      <span className="absolute inset-0 rounded-full bg-ochre/20" />
                                      <span className="w-2 h-2 rounded-full bg-ochre animate-pulse" />
                                    </span>
                                  ) : (
                                    <Circle className="w-4 h-4 text-ink-faint" strokeWidth={1.5} />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-medium truncate">{s.approver}</div>
                                  <div className="text-[10px] text-ink-muted truncate">Level {s.level}</div>
                                  {s.action_at && (
                                    <div className="text-[10px] text-ink-faint font-mono mt-0.5">
                                      {s.status === "approved" ? "Signed " : s.status === "rejected" ? "Rejected " : ""}
                                      {new Date(s.action_at).toLocaleDateString()}
                                    </div>
                                  )}
                                  {s.comments && (
                                    <div className="text-[11px] text-ink-soft italic mt-1 leading-snug">
                                      &ldquo;{s.comments}&rdquo;
                                    </div>
                                  )}
                                  {isNext && (
                                    <div className="text-[10px] text-ochre uppercase tracking-wider font-mono mt-0.5">
                                      Awaiting action
                                    </div>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ol>
                      </section>
                    </aside>
                  </div>

                  {!d && p.status !== "approved" && p.status !== "rejected" && (
                    <div className="border-t border-rule px-6 py-4 flex items-center justify-between gap-4 bg-paper-soft">
                      <div className="text-[11px] text-ink-muted font-mono">
                        Decision will be recorded in audit trail with your name and justification.
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setDecided((prev) => ({ ...prev, [p.id]: "rejected" }))}>
                          <XCircle className="w-3 h-3" />
                          Reject
                        </Button>
                        <Button variant="moss" size="sm" onClick={() => setDecided((prev) => ({ ...prev, [p.id]: "approved" }))}>
                          <CheckCircle2 className="w-3 h-3" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {approvals.length === 0 && (
        <div className="border border-rule bg-paper-soft p-8 text-center text-ink-muted text-sm">
          No approval requests in queue.
        </div>
      )}
    </div>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}
