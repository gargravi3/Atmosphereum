"use client";
import { useState } from "react";
import { Edit3, Sparkles, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fmt } from "@/lib/utils";
import type { Connector, ConnectorDetail, ErpMapping } from "@/lib/fixtures/sources";

const categoryLabels: Record<string, string> = {
  electricity: "electricity",
  stationary_combustion: "stationary_combustion",
  mobile_combustion: "mobile_combustion",
  refrigerants: "refrigerants",
  heat_steam: "heat_steam",
  purchased_goods: "purchased_goods",
  fuel_energy_upstream: "fuel_energy_upstream",
  upstream_transport: "upstream_transport",
  waste: "waste",
  business_travel: "business_travel",
  commuting: "commuting",
  fan_travel: "fan_travel",
  water: "water",
};

function scopeBadge(scope: number) {
  if (scope === 1) return <Badge variant="ember">Scope 1</Badge>;
  if (scope === 2) return <Badge variant="ochre">Scope 2</Badge>;
  return <Badge variant="slate">Scope 3</Badge>;
}

export function HeroErp({
  connector,
  detail,
}: {
  connector: Connector;
  detail: ConnectorDetail;
}) {
  const [selected, setSelected] = useState<ErpMapping | null>(null);
  const mappings = detail.erpMappings || [];

  const lowConf = mappings.filter((m) => m.confidence < 0.7).length;
  const totalRecords = mappings.reduce((a, m) => a + m.records, 0);
  const avgConf =
    mappings.reduce((a, m) => a + m.confidence, 0) / Math.max(mappings.length, 1);

  return (
    <div className="p-5 space-y-5">
      {/* Header strip */}
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <div className="text-micro uppercase tracking-widest text-ink-muted">
              Ledger → Emission category
            </div>
            <h3 className="font-display text-xl tracking-tight mt-0.5">
              Account map
            </h3>
          </div>
          {connector.endpointHint && (
            <div className="font-mono text-[10px] text-ink-muted text-right break-all max-w-[240px]">
              {connector.endpointHint}
            </div>
          )}
        </div>
        <p className="text-xs text-ink-soft mt-1 leading-relaxed">
          AI proposes a category + scope per GL account. Rows with confidence
          below 70% surface to the review queue below.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-0 border border-rule divide-x divide-rule bg-paper">
        <div className="p-3">
          <div className="text-[10px] uppercase tracking-widest text-ink-muted">
            Mapped accounts
          </div>
          <div className="display-number text-xl mt-1">{mappings.length}</div>
        </div>
        <div className="p-3">
          <div className="text-[10px] uppercase tracking-widest text-ink-muted">
            Records
          </div>
          <div className="display-number text-xl mt-1">
            {fmt.int(totalRecords)}
          </div>
        </div>
        <div className="p-3">
          <div className="text-[10px] uppercase tracking-widest text-ink-muted">
            Avg confidence
          </div>
          <div
            className={`display-number text-xl mt-1 ${
              avgConf > 0.9 ? "text-moss" : "text-ochre"
            }`}
          >
            {(avgConf * 100).toFixed(0)}
            <span className="text-sm text-ink-muted">%</span>
          </div>
        </div>
      </div>

      {/* Needs review */}
      {lowConf > 0 && (
        <div className="flex items-start gap-2 p-3 bg-ochre-faint border border-ochre/30">
          <AlertCircle className="w-4 h-4 text-ochre shrink-0 mt-0.5" strokeWidth={1.5} />
          <div className="text-xs text-ink-soft">
            <span className="font-medium text-ochre">{lowConf} account{lowConf > 1 ? "s" : ""}</span>{" "}
            below 70% confidence — confirm the suggested category or assign your
            own before the next sync.
          </div>
        </div>
      )}

      {/* Mapping table */}
      <div className="border border-rule bg-paper">
        <div className="grid grid-cols-[80px_1fr_180px_80px_80px_40px] text-[10px] uppercase tracking-widest text-ink-muted font-mono border-b border-rule">
          <div className="px-3 py-2">GL</div>
          <div className="px-3 py-2">Description</div>
          <div className="px-3 py-2">Category</div>
          <div className="px-3 py-2">Scope</div>
          <div className="px-3 py-2 text-right">Records</div>
          <div className="px-3 py-2" />
        </div>
        <div className="divide-y divide-rule max-h-[340px] overflow-y-auto">
          {mappings.map((m) => {
            const isLow = m.confidence < 0.7;
            return (
              <div
                key={m.gl}
                onClick={() => setSelected(m)}
                className={`grid grid-cols-[80px_1fr_180px_80px_80px_40px] text-xs cursor-pointer transition-colors hover:bg-paper-warm ${
                  selected?.gl === m.gl ? "bg-paper-warm" : ""
                }`}
              >
                <div className="px-3 py-2 font-mono text-ink-soft">{m.gl}</div>
                <div className="px-3 py-2 truncate">{m.desc}</div>
                <div className="px-3 py-2 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Sparkles className="w-2.5 h-2.5 text-ember shrink-0" strokeWidth={2} />
                    <span className="font-mono text-[11px] truncate">
                      {categoryLabels[m.category] || m.category}
                    </span>
                  </div>
                  <div
                    className={`text-[10px] mt-0.5 ${
                      isLow ? "text-ochre" : "text-ink-faint"
                    }`}
                  >
                    {(m.confidence * 100).toFixed(0)}% conf.
                  </div>
                </div>
                <div className="px-3 py-2">{scopeBadge(m.scope)}</div>
                <div className="px-3 py-2 text-right font-mono tabular text-ink-soft">
                  {fmt.int(m.records)}
                </div>
                <div className="px-3 py-2 flex items-center text-ink-muted">
                  <Edit3 className="w-3 h-3" strokeWidth={1.5} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected detail */}
      {selected && (
        <div className="border border-rule bg-paper-warm p-4 animate-fade-in">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">
            Mapping detail · GL {selected.gl}
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <Field label="AI-suggested category" value={categoryLabels[selected.category] || selected.category} mono />
            <Field label="Confidence" value={`${(selected.confidence * 100).toFixed(1)}%`} mono />
            <Field label="Scope" value={`Scope ${selected.scope}`} mono />
            <Field label="Records" value={fmt.int(selected.records)} mono />
            <Field label="Status" value={selected.override ? "Overridden by user" : "Accepted"} />
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="border-l border-rule pl-3">
      <div className="text-[10px] uppercase tracking-widest text-ink-muted mb-0.5">
        {label}
      </div>
      <div className={mono ? "font-mono tabular text-xs" : "text-xs"}>{value}</div>
    </div>
  );
}
