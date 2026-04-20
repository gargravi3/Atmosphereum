"use client";
import { CheckCircle2, XCircle } from "lucide-react";
import { fmt } from "@/lib/utils";
import type { ConnectorDetail } from "@/lib/fixtures/sources";

export function TabActivity({ detail }: { detail: ConnectorDetail }) {
  return (
    <div className="p-5">
      <div className="text-micro uppercase tracking-widest text-ink-muted mb-3">
        Sync & event log
      </div>
      <div className="border border-rule bg-paper">
        <div className="grid grid-cols-[auto_1fr_auto_auto] text-[10px] uppercase tracking-widest text-ink-muted font-mono border-b border-rule">
          <div className="px-3 py-2">When</div>
          <div className="px-3 py-2">Event</div>
          <div className="px-3 py-2 text-right">Records</div>
          <div className="px-3 py-2">Status</div>
        </div>
        <div className="divide-y divide-rule">
          {detail.activity.map((a, i) => (
            <div
              key={i}
              className="grid grid-cols-[auto_1fr_auto_auto] text-xs"
            >
              <div className="px-3 py-2 font-mono text-ink-muted whitespace-nowrap">
                {new Date(a.at).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div className="px-3 py-2 min-w-0">
                <div className="truncate">{a.event}</div>
                {a.detail && (
                  <div className="text-[10px] text-ink-muted truncate">
                    {a.detail}
                  </div>
                )}
              </div>
              <div className="px-3 py-2 font-mono tabular text-right text-ink-soft">
                {a.records > 0 ? fmt.int(a.records) : "—"}
              </div>
              <div className="px-3 py-2 flex items-center">
                {a.ok ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-moss" strokeWidth={1.5} />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-ember" strokeWidth={1.5} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
