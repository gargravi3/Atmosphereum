"use client";
import { useState, useMemo } from "react";
import { FileText, Check, X, ChevronRight, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fmt } from "@/lib/utils";
import type { Connector, ConnectorDetail, DocExtraction } from "@/lib/fixtures/sources";

type Tab = "pending" | "approved" | "rejected";

export function HeroDoc({
  connector,
  detail,
}: {
  connector: Connector;
  detail: ConnectorDetail;
}) {
  const queue = detail.docQueue || [];
  const [tab, setTab] = useState<Tab>("pending");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [localStatus, setLocalStatus] = useState<Record<string, Tab>>({});

  const effectiveStatus = (d: DocExtraction): Tab =>
    (localStatus[d.id] as Tab) ||
    (d.status === "pending" ? "pending" : d.status === "approved" ? "approved" : "rejected");

  const filtered = useMemo(
    () => queue.filter((q) => effectiveStatus(q) === tab),
    [queue, tab, localStatus]
  );

  const counts = {
    pending: queue.filter((q) => effectiveStatus(q) === "pending").length,
    approved: queue.filter((q) => effectiveStatus(q) === "approved").length,
    rejected: queue.filter((q) => effectiveStatus(q) === "rejected").length,
  };

  const selected = queue.find((q) => q.id === selectedId);

  const approveHi = () => {
    const toApprove = queue.filter(
      (q) => effectiveStatus(q) === "pending" && q.confidence >= 0.95
    );
    const next = { ...localStatus };
    toApprove.forEach((q) => (next[q.id] = "approved"));
    setLocalStatus(next);
  };

  return (
    <div className="p-5 space-y-5">
      <div>
        <div className="text-micro uppercase tracking-widest text-ink-muted">
          AI extraction queue
        </div>
        <h3 className="font-display text-xl tracking-tight mt-0.5">
          Review & approve
        </h3>
        <p className="text-xs text-ink-soft mt-1 leading-relaxed">
          Every ingested document is parsed by Atmosphereum's vision model. Fields
          below 80% confidence are highlighted for human approval. Bulk-approve
          high-confidence rows, or open a row to inspect side-by-side.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-0 border border-rule divide-x divide-rule bg-paper">
        <div className="p-3">
          <div className="text-[10px] uppercase tracking-widest text-ink-muted">
            Pending
          </div>
          <div className="display-number text-xl mt-1 text-ochre">
            {counts.pending}
          </div>
        </div>
        <div className="p-3">
          <div className="text-[10px] uppercase tracking-widest text-ink-muted">
            Approved
          </div>
          <div className="display-number text-xl mt-1 text-moss">
            {counts.approved}
          </div>
        </div>
        <div className="p-3">
          <div className="text-[10px] uppercase tracking-widest text-ink-muted">
            Rejected
          </div>
          <div className="display-number text-xl mt-1 text-ember">
            {counts.rejected}
          </div>
        </div>
      </div>

      {/* Tab strip */}
      <div className="flex items-center justify-between">
        <div className="flex border border-rule bg-paper">
          {(["pending", "approved", "rejected"] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setSelectedId(null);
              }}
              className={`px-3 py-1.5 text-[11px] uppercase tracking-wider border-r border-rule last:border-r-0 transition-colors ${
                tab === t ? "bg-ink text-paper" : "hover:bg-paper-warm text-ink-soft"
              }`}
            >
              {t} ({counts[t]})
            </button>
          ))}
        </div>
        {tab === "pending" && counts.pending > 0 && (
          <Button variant="outline" size="sm" className="gap-1.5" onClick={approveHi}>
            <CheckCheck className="w-3 h-3" strokeWidth={1.5} />
            Approve all ≥95%
          </Button>
        )}
      </div>

      {/* Queue */}
      {filtered.length === 0 ? (
        <div className="border border-rule bg-paper p-8 text-center text-xs text-ink-muted italic">
          No documents in this bucket.
        </div>
      ) : (
        <div className="border border-rule bg-paper divide-y divide-rule">
          {filtered.map((d) => (
            <div key={d.id}>
              <button
                onClick={() =>
                  setSelectedId(selectedId === d.id ? null : d.id)
                }
                className="w-full grid grid-cols-[auto_1fr_auto_auto_40px] items-center gap-3 px-3 py-2.5 hover:bg-paper-warm transition-colors text-left"
              >
                <div className="w-10 h-12 border border-rule bg-paper-warm flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-ink-muted" strokeWidth={1.25} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm truncate">{d.supplier}</div>
                  <div className="text-[10px] text-ink-muted font-mono truncate mt-0.5">
                    {d.filename} · {d.period}
                  </div>
                </div>
                <ConfidenceBar value={d.confidence} />
                <div className="font-mono tabular text-xs text-ink-soft shrink-0">
                  {fmt.gbp(d.total)}
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    selectedId === d.id ? "rotate-90" : ""
                  } text-ink-faint`}
                  strokeWidth={1.5}
                />
              </button>

              {selectedId === d.id && <DocumentDetail doc={d} onDecide={(s) => {
                setLocalStatus((prev) => ({ ...prev, [d.id]: s }));
              }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const color =
    value >= 0.95 ? "bg-moss" : value >= 0.8 ? "bg-ochre" : "bg-ember";
  return (
    <div className="flex items-center gap-2 shrink-0 w-[90px]">
      <div className="flex-1 h-1 bg-paper-warm overflow-hidden">
        <div
          className={`h-full ${color}`}
          style={{ width: `${value * 100}%` }}
        />
      </div>
      <span className="text-[10px] font-mono tabular text-ink-muted w-8 text-right">
        {(value * 100).toFixed(0)}%
      </span>
    </div>
  );
}

function DocumentDetail({
  doc,
  onDecide,
}: {
  doc: DocExtraction;
  onDecide: (status: Tab) => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_1fr] gap-0 border-t border-rule bg-paper-warm animate-fade-in">
      {/* Left: PDF preview mock */}
      <div className="p-4 border-r border-rule">
        <div className="text-[10px] uppercase tracking-widest text-ink-muted mb-2">
          Source document
        </div>
        <div className="border border-rule bg-paper aspect-[3/4] relative overflow-hidden">
          {/* Mock invoice layout */}
          <div className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <div className="h-2.5 bg-ink-faint w-24" />
                <div className="h-1.5 bg-rule w-16" />
              </div>
              <div className="h-4 bg-ink-faint w-16" />
            </div>
            <div className="space-y-1.5 mb-4">
              <div className="h-1 bg-rule w-full" />
              <div className="h-1 bg-rule w-5/6" />
              <div className="h-1 bg-rule w-2/3" />
            </div>
            {/* Highlighted field — supplier */}
            <div className="border border-ember/50 bg-ember-faint px-2 py-1 mb-2 relative">
              <div className="text-[8px] font-mono text-ember absolute -top-2 left-1 bg-paper px-1 uppercase">
                supplier
              </div>
              <div className="text-[10px] font-mono text-ink">{doc.supplier}</div>
            </div>
            {/* Highlighted field — period */}
            <div className="border border-ember/50 bg-ember-faint px-2 py-1 mb-2 relative">
              <div className="text-[8px] font-mono text-ember absolute -top-2 left-1 bg-paper px-1 uppercase">
                period
              </div>
              <div className="text-[10px] font-mono text-ink">{doc.period}</div>
            </div>
            <div className="space-y-1.5 mb-4">
              <div className="h-1 bg-rule w-full" />
              <div className="h-1 bg-rule w-3/4" />
            </div>
            {/* Highlighted field — total */}
            <div className="border border-ember/50 bg-ember-faint px-2 py-1 relative">
              <div className="text-[8px] font-mono text-ember absolute -top-2 left-1 bg-paper px-1 uppercase">
                total
              </div>
              <div className="text-[10px] font-mono text-ink">{fmt.gbp(doc.total)}</div>
            </div>
          </div>
        </div>
        <div className="text-[10px] text-ink-muted font-mono mt-2 truncate">
          {doc.filename}
        </div>
      </div>

      {/* Right: extracted fields */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] uppercase tracking-widest text-ink-muted">
            Extracted fields
          </div>
          <Badge variant={doc.confidence >= 0.95 ? "moss" : doc.confidence >= 0.8 ? "ochre" : "ember"}>
            {(doc.confidence * 100).toFixed(0)}% avg
          </Badge>
        </div>
        <div className="space-y-2 text-xs">
          {doc.fields.map((f) => {
            const low = f.conf < 0.8;
            return (
              <div
                key={f.key}
                className={`grid grid-cols-[110px_1fr_40px] gap-2 items-center px-2 py-1.5 border ${
                  low
                    ? "border-ochre/40 bg-ochre-faint/40"
                    : "border-rule bg-paper"
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider text-ink-muted">
                  {f.label}
                </div>
                <div className="font-mono truncate">{f.value}</div>
                <div
                  className={`text-[10px] font-mono text-right ${
                    low ? "text-ochre" : "text-ink-muted"
                  }`}
                >
                  {(f.conf * 100).toFixed(0)}%
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-2 pt-4 mt-4 border-t border-rule">
          <Button
            variant="moss"
            size="sm"
            className="gap-1.5"
            onClick={() => onDecide("approved")}
          >
            <Check className="w-3 h-3" strokeWidth={2} />
            Approve
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-ember hover:text-ember hover:bg-ember-faint"
            onClick={() => onDecide("rejected")}
          >
            <X className="w-3 h-3" strokeWidth={2} />
            Reject
          </Button>
          <Button variant="link" size="sm" className="ml-auto">
            Edit fields →
          </Button>
        </div>
      </div>
    </div>
  );
}
