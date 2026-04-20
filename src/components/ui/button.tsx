"use client";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none",
  {
    variants: {
      variant: {
        default:
          "bg-ink text-paper hover:bg-ink-soft active:scale-[0.99]",
        outline:
          "border border-rule bg-transparent hover:bg-paper-warm hover:border-ink-muted",
        ghost:
          "bg-transparent hover:bg-paper-warm text-ink-soft hover:text-ink",
        accent:
          "bg-ember text-paper hover:bg-ember/90",
        moss:
          "bg-moss text-paper hover:bg-moss/90",
        link:
          "underline-offset-4 hover:underline text-ink-soft",
      },
      size: {
        default: "h-9 px-4",
        sm: "h-7 px-3 text-xs",
        lg: "h-11 px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";
