"use client";
import { cn } from "@/lib/utils";
import type { SyncEvent } from "@/lib/fixtures/sources";

/**
 * Tiny bar sparkline: each bar = one sync cycle.
 * Green = success, ember = error. Bars are skinny, editorial, no axes.
 */
export function HealthSparkline({
  history,
  className,
}: {
  history: SyncEvent[];
  className?: string;
}) {
  if (!history.length) return null;

  const maxRecords = Math.max(...history.map((h) => h.records || 1), 1);

  return (
    <div className={cn("flex items-end gap-[2px] h-8", className)}>
      {history.map((h, i) => {
        const height = h.ok ? Math.max(3, (h.records / maxRecords) * 28) : 28;
        return (
          <div
            key={i}
            className={cn(
              "w-[4px] rounded-[1px] transition-opacity",
              h.ok ? "bg-moss/80 hover:bg-moss" : "bg-ember/80 hover:bg-ember"
            )}
            style={{ height: `${height}px` }}
            title={`${new Date(h.at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} · ${h.ok ? `${h.records} records · ${h.ms}ms` : "failed"}`}
          />
        );
      })}
    </div>
  );
}
