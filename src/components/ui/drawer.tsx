"use client";
import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type DrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
  widthClass?: string;
};

export function Drawer({ open, onOpenChange, children, widthClass = "w-[560px]" }: DrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-40 bg-ink/30 data-[state=open]:animate-fade-in"
          style={{ animationDuration: "180ms" }}
        />
        <Dialog.Content
          className={cn(
            "fixed right-0 top-0 z-50 h-screen bg-paper-soft border-l border-rule shadow-lift",
            "flex flex-col focus:outline-none",
            "data-[state=open]:animate-drawer-in data-[state=closed]:animate-drawer-out",
            widthClass
          )}
          style={{ maxWidth: "96vw" }}
        >
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function DrawerHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex-shrink-0 border-b border-rule", className)}>
      {children}
    </div>
  );
}

export function DrawerBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex-1 overflow-y-auto min-h-0", className)}>
      {children}
    </div>
  );
}

export function DrawerFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex-shrink-0 border-t border-rule px-5 py-4 flex items-center justify-end gap-2 bg-paper-soft",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DrawerClose({ className }: { className?: string }) {
  return (
    <Dialog.Close
      className={cn(
        "w-8 h-8 flex items-center justify-center border border-rule bg-paper hover:bg-paper-warm transition-colors",
        className
      )}
      aria-label="Close"
    >
      <X className="w-3.5 h-3.5" strokeWidth={1.5} />
    </Dialog.Close>
  );
}

export const DrawerTitle = Dialog.Title;
export const DrawerDescription = Dialog.Description;
