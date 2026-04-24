"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Database,
  TrendingDown,
  FileText,
  Shield,
  Settings,
  Leaf,
  Table,
  BookOpen,
  Gauge,
  Scissors,
  Lightbulb,
  MessageSquare,
  BarChart3,
  KanbanSquare,
  Library,
  Archive,
  ClipboardCheck,
  History,
  Users,
  Target,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Item = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number | string }>;
};

type Section = {
  id: string;
  label: string;
  items: Item[];
};

const NAV: Section[] = [
  {
    id: "overview",
    label: "Overview",
    items: [{ href: "/", label: "Executive Dashboard", icon: Home }],
  },
  {
    id: "record",
    label: "Record",
    items: [
      { href: "/record/sources", label: "Data Sources", icon: Database },
      { href: "/record/emissions", label: "Emission Records", icon: Table },
      { href: "/record/factors", label: "Emission Factors", icon: BookOpen },
      { href: "/record/suppliers", label: "Suppliers", icon: Users },
      { href: "/record/quality", label: "Data Quality", icon: Gauge },
    ],
  },
  {
    id: "reduce",
    label: "Reduce",
    items: [
      { href: "/reduce/teardown", label: "Teardown Analysis", icon: Scissors },
      { href: "/reduce/opportunities", label: "Opportunity Portfolio", icon: Lightbulb },
      { href: "/reduce/mac-curve", label: "MAC Curve", icon: BarChart3 },
      { href: "/reduce/initiatives", label: "Initiative Tracker", icon: KanbanSquare },
      { href: "/reduce/targets", label: "Net Zero Targets", icon: Target },
      { href: "/reduce/ideate", label: "AI Ideation", icon: MessageSquare },
    ],
  },
  {
    id: "report",
    label: "Report",
    items: [
      { href: "/report/builder", label: "Report Builder", icon: FileText },
      { href: "/report/frameworks", label: "Framework Library", icon: Library },
      { href: "/report/archive", label: "Archive", icon: Archive },
    ],
  },
  {
    id: "govern",
    label: "Govern",
    items: [
      { href: "/govern/approvals", label: "Approvals", icon: ClipboardCheck },
      { href: "/govern/materiality", label: "Materiality", icon: Scale },
      { href: "/govern/audit", label: "Audit Trail", icon: History },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-rule bg-paper-soft flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-rule">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-ink flex items-center justify-center">
            <Leaf className="w-5 h-5 text-paper" strokeWidth={1.5} />
          </div>
          <div>
            <div className="font-display text-lg leading-none tracking-tight">
              Atmosphereum
            </div>
            <div className="text-[10px] uppercase tracking-widest text-ink-muted mt-1">
              by EMIRLabs.ai
            </div>
          </div>
        </Link>
      </div>

      {/* Tenant */}
      <div className="px-6 py-4 border-b border-rule">
        <div className="text-[10px] uppercase tracking-widest text-ink-muted mb-1.5">
          Reporting entity
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Brentford FC</div>
            <div className="text-xs text-ink-muted font-mono">FY25 · GBP</div>
          </div>
          <div className="w-2 h-2 rounded-full bg-moss animate-pulse" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {NAV.map((section) => (
          <div key={section.id} className="mb-6">
            <div className="px-6 mb-2 text-[10px] uppercase tracking-[0.2em] text-ink-muted font-mono">
              {section.label}
            </div>
            <ul className="space-y-px">
              {section.items.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-6 py-2 text-sm transition-colors relative group",
                        active
                          ? "text-ink font-medium"
                          : "text-ink-soft hover:text-ink hover:bg-paper-warm"
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-ember" />
                      )}
                      <Icon
                        className={cn(
                          "w-4 h-4 shrink-0",
                          active ? "text-ember" : "text-ink-muted"
                        )}
                        strokeWidth={1.5}
                      />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Settings + user */}
      <div className="border-t border-rule">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-6 py-3 text-sm text-ink-soft hover:text-ink hover:bg-paper-warm transition-colors"
        >
          <Settings className="w-4 h-4 text-ink-muted" strokeWidth={1.5} />
          Settings
        </Link>
        <div className="flex items-center gap-3 px-6 py-4 border-t border-rule">
          <div className="w-8 h-8 bg-ochre-faint border border-ochre/30 flex items-center justify-center text-[11px] font-mono font-medium text-ochre">
            KE
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate">Kira Ellis</div>
            <div className="text-[10px] text-ink-muted truncate">
              Head of Sustainability
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
