import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider border",
  {
    variants: {
      variant: {
        default: "border-rule bg-paper-warm text-ink-soft",
        ember: "border-ember/30 bg-ember-faint text-ember",
        moss: "border-moss/30 bg-moss-faint text-moss",
        slate: "border-slate/30 bg-slate-faint text-slate",
        ochre: "border-ochre/30 bg-ochre-faint text-ochre",
        outline: "border-ink-muted text-ink-soft bg-transparent",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
