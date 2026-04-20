"use client";
import { useState } from "react";
import { FileSpreadsheet, ChevronRight, Download, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmt } from "@/lib/utils";
import { csvTemplates } from "@/lib/fixtures/sources";
import type { Connector, ConnectorDetail } from "@/lib/fixtures/sources";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.round(diff / 3_600_000);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export function HeroFile({
  connector,
  detail,
}: {
  connector: Connector;
  detail: ConnectorDetail;
}) {
  const uploads = detail.fileUploads || [];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = uploads.find((u) => u.id === selectedId);

  return (
    <div className="p-5 space-y-6">
      <div>
        <div className="text-micro uppercase tracking-widest text-ink-muted">
          Uploads · column mapping
        </div>
        <h3 className="font-display text-xl tracking-tight mt-0.5">
          Template library & recent files
        </h3>
        <p className="text-xs text-ink-soft mt-1 leading-relaxed">
          Download the right template, drop the filled CSV above, and Atmosphereum
          auto-suggests a column map. Low-confidence mappings wait for your
          confirmation before committing to the ledger.
        </p>
      </div>

      {/* Templates */}
      <div>
        <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">
          Schema templates
        </div>
        <div className="border border-rule bg-paper divide-y divide-rule">
          {csvTemplates.map((t) => (
            <div
              key={t.key}
              className="px-3 py-2 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium">{t.name}</div>
                <div className="text-[10px] text-ink-muted truncate">
                  {t.description}
                </div>
                <div className="text-[10px] text-ink-faint font-mono truncate mt-0.5">
                  {t.columns.join(" · ")}
                </div>
              </div>
              <Button variant="ghost" size="sm" className="gap-1.5 shrink-0">
                <Download className="w-3 h-3" strokeWidth={1.5} />
                .csv
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent uploads */}
      <div>
        <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">
          Recent uploads
        </div>
        <div className="border border-rule bg-paper divide-y divide-rule">
          {uploads.map((u) => (
            <div key={u.id}>
              <button
                onClick={() =>
                  setSelectedId(selectedId === u.id ? null : u.id)
                }
                className="w-full grid grid-cols-[auto_1fr_auto_auto_auto_40px] items-center gap-3 px-3 py-2.5 hover:bg-paper-warm transition-colors text-left"
              >
                <div className="w-8 h-8 border border-rule bg-paper-warm flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-ink-muted" strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-mono truncate">{u.filename}</div>
                  <div className="text-[10px] text-ink-muted">
                    {u.user} · {timeAgo(u.at)} · template <span className="font-mono">{u.template}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono tabular text-xs">
                    {fmt.int(u.rows)}
                  </div>
                  <div className="text-[10px] text-ink-faint">rows</div>
                </div>
                {u.flagged > 0 ? (
                  <div className="flex items-center gap-1 text-ochre shrink-0">
                    <AlertTriangle className="w-3 h-3" strokeWidth={1.5} />
                    <span className="text-[10px] font-mono tabular">
                      {u.flagged}
                    </span>
                  </div>
                ) : (
                  <CheckCircle2 className="w-3 h-3 text-moss shrink-0" strokeWidth={1.5} />
                )}
                <ChevronRight
                  className={`w-4 h-4 text-ink-faint transition-transform ${
                    selectedId === u.id ? "rotate-90" : ""
                  }`}
                  strokeWidth={1.5}
                />
              </button>

              {selectedId === u.id && (
                <div className="border-t border-rule bg-paper-warm p-4 animate-fade-in">
                  <div className="text-[10px] uppercase tracking-widest text-ink-muted mb-2">
                    Column mapping · {u.mapping.length} columns detected
                  </div>
                  <div className="border border-rule bg-paper">
                    <div className="grid grid-cols-[1fr_auto_1fr_80px] text-[10px] uppercase tracking-widest text-ink-muted font-mono border-b border-rule">
                      <div className="px-3 py-2">Source column</div>
                      <div className="px-2 py-2"></div>
                      <div className="px-3 py-2">Target field</div>
                      <div className="px-3 py-2 text-right">Conf.</div>
                    </div>
                    <div className="divide-y divide-rule">
                      {u.mapping.map((m) => {
                        const low = m.confidence < 0.9;
                        return (
                          <div
                            key={m.source}
                            className="grid grid-cols-[1fr_auto_1fr_80px] items-center text-xs"
                          >
                            <div className="px-3 py-2 font-mono text-ink-soft truncate">
                              {m.source}
                            </div>
                            <div className="px-2 py-2 flex items-center justify-center">
                              <ArrowRight className="w-3 h-3 text-ink-faint" strokeWidth={1.25} />
                            </div>
                            <div className="px-3 py-2 font-mono text-ink truncate">
                              {m.target}
                            </div>
                            <div
                              className={`px-3 py-2 text-right font-mono ${
                                low ? "text-ochre" : "text-ink-muted"
                              }`}
                            >
                              {(m.confidence * 100).toFixed(0)}%
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
