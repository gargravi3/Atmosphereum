"use client";
import { useState } from "react";
import { frameworks } from "@/lib/fixtures";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, BookOpen } from "lucide-react";

export default function FrameworksPage() {
  const [active, setActive] = useState<"BRSR" | "CDP" | "CSRD" | "TCFD">("BRSR");
  const fw = frameworks.find((f) => f.id === active)!;

  return (
    <div className="px-8 py-10 space-y-8">
      <SectionHeader
        eyebrow="Report · Framework library"
        title="Every disclosure, mapped."
        description="Disclosure requirements across global frameworks with live mappings to Atmosphereum metrics. Hover a disclosure to see which ledger values satisfy it."
      />

      <div className="grid grid-cols-[220px_1fr] gap-8">
        {/* Framework list */}
        <aside>
          <div className="text-[10px] uppercase tracking-widest text-ink-muted font-mono mb-3">
            Frameworks
          </div>
          <ul className="border border-rule bg-paper-soft">
            {frameworks.map((f) => (
              <li key={f.id} className="border-b border-rule last:border-0">
                <button
                  onClick={() => setActive(f.id)}
                  className={cn(
                    "w-full text-left px-4 py-4 hover:bg-paper-warm transition-colors",
                    active === f.id && "bg-paper-warm"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="w-3 h-3 text-ember" />
                    <span className="font-display text-base">{f.id}</span>
                  </div>
                  <div className="text-xs text-ink-muted leading-snug">
                    {f.disclosures.length} disclosures
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Disclosure list */}
        <div>
          <h2 className="font-display text-2xl tracking-tight mb-1">
            {fw.name}
          </h2>
          <p className="text-sm text-ink-soft mb-6">{fw.description}</p>

          <div className="border border-rule bg-paper-soft">
            {fw.disclosures.map((d, i) => {
              const covered = d.metric_refs.length > 0 && i % 3 !== 2;
              return (
                <div
                  key={d.id}
                  className="grid grid-cols-[60px_1fr_auto_24px] gap-4 px-5 py-4 border-b border-rule last:border-0 hover:bg-paper-warm transition-colors items-start"
                >
                  <div className="text-xs font-mono text-ink-muted uppercase tracking-widest">
                    {d.id}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{d.title}</div>
                    {d.metric_refs.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {d.metric_refs.map((m) => (
                          <span
                            key={m}
                            className="text-[10px] font-mono text-ink-soft bg-paper border border-rule px-1.5 py-0.5"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    {covered ? (
                      <Badge variant="moss">Mapped</Badge>
                    ) : (
                      <Badge variant="outline">Gap</Badge>
                    )}
                  </div>
                  <div className="flex justify-end">
                    {covered ? (
                      <CheckCircle2 className="w-4 h-4 text-moss" />
                    ) : (
                      <Circle className="w-4 h-4 text-ink-faint" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
