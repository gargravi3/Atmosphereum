"use client";
import { fmt } from "@/lib/utils";

export function CostWaterfall({
  actual,
  should,
  waste,
}: {
  actual: number;
  should: number;
  waste: number;
}) {
  const wastePct = (waste / actual) * 100;
  const shouldPct = (should / actual) * 100;

  return (
    <div className="space-y-6">
      {/* Actual bar (100%) */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <div>
            <div className="text-micro uppercase tracking-widest text-ink-muted">
              Actual spend (12m)
            </div>
            <div className="display-number text-2xl text-ink">
              {fmt.gbpShort(actual)}
            </div>
          </div>
          <div className="text-xs font-mono text-ink-muted">100%</div>
        </div>
        <div className="h-8 bg-slate/20 border border-slate/30" />
      </div>

      {/* Should cost */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <div>
            <div className="text-micro uppercase tracking-widest text-ink-muted">
              Should cost (benchmark)
            </div>
            <div className="display-number text-2xl text-slate">
              {fmt.gbpShort(should)}
            </div>
          </div>
          <div className="text-xs font-mono text-ink-muted">
            {fmt.dec(shouldPct, 1)}%
          </div>
        </div>
        <div className="relative h-8 bg-paper-warm border border-rule">
          <div
            className="absolute inset-y-0 left-0 bg-slate/40 border-r border-slate"
            style={{ width: `${shouldPct}%` }}
          />
        </div>
      </div>

      {/* Waste */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <div>
            <div className="text-micro uppercase tracking-widest text-ember">
              Waste cost identified
            </div>
            <div className="display-number text-3xl text-ember">
              {fmt.gbpShort(waste)}
            </div>
          </div>
          <div className="text-xs font-mono text-ember">
            {fmt.dec(wastePct, 1)}%
          </div>
        </div>
        <div className="relative h-8 bg-paper-warm border border-rule">
          <div
            className="absolute inset-y-0 right-0 bg-ember/30 border-l border-ember"
            style={{ width: `${wastePct}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-ink-soft leading-relaxed italic">
          Waste = Actual − Benchmark. Represents recoverable cost and carbon
          through operational, procurement, and design actions.
        </div>
      </div>
    </div>
  );
}
