"use client";
import { useState } from "react";
import { TabOverview } from "./tab-overview";
import { TabActivity } from "./tab-activity";
import { TabSettings } from "./tab-settings";
import { HeroErp } from "./hero-erp";
import { HeroIot } from "./hero-iot";
import { HeroDoc } from "./hero-doc";
import { HeroFile } from "./hero-file";
import type { Connector, ConnectorDetail as ConnectorDetailType } from "@/lib/fixtures/sources";

export type DetailTab = "overview" | "hero" | "activity" | "settings";

const heroLabel: Record<Connector["type"], string> = {
  ERP: "GL Map",
  IoT: "Live stream",
  Document: "Review queue",
  File: "Uploads",
  API: "Preview",
};

export function ConnectorDetail({
  connector,
  detail,
  onDisconnect,
  initialTab = "overview",
}: {
  connector: Connector;
  detail: ConnectorDetailType;
  onDisconnect: () => void;
  initialTab?: DetailTab;
}) {
  const [tab, setTab] = useState<DetailTab>(initialTab);

  return (
    <div className="flex flex-col h-full">
      {/* Tab strip */}
      <div className="flex-shrink-0 border-b border-rule bg-paper">
        <nav className="flex text-xs">
          <TabBtn active={tab === "overview"} onClick={() => setTab("overview")}>
            Overview
          </TabBtn>
          <TabBtn active={tab === "hero"} onClick={() => setTab("hero")}>
            {heroLabel[connector.type]}
          </TabBtn>
          <TabBtn active={tab === "activity"} onClick={() => setTab("activity")}>
            Activity
          </TabBtn>
          <TabBtn active={tab === "settings"} onClick={() => setTab("settings")}>
            Settings
          </TabBtn>
        </nav>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {tab === "overview" && (
          <TabOverview connector={connector} detail={detail} />
        )}
        {tab === "hero" && <HeroDispatch connector={connector} detail={detail} />}
        {tab === "activity" && <TabActivity detail={detail} />}
        {tab === "settings" && (
          <TabSettings connector={connector} onDisconnect={onDisconnect} />
        )}
      </div>
    </div>
  );
}

function HeroDispatch({
  connector,
  detail,
}: {
  connector: Connector;
  detail: ConnectorDetailType;
}) {
  if (connector.type === "ERP")
    return <HeroErp connector={connector} detail={detail} />;
  if (connector.type === "IoT")
    return <HeroIot connector={connector} detail={detail} />;
  if (connector.type === "Document")
    return <HeroDoc connector={connector} detail={detail} />;
  if (connector.type === "File")
    return <HeroFile connector={connector} detail={detail} />;
  return (
    <div className="p-5 text-sm text-ink-muted italic">
      Hero view not available for this connector type yet.
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 border-r border-rule last:border-r-0 transition-colors relative ${
        active
          ? "text-ink font-medium bg-paper-warm"
          : "text-ink-muted hover:text-ink hover:bg-paper-warm"
      }`}
    >
      {children}
      {active && (
        <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-ink" />
      )}
    </button>
  );
}
