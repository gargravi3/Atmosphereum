"use client";
import { Activity, CheckCircle2, XCircle } from "lucide-react";
import { fmt } from "@/lib/utils";
import { HealthSparkline } from "./health-sparkline";
import { LineageCard } from "./lineage-card";
import type { Connector, ConnectorDetail } from "@/lib/fixtures/sources";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export function TabOverview({
  connector,
  detail,
}: {
  connector: Connector;
  detail: ConnectorDetail;
}) {
  const recentActivity = detail.activity.slice(0, 5);
  const healthStatus = detail.errorRatePct > 1 ? "Degraded" : "Connected";
  const healthColor = detail.errorRatePct > 1 ? "ochre" : "moss";

  return (
    <div className="p-5 space-y-6">
      {/* Health strip */}
      <div className="border border-rule bg-paper p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-micro uppercase tracking-widest text-ink-muted mb-1">
              Connection health · last 24 syncs
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  healthColor === "moss" ? "bg-moss" : "bg-ochre"
                }`}
              />
              <span className="font-display text-lg">{healthStatus}</span>
            </div>
          </div>
          <HealthSparkline history={detail.syncHistory} />
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-0 border border-rule divide-x divide-rule">
        <div className="p-4">
          <div className="text-[10px] uppercase tracking-widest text-ink-muted mb-1">
            Records total
          </div>
          <div className="display-number text-2xl">{fmt.int(connector.records)}</div>
          <div className="text-[10px] text-ink-muted font-mono mt-1">
            {fmt.int(detail.recordsToday)} today
          </div>
        </div>
        <div className="p-4">
          <div className="text-[10px] uppercase tracking-widest text-ink-muted mb-1">
            Last sync
          </div>
          <div className="display-number text-2xl">{connector.lastSync}</div>
          <div className="text-[10px] text-ink-muted font-mono mt-1">
            {detail.avgLatencyMs > 0 ? `${detail.avgLatencyMs}ms avg` : "—"}
          </div>
        </div>
        <div className="p-4 border-t border-rule">
          <div className="text-[10px] uppercase tracking-widest text-ink-muted mb-1">
            Data freshness
          </div>
          <div className="display-number text-2xl text-moss">
            {fmt.dec(detail.freshnessPct)}
            <span className="text-sm text-ink-muted">%</span>
          </div>
        </div>
        <div className="p-4 border-t border-rule">
          <div className="text-[10px] uppercase tracking-widest text-ink-muted mb-1">
            Error rate
          </div>
          <div
            className={`display-number text-2xl ${
              detail.errorRatePct > 1 ? "text-ochre" : "text-ink"
            }`}
          >
            {fmt.dec(detail.errorRatePct)}
            <span className="text-sm text-ink-muted">%</span>
          </div>
        </div>
      </div>

      {/* Lineage */}
      <LineageCard connectorName={connector.name} lineage={detail.lineage} />

      {/* Recent activity */}
      <div className="border border-rule bg-paper">
        <div className="px-4 py-3 border-b border-rule flex items-center justify-between">
          <div className="text-micro uppercase tracking-widest text-ink-muted">
            Recent activity
          </div>
          <Activity className="w-3 h-3 text-ink-muted" strokeWidth={1.5} />
        </div>
        <ul className="divide-y divide-rule">
          {recentActivity.map((a, i) => (
            <li key={i} className="px-4 py-2.5 flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {a.ok ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-moss" strokeWidth={1.5} />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-ember" strokeWidth={1.5} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="text-sm truncate">{a.event}</div>
                  <div className="text-[10px] text-ink-muted font-mono shrink-0">
                    {timeAgo(a.at)}
                  </div>
                </div>
                {a.detail && (
                  <div className="text-[11px] text-ink-muted mt-0.5 truncate">
                    {a.detail}
                  </div>
                )}
                {a.records > 0 && (
                  <div className="text-[10px] text-ink-faint font-mono mt-0.5">
                    +{fmt.int(a.records)} records
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
