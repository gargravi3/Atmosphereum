"use client";
import { useState } from "react";
import { auditEvents } from "@/lib/fixtures";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Search, User, Bot } from "lucide-react";

export default function AuditPage() {
  const [query, setQuery] = useState("");
  const [entity, setEntity] = useState<string>("all");

  const entities = Array.from(new Set(auditEvents.map((e) => e.entity_type)));

  const filtered = auditEvents
    .filter((e) => entity === "all" || e.entity_type === entity)
    .filter((e) =>
      query === ""
        ? true
        : [e.actor, e.action, e.entity_id, e.detail ?? ""]
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase())
    );

  // Group by day
  const groups = filtered.reduce<Record<string, typeof filtered>>((acc, e) => {
    const day = e.timestamp.split("T")[0];
    (acc[day] ??= []).push(e);
    return acc;
  }, {});

  return (
    <div className="px-8 py-10 space-y-8">
      <SectionHeader
        eyebrow="Govern · Audit trail"
        title="Everything that ever happened, in order."
        description="An append-only record of every state transition — user actions, AI outputs, automated calculations, approvals. Immutable by design; exportable for external audit."
      />

      {/* Filters */}
      <div className="flex items-center gap-3 border-y border-rule py-4">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search actor, action, entity…"
              className="w-full h-8 pl-8 pr-3 text-sm bg-paper-soft border border-rule focus:border-ink-muted outline-none"
            />
          </div>
        </div>
        <select
          value={entity}
          onChange={(e) => setEntity(e.target.value)}
          className="h-8 px-3 text-xs bg-paper-soft border border-rule font-mono text-ink"
        >
          <option value="all">All entity types</option>
          {entities.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
        <div className="ml-auto text-xs text-ink-muted font-mono">
          {filtered.length} events · Immutable log
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {Object.entries(groups).map(([day, events]) => (
          <section key={day}>
            <div className="flex items-center gap-3 mb-4">
              <div className="font-display text-xl">{day}</div>
              <div className="flex-1 h-px bg-rule" />
              <div className="text-[10px] font-mono text-ink-muted uppercase tracking-widest">
                {events.length} events
              </div>
            </div>

            <div className="border-l-2 border-rule pl-6 ml-2 space-y-4">
              {events.map((e) => {
                const isSystem = e.actor === "system" || e.actor.toLowerCase().includes("system");
                const time = new Date(e.timestamp).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <div key={e.id} className="relative group">
                    <div className={cn(
                      "absolute -left-[30px] top-2 w-3 h-3 border-2 rounded-full",
                      isSystem ? "bg-paper-soft border-slate" : "bg-paper-soft border-ember"
                    )} />
                    <div className="bg-paper-soft border border-rule p-4 hover:border-ink-muted transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-7 h-7 shrink-0 flex items-center justify-center border text-xs font-medium",
                          isSystem ? "bg-slate-faint text-slate border-slate/30" : "bg-ember-faint text-ember border-ember/30"
                        )}>
                          {isSystem ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 text-sm mb-1 flex-wrap">
                            <span className="font-medium">{e.actor}</span>
                            <span className="text-ink-muted">{e.action.replace("_", " ")}</span>
                            <Badge variant="outline">{e.entity_type}</Badge>
                            <span className="text-[10px] font-mono text-ink-muted">{e.entity_id}</span>
                            <span className="ml-auto text-[10px] font-mono text-ink-muted">{time}</span>
                          </div>
                          {e.detail && (
                            <div className="text-xs text-ink-soft leading-relaxed mt-1">
                              {e.detail}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
