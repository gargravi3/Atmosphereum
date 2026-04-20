"use client";
import { Bell, Search, Command } from "lucide-react";
import { fmt } from "@/lib/utils";

export function Topbar({ breadcrumbs }: { breadcrumbs?: { label: string; href?: string }[] }) {
  const now = new Date();

  return (
    <header className="h-14 px-8 flex items-center justify-between border-b border-rule bg-paper-soft/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-4 text-sm">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-2 text-ink-muted">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-ink-faint">/</span>}
                <span className={i === breadcrumbs.length - 1 ? "text-ink" : ""}>
                  {b.label}
                </span>
              </span>
            ))}
          </nav>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 px-3 h-8 border border-rule bg-paper hover:border-ink-muted transition-colors text-xs text-ink-muted">
          <Search className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span>Search anything</span>
          <kbd className="ml-6 px-1.5 py-0.5 bg-paper-warm border border-rule text-[10px] font-mono flex items-center gap-0.5">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>

        <div className="text-xs text-ink-muted font-mono hidden lg:block">
          {fmt.date(now)}
        </div>

        <button className="relative w-8 h-8 flex items-center justify-center text-ink-muted hover:text-ink transition-colors">
          <Bell className="w-4 h-4" strokeWidth={1.5} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-ember rounded-full" />
        </button>
      </div>
    </header>
  );
}
