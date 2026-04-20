import { cn } from "@/lib/utils";

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-8 pb-6 border-b border-rule", className)}>
      <div>
        {eyebrow && (
          <div className="text-micro uppercase tracking-[0.2em] text-ember mb-3">
            {eyebrow}
          </div>
        )}
        <h1 className="font-display text-4xl md:text-5xl tracking-tight leading-[1.05] max-w-2xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 text-ink-soft max-w-xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
