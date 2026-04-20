"use client";
import { useState } from "react";
import { RotateCcw, Pause, Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Connector } from "@/lib/fixtures/sources";

export function TabSettings({
  connector,
  onDisconnect,
}: {
  connector: Connector;
  onDisconnect: () => void;
}) {
  const [freq, setFreq] = useState<"realtime" | "hourly" | "daily" | "weekly">(
    connector.type === "IoT" ? "realtime" : "hourly"
  );

  return (
    <div className="p-5 space-y-6">
      {/* Endpoint */}
      {connector.endpointHint && (
        <Row label="Endpoint">
          <div className="font-mono text-xs text-ink-soft break-all">
            {connector.endpointHint}
          </div>
        </Row>
      )}

      {/* Credentials (masked) */}
      {connector.credentialFields.length > 0 && (
        <div>
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">
            Credentials
          </div>
          <div className="border border-rule bg-paper divide-y divide-rule">
            {connector.credentialFields.map((f) => (
              <div
                key={f.key}
                className="px-3 py-2 grid grid-cols-[160px_1fr_auto] items-center gap-2 text-xs"
              >
                <div className="text-ink-muted">{f.label}</div>
                <div className="font-mono truncate">
                  {f.secret
                    ? "•".repeat(Math.min(f.sample.length, 16))
                    : f.sample}
                </div>
                {f.secret && (
                  <Button variant="ghost" size="sm" className="h-6 px-2 gap-1">
                    <RotateCcw className="w-3 h-3" strokeWidth={1.5} />
                    <span className="text-[10px] uppercase tracking-wider">
                      Rotate
                    </span>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sync frequency */}
      <div>
        <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">
          Sync frequency
        </div>
        <div className="grid grid-cols-4 gap-0 border border-rule bg-paper">
          {(["realtime", "hourly", "daily", "weekly"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFreq(f)}
              className={`px-3 py-2 text-xs border-r border-rule last:border-r-0 transition-colors ${
                freq === f
                  ? "bg-ink text-paper"
                  : "hover:bg-paper-warm text-ink-soft"
              }`}
            >
              <span className="capitalize">{f === "realtime" ? "Real-time" : f}</span>
            </button>
          ))}
        </div>
        <div className="text-[10px] text-ink-muted font-mono mt-1.5">
          {freq === "realtime" && "Streaming · best for IoT · highest cost"}
          {freq === "hourly" && "Cycle every 60m · balanced"}
          {freq === "daily" && "Once per day at 02:00 UTC"}
          {freq === "weekly" && "Mondays 02:00 UTC"}
        </div>
      </div>

      {/* Scope */}
      {connector.scopeEntities.length > 0 && (
        <div>
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">
            Enabled scope
          </div>
          <ul className="border border-rule bg-paper divide-y divide-rule">
            {connector.scopeEntities.map((e) => (
              <li
                key={e.key}
                className="px-3 py-2 text-xs flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="font-medium">{e.label}</div>
                  <div className="text-[10px] text-ink-muted truncate">
                    {e.description}
                  </div>
                </div>
                <div className="text-[10px] text-moss uppercase tracking-wider font-mono shrink-0">
                  {e.defaultOn ? "On" : "Off"}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Danger zone */}
      <div className="border-t border-rule pt-5 flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-1.5">
          <Pause className="w-3 h-3" strokeWidth={1.5} />
          Pause sync
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-ember hover:text-ember hover:bg-ember-faint"
          onClick={onDisconnect}
        >
          <Unplug className="w-3 h-3" strokeWidth={1.5} />
          Disconnect
        </Button>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-micro uppercase tracking-widest text-ink-muted mb-1">
        {label}
      </div>
      <div className="border border-rule bg-paper px-3 py-2">{children}</div>
    </div>
  );
}
