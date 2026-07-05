"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}>({});

function Select({
  value,
  onValueChange,
  children,
  openOnHover,
}: {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  openOnHover?: boolean;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div
        className="relative"
        onMouseEnter={openOnHover ? () => setOpen(true) : undefined}
        onMouseLeave={openOnHover ? () => setOpen(false) : undefined}
      >
        {children}
      </div>
    </SelectContext.Provider>
  );
}

function SelectTrigger({
  className,
  children,
  onClick,
  ...props
}: React.ComponentProps<"button">) {
  const { open, setOpen } = React.useContext(SelectContext);

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    // toggle open state when clicking trigger
    setOpen?.(!open);
    onClick?.(e as any);
  }

  return (
    <button
      type="button"
      aria-expanded={open}
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = React.useContext(SelectContext);
  return <span className="text-slate-600">{value ? value : placeholder}</span>;
}

function SelectContent({ children }: { children: React.ReactNode }) {
  const { open } = React.useContext(SelectContext);
  if (!open) return null;

  return <div className="absolute z-20 mt-1 w-full rounded-md border border-slate-200 bg-white p-1 shadow-lg">{children}</div>;
}

function SelectItem({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { onValueChange, setOpen } = React.useContext(SelectContext);
  return (
    <button
      type="button"
      onClick={() => {
        onValueChange?.(value);
        // close dropdown on selection
        setOpen?.(false);
      }}
      className={cn(
        "flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-100",
        className
      )}
    >
      {children}
    </button>
  );
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
