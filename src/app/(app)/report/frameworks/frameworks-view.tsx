"use client";
import { useState, useMemo } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, BookOpen } from "lucide-react";

type Framework = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  jurisdiction: string;
  framework_type: string;
  disclosures: {
    id: string;
    title: string;
    description: string | null;
    section: string | null;
    subsection: string | null;
    is_mandatory: boolean;
    metric_refs: string[];
  }[];
};

type Mapping = {
  id: string;
  framework: string;
  metric_code: string;
  metric_name: string;
  platform_table: string;
  platform_field: string | null;
  transformation: string | null;
  auto_mapped: boolean;
  confidence: number | null;
};

export function FrameworksView({
  frameworks,
  mappings,
}: {
  frameworks: Framework[];
  mappings: Mapping[];
}) {
  const [active, setActive] = useState<string>(frameworks[0]?.code ?? "");
  const fw = frameworks.find((f) => f.code === active) ?? frameworks[0];

  const mappedMetrics = useMemo(() => {
    const s = new Set<string>();
    mappings.filter((m) => m.framework === active).forEach((m) => s.add(m.metric_code));
    return s;
  }, [mappings, active]);

  if (!fw) {
    return (
      <div className="px-8 py-10 space-y-8">
        <SectionHeader
          eyebrow="Report · Framework library"
          title="Every disclosure, mapped."
        />
        <div className="border border-rule bg-paper-soft p-8 text-center text-ink-muted">
          No regulatory frameworks loaded.
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-10 space-y-8">
      <SectionHeader
        eyebrow="Report · Framework library"
        title="Every disclosure, mapped."
        description="Disclosure requirements across global frameworks with live mappings to Atmosphereum metrics."
      />

      <div className="grid grid-cols-[220px_1fr] gap-8">
        <aside>
          <div className="text-[10px] uppercase tracking-widest text-ink-muted font-mono mb-3">
            Frameworks
          </div>
          <ul className="border border-rule bg-paper-soft">
            {frameworks.map((f) => (
              <li key={f.code} className="border-b border-rule last:border-0">
                <button
                  onClick={() => setActive(f.code)}
                  className={cn(
                    "w-full text-left px-4 py-4 hover:bg-paper-warm transition-colors",
                    active === f.code && "bg-paper-warm"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="w-3 h-3 text-ember" />
                    <span className="font-display text-base">{f.code}</span>
                  </div>
                  <div className="text-xs text-ink-muted leading-snug">
                    {f.disclosures.length} disclosures · {f.jurisdiction}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div>
          <h2 className="font-display text-2xl tracking-tight mb-1">{fw.name}</h2>
          <p className="text-sm text-ink-soft mb-6">{fw.description ?? ""}</p>

          <div className="border border-rule bg-paper-soft">
            {fw.disclosures.length === 0 && (
              <div className="p-6 text-sm text-ink-muted italic text-center">
                No metrics loaded for this framework yet.
              </div>
            )}
            {fw.disclosures.map((d) => {
              const covered = d.metric_refs.some((m) => m && mappedMetrics.has(m));
              return (
                <div
                  key={d.id}
                  className="grid grid-cols-[80px_1fr_auto_24px] gap-4 px-5 py-4 border-b border-rule last:border-0 hover:bg-paper-warm transition-colors items-start"
                >
                  <div className="text-xs font-mono text-ink-muted uppercase tracking-widest">{d.id}</div>
                  <div>
                    <div className="font-medium text-sm">{d.title}</div>
                    {d.section && (
                      <div className="mt-1 text-[10px] text-ink-muted uppercase tracking-widest">
                        {d.section}
                        {d.subsection && ` · ${d.subsection}`}
                      </div>
                    )}
                    {d.metric_refs.length > 0 && d.metric_refs[0] && (
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
                    ) : d.is_mandatory ? (
                      <Badge variant="ember">Required</Badge>
                    ) : (
                      <Badge variant="outline">Optional</Badge>
                    )}
                  </div>
                  <div className="flex justify-end">
                    {covered ? <CheckCircle2 className="w-4 h-4 text-moss" /> : <Circle className="w-4 h-4 text-ink-faint" />}
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
