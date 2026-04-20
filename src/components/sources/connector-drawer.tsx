"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Database, Wifi, FileText, FileSpreadsheet, Zap, MoreHorizontal, RefreshCw } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConnectorDetail } from "./connector-detail";
import { ConnectorWizard } from "./connector-wizard";
import { detailFor, type Connector } from "@/lib/fixtures/sources";

const typeIcons: Record<Connector["type"], React.ComponentType<{ className?: string; strokeWidth?: number | string }>> = {
  ERP: Database,
  IoT: Wifi,
  Document: FileText,
  File: FileSpreadsheet,
  API: Zap,
};

const statusStyle: Record<Connector["status"], { label: string; dot: string; badge: "moss" | "ochre" | "ember" | "outline" }> = {
  connected: { label: "Connected", dot: "bg-moss", badge: "moss" },
  syncing: { label: "Syncing", dot: "bg-ochre animate-pulse", badge: "ochre" },
  error: { label: "Error", dot: "bg-ember", badge: "ember" },
  disconnected: { label: "Not linked", dot: "bg-ink-faint", badge: "outline" },
};

export function ConnectorDrawer({
  connector,
  open,
  onOpenChange,
}: {
  connector: Connector | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local optimistic state so the drawer can reflect activation / disconnect
  const [localStatus, setLocalStatus] = useState<Connector["status"] | null>(null);
  const [syncingPulse, setSyncingPulse] = useState(false);

  // Reset local state when opening a different connector
  useEffect(() => {
    setLocalStatus(null);
    setSyncingPulse(false);
  }, [connector?.id]);

  if (!connector) return null;

  const status = localStatus || connector.status;
  const isWizard = status === "disconnected";
  const Icon = typeIcons[connector.type];
  const st = statusStyle[status];
  const detail = detailFor(connector.id);

  const onActivate = () => {
    setLocalStatus("syncing");
    setSyncingPulse(true);
    setTimeout(() => {
      setLocalStatus("connected");
      setSyncingPulse(false);
    }, 2400);
  };

  const onDisconnect = () => {
    setLocalStatus("disconnected");
  };

  const onSyncNow = () => {
    setLocalStatus("syncing");
    setSyncingPulse(true);
    setTimeout(() => {
      setLocalStatus("connected");
      setSyncingPulse(false);
    }, 2400);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      // Strip query params on close
      const params = new URLSearchParams(searchParams.toString());
      params.delete("connector");
      params.delete("tab");
      const q = params.toString();
      router.replace(q ? `?${q}` : "?", { scroll: false });
    }
    onOpenChange(next);
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange} widthClass="w-[600px]">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-rule px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-11 h-11 bg-paper-warm border border-rule flex items-center justify-center text-[10px] font-mono font-semibold text-ink-soft shrink-0">
              {connector.logo}
            </div>
            <div className="min-w-0 flex-1">
              <DrawerTitle asChild>
                <h2 className="font-display text-xl tracking-tight truncate">
                  {connector.name}
                </h2>
              </DrawerTitle>
              <DrawerDescription asChild>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-ink-muted">
                  <Icon className="w-3 h-3" strokeWidth={1.5} />
                  <span className="uppercase tracking-wider">{connector.type}</span>
                  <span>·</span>
                  <span>{connector.vendor}</span>
                </div>
              </DrawerDescription>
            </div>
          </div>
          <DrawerClose />
        </div>

        {/* Status row */}
        <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-rule">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${st.dot}`} />
            <span className="text-xs uppercase tracking-wider text-ink-soft">
              {st.label}
            </span>
            {syncingPulse && (
              <span className="text-[10px] text-ochre font-mono ml-1">
                syncing…
              </span>
            )}
          </div>
          {!isWizard && (
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={onSyncNow}
                disabled={syncingPulse}
              >
                <RefreshCw
                  className={`w-3 h-3 ${syncingPulse ? "animate-spin" : ""}`}
                  strokeWidth={1.5}
                />
                Sync now
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="w-3.5 h-3.5" strokeWidth={1.5} />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Body — wizard or detail */}
      <div className="flex-1 min-h-0">
        {isWizard ? (
          <ConnectorWizard
            connector={connector}
            onCancel={() => handleOpenChange(false)}
            onActivate={onActivate}
          />
        ) : detail ? (
          <ConnectorDetail
            connector={connector}
            detail={detail}
            onDisconnect={onDisconnect}
            initialTab={(searchParams.get("tab") as any) || "overview"}
          />
        ) : (
          <div className="p-8 text-center">
            <div className="text-xs text-ink-muted italic">
              Just activated — first sync in progress. Detail will appear once
              data has landed.
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}
