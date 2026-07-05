"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const SheetContext = React.createContext<{ open: boolean; setOpen: (open: boolean) => void } | null>(null);

function Sheet({ children, open, onOpenChange }: React.ComponentProps<"div"> & { open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [internalOpen, setInternalOpen] = React.useState(open ?? false);
  const isOpen = open ?? internalOpen;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (open === undefined) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [open, onOpenChange]
  );

  return <SheetContext.Provider value={{ open: isOpen, setOpen }}>{children}</SheetContext.Provider>;
}

function SheetContent({ className, children, side = "right", ...props }: React.ComponentProps<"div"> & { side?: "left" | "right" }) {
  const context = React.useContext(SheetContext);
  if (!context) return null;

  const { open, setOpen } = context;
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
      <div
        className={cn(
          "absolute top-0 h-full w-full max-w-md bg-white shadow-xl transition-transform duration-200",
          side === "right" ? "right-0" : "left-0",
          className
        )}
        {...props}
      >
        <button type="button" className="absolute right-4 top-4 rounded-md p-1 text-slate-500 hover:bg-slate-100" onClick={() => setOpen(false)}>
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("px-6 py-4", className)} {...props} />;
}

function SheetTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 className={cn("text-lg font-semibold text-slate-900", className)} {...props} />;
}

export { Sheet, SheetContent, SheetHeader, SheetTitle };
