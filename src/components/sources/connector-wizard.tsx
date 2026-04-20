"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles, Database, Wifi, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmt } from "@/lib/utils";
import type { Connector } from "@/lib/fixtures/sources";

type Step = 1 | 2 | 3;

const typeIcon: Record<Connector["type"], React.ComponentType<{ className?: string; strokeWidth?: number | string }>> = {
  ERP: Database,
  IoT: Wifi,
  Document: FileText,
  File: Database,
  API: Database,
};

export function ConnectorWizard({
  connector,
  onCancel,
  onActivate,
}: {
  connector: Connector;
  onCancel: () => void;
  onActivate: () => void;
}) {
  const [step, setStep] = useState<Step>(1);
  const [useSample, setUseSample] = useState(true);
  const [creds, setCreds] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    connector.credentialFields.forEach((f) => {
      initial[f.key] = useSample ? f.sample : "";
    });
    return initial;
  });
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    connector.scopeEntities.forEach((e) => (map[e.key] = e.defaultOn));
    return map;
  });
  const [freq, setFreq] = useState<"realtime" | "hourly" | "daily" | "weekly">(
    connector.type === "IoT" ? "realtime" : "hourly"
  );
  const [testing, setTesting] = useState(false);
  const [testDone, setTestDone] = useState(false);

  // Reset creds when toggle changes
  useEffect(() => {
    setCreds(() => {
      const next: Record<string, string> = {};
      connector.credentialFields.forEach((f) => {
        next[f.key] = useSample ? f.sample : "";
      });
      return next;
    });
  }, [useSample, connector]);

  // Kick off test when entering step 3
  useEffect(() => {
    if (step === 3 && !testing && !testDone) {
      setTesting(true);
      const t = setTimeout(() => {
        setTesting(false);
        setTestDone(true);
      }, 2400);
      return () => clearTimeout(t);
    }
  }, [step, testing, testDone]);

  const canContinueFromStep1 = connector.credentialFields
    .filter((f) => f.required)
    .every((f) => (creds[f.key] || "").trim().length > 0);

  const enabledCount = Object.values(enabled).filter(Boolean).length;
  const canContinueFromStep2 = enabledCount > 0 || connector.scopeEntities.length === 0;

  const TypeIcon = typeIcon[connector.type];

  return (
    <div className="flex flex-col h-full">
      {/* Stepper */}
      <div className="flex-shrink-0 border-b border-rule bg-paper px-5 py-4">
        <div className="flex items-center gap-3">
          {([1, 2, 3] as Step[]).map((n, i) => (
            <div key={n} className="flex items-center gap-3 flex-1">
              <div
                className={`w-6 h-6 rounded-full border flex items-center justify-center text-[11px] font-mono shrink-0 ${
                  step === n
                    ? "bg-ink text-paper border-ink"
                    : step > n
                    ? "bg-moss text-paper border-moss"
                    : "bg-paper text-ink-muted border-rule"
                }`}
              >
                {step > n ? <CheckCircle2 className="w-3 h-3" strokeWidth={2} /> : n}
              </div>
              <div className="text-[11px] uppercase tracking-wider">
                <span className={step >= n ? "text-ink" : "text-ink-muted"}>
                  {["Credentials", "Scope", "Activate"][i]}
                </span>
              </div>
              {i < 2 && <div className="flex-1 h-px bg-rule" />}
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto min-h-0 p-5">
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h3 className="font-display text-xl tracking-tight">
                Connect {connector.name}
              </h3>
              <p className="text-xs text-ink-soft mt-1">
                Enter the tenant details Atmosphereum will use to authenticate. All
                secrets are stored encrypted and never leave your region.
              </p>
            </div>

            <label className="flex items-center gap-2 text-xs text-ink-soft cursor-pointer select-none">
              <input
                type="checkbox"
                checked={useSample}
                onChange={(e) => setUseSample(e.target.checked)}
                className="accent-ink"
              />
              <Sparkles className="w-3 h-3 text-ember" strokeWidth={1.5} />
              Use sample credentials (demo only)
            </label>

            <div className="space-y-3">
              {connector.credentialFields.length === 0 && (
                <div className="border border-rule bg-paper-warm p-4 text-xs text-ink-muted italic">
                  This connector needs no credentials — use the upload zone on
                  the Data Sources page.
                </div>
              )}
              {connector.credentialFields.map((f) => (
                <div key={f.key}>
                  <label className="block text-[10px] uppercase tracking-widest text-ink-muted mb-1">
                    {f.label} {f.required && <span className="text-ember">*</span>}
                  </label>
                  <input
                    type={f.secret ? "password" : "text"}
                    value={creds[f.key] || ""}
                    onChange={(e) =>
                      setCreds((prev) => ({ ...prev, [f.key]: e.target.value }))
                    }
                    placeholder={f.placeholder}
                    className="w-full font-mono text-xs px-3 py-2 border border-rule bg-paper focus:outline-none focus:border-ink"
                  />
                  {f.help && (
                    <div className="text-[10px] text-ink-muted mt-1">{f.help}</div>
                  )}
                </div>
              ))}
            </div>

            {connector.endpointHint && (
              <div className="text-[10px] text-ink-faint font-mono pt-2 border-t border-rule">
                Endpoint · {connector.endpointHint}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h3 className="font-display text-xl tracking-tight">
                Choose what to pull
              </h3>
              <p className="text-xs text-ink-soft mt-1">
                Select the entities Atmosphereum will sync. Each shows what it
                contributes to the carbon ledger.
              </p>
            </div>

            <div className="border border-rule bg-paper divide-y divide-rule">
              {connector.scopeEntities.length === 0 && (
                <div className="px-4 py-6 text-center text-xs text-ink-muted italic">
                  No scope configuration needed for this connector.
                </div>
              )}
              {connector.scopeEntities.map((e) => {
                const on = !!enabled[e.key];
                return (
                  <label
                    key={e.key}
                    className="px-3 py-3 flex items-start gap-3 cursor-pointer hover:bg-paper-warm transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={(ev) =>
                        setEnabled((prev) => ({
                          ...prev,
                          [e.key]: ev.target.checked,
                        }))
                      }
                      className="mt-0.5 accent-ink"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{e.label}</div>
                      <div className="text-[11px] text-ink-muted">{e.description}</div>
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-moss font-mono shrink-0">
                      {e.relevance}
                    </div>
                  </label>
                );
              })}
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-widest text-ink-muted mb-2 mt-4">
                Sync frequency
              </div>
              <div className="grid grid-cols-4 gap-0 border border-rule bg-paper">
                {(["realtime", "hourly", "daily", "weekly"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFreq(f)}
                    className={`px-2 py-2 text-[11px] border-r border-rule last:border-r-0 transition-colors capitalize ${
                      freq === f
                        ? "bg-ink text-paper"
                        : "hover:bg-paper-warm text-ink-soft"
                    }`}
                  >
                    {f === "realtime" ? "Real-time" : f}
                  </button>
                ))}
              </div>
              <div className="text-[10px] text-ink-muted font-mono mt-1">
                Impacts freshness score & API cost.
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h3 className="font-display text-xl tracking-tight">
                Activate connector
              </h3>
              <p className="text-xs text-ink-soft mt-1">
                Review the summary. When you activate, Atmosphereum runs a first sync
                and writes records to the carbon ledger.
              </p>
            </div>

            <div className="border border-rule bg-paper divide-y divide-rule">
              <Row label="Connector">
                <div className="flex items-center gap-2">
                  <TypeIcon className="w-3.5 h-3.5 text-ink-muted" strokeWidth={1.5} />
                  <span>{connector.name}</span>
                  <span className="text-[10px] text-ink-muted font-mono">
                    ({connector.type})
                  </span>
                </div>
              </Row>
              <Row label="Endpoint">
                <span className="font-mono text-[11px] text-ink-soft break-all">
                  {creds.host || creds.tenant || creds.gw || connector.sampleTenant || "—"}
                </span>
              </Row>
              <Row label="Scope">
                <span className="font-mono text-[11px]">
                  {enabledCount} entit{enabledCount === 1 ? "y" : "ies"} enabled
                </span>
              </Row>
              <Row label="Frequency">
                <span className="font-mono text-[11px] capitalize">
                  {freq === "realtime" ? "Real-time" : freq}
                </span>
              </Row>
              <Row label="Estimated throughput">
                <span className="font-mono text-[11px]">
                  {fmt.int(estimateThroughput(connector.type, freq))} records / day
                </span>
              </Row>
            </div>

            {/* Test connection */}
            <div className="border border-rule bg-paper-warm p-4">
              <div className="text-[10px] uppercase tracking-widest text-ink-muted mb-2">
                Connection test
              </div>
              {testing && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-ink-soft">
                    <span className="w-1.5 h-1.5 rounded-full bg-ochre animate-pulse" />
                    Negotiating OAuth handshake…
                  </div>
                  <div className="h-0.5 bg-paper overflow-hidden relative">
                    <div className="absolute inset-y-0 left-0 bg-ember shimmer w-full" />
                  </div>
                </div>
              )}
              {testDone && (
                <div className="space-y-1.5 text-xs animate-fade-in">
                  <div className="flex items-center gap-2 text-moss">
                    <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Handshake successful</span>
                  </div>
                  <div className="flex items-center gap-2 text-moss">
                    <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Fetched 1,248 sample records over last 7 days</span>
                  </div>
                  <div className="flex items-center gap-2 text-moss">
                    <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Schema validated against ledger</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-rule px-5 py-4 flex items-center justify-between gap-2 bg-paper-soft">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <div className="flex items-center gap-2">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep((step - 1) as Step)}
              className="gap-1.5"
            >
              <ArrowLeft className="w-3 h-3" strokeWidth={1.5} />
              Back
            </Button>
          )}
          {step < 3 && (
            <Button
              onClick={() => setStep((step + 1) as Step)}
              disabled={
                (step === 1 && !canContinueFromStep1) ||
                (step === 2 && !canContinueFromStep2)
              }
              className="gap-1.5"
            >
              Next
              <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
            </Button>
          )}
          {step === 3 && (
            <Button
              variant="moss"
              onClick={onActivate}
              disabled={!testDone}
              className="gap-1.5"
            >
              Activate
              <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-3 py-2 grid grid-cols-[140px_1fr] items-center text-xs">
      <div className="text-ink-muted">{label}</div>
      <div>{children}</div>
    </div>
  );
}

function estimateThroughput(type: Connector["type"], freq: string) {
  const baseByType: Record<Connector["type"], number> = {
    ERP: 4_000,
    IoT: 20_000,
    Document: 12,
    File: 0,
    API: 1_000,
  };
  const mult: Record<string, number> = {
    realtime: 1.2,
    hourly: 1.0,
    daily: 0.3,
    weekly: 0.05,
  };
  return Math.round(baseByType[type] * (mult[freq] ?? 1));
}
