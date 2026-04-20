import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

export function Stat({
  label,
  value,
  unit,
  delta,
  trend,
  footnote,
  emphasis,
  className,
}: {
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
  footnote?: string;
  emphasis?: "ember" | "moss" | "slate" | "ochre";
  className?: string;
}) {
  const trendColor =
    trend === "down"
      ? "text-moss"
      : trend === "up"
      ? "text-ember"
      : "text-ink-muted";

  const emphasisColor =
    emphasis === "ember"
      ? "text-ember"
      : emphasis === "moss"
      ? "text-moss"
      : emphasis === "slate"
      ? "text-slate"
      : emphasis === "ochre"
      ? "text-ochre"
      : "text-ink";

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="text-micro uppercase tracking-widest text-ink-muted mb-3">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <div className={cn("display-number text-5xl leading-none", emphasisColor)}>
          {value}
        </div>
        {unit && (
          <div className="text-sm text-ink-muted font-mono">{unit}</div>
        )}
      </div>
      {(delta || footnote) && (
        <div className="mt-3 flex items-center gap-2 text-xs text-ink-muted">
          {delta && (
            <span className={cn("inline-flex items-center gap-0.5 font-mono", trendColor)}>
              {trend === "down" ? <ArrowDown className="w-3 h-3" /> : trend === "up" ? <ArrowUp className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
              {delta}
            </span>
          )}
          {footnote && <span className="italic">{footnote}</span>}
        </div>
      )}
    </div>
  );
}
