"use client";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Database, Wifi, FileText, FileSpreadsheet, Zap, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { connectors, type Connector } from "@/lib/fixtures/sources";

const typeIcons: Record<Connector["type"], React.ComponentType<{ className?: string; strokeWidth?: number | string }>> = {
  ERP: Database,
  IoT: Wifi,
  Document: FileText,
  File: FileSpreadsheet,
  API: Zap,
};

const order: Connector["type"][] = ["ERP", "IoT", "Document", "File"];

export function CatalogPicker({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onPick: (id: string) => void;
}) {
  const [q, setQ] = useState("");

  const filtered = connectors.filter((c) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      c.name.toLowerCase().includes(s) ||
      c.vendor.toLowerCase().includes(s) ||
      c.type.toLowerCase().includes(s)
    );
  });

  const grouped = order.map((t) => ({
    type: t,
    items: filtered.filter((c) => c.type === t),
  }));

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/30 data-[state=open]:animate-fade-in" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[640px] max-w-[96vw] max-h-[80vh] bg-paper-soft border border-rule shadow-lift flex flex-col focus:outline-none data-[state=open]:animate-fade-in"
        >
          <div className="flex-shrink-0 border-b border-rule px-5 py-4 flex items-center justify-between gap-3">
            <div>
              <Dialog.Title asChild>
                <h2 className="font-display text-xl tracking-tight">
                  Connector catalog
                </h2>
              </Dialog.Title>
              <Dialog.Description asChild>
                <div className="text-xs text-ink-muted mt-0.5">
                  Pick a source to configure. {connectors.length} connectors available.
                </div>
              </Dialog.Description>
            </div>
            <Dialog.Close className="w-8 h-8 flex items-center justify-center border border-rule bg-paper hover:bg-paper-warm transition-colors" aria-label="Close">
              <X className="w-3.5 h-3.5" strokeWidth={1.5} />
            </Dialog.Close>
          </div>

          {/* Search */}
          <div className="flex-shrink-0 px-5 py-3 border-b border-rule">
            <div className="flex items-center gap-2 border border-rule bg-paper px-3 py-2">
              <Search className="w-3.5 h-3.5 text-ink-muted" strokeWidth={1.5} />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search connectors, vendors…"
                className="flex-1 bg-transparent text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {grouped.map((g) =>
              g.items.length === 0 ? null : (
                <section key={g.type}>
                  <div className="px-5 py-2 border-b border-rule bg-paper">
                    <div className="text-micro uppercase tracking-widest text-ink-muted">
                      {g.type === "ERP" && "ERP & Finance"}
                      {g.type === "IoT" && "IoT & Meters"}
                      {g.type === "Document" && "Document AI"}
                      {g.type === "File" && "Manual file upload"}
                    </div>
                  </div>
                  <div className="divide-y divide-rule">
                    {g.items.map((c) => {
                      const Icon = typeIcons[c.type];
                      const isConnected = c.status !== "disconnected";
                      return (
                        <button
                          key={c.id}
                          onClick={() => {
                            onOpenChange(false);
                            onPick(c.id);
                          }}
                          className="w-full flex items-center gap-3 px-5 py-3 hover:bg-paper-warm transition-colors text-left"
                        >
                          <div className="w-9 h-9 bg-paper-warm border border-rule flex items-center justify-center text-[9px] font-mono font-semibold text-ink-soft shrink-0">
                            {c.logo}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {c.name}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-ink-muted mt-0.5">
                              <Icon className="w-3 h-3" strokeWidth={1.5} />
                              <span className="uppercase tracking-wider">{c.type}</span>
                              <span>·</span>
                              <span className="truncate">{c.vendor}</span>
                            </div>
                          </div>
                          <div className="shrink-0">
                            {isConnected ? (
                              <span className="text-[10px] uppercase tracking-wider text-moss font-mono">
                                Linked
                              </span>
                            ) : (
                              <Button variant="outline" size="sm" className="gap-1">
                                <Plus className="w-3 h-3" strokeWidth={1.5} />
                                Connect
                              </Button>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
