"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { LogOut } from "lucide-react";

export default function AdminShell({ children, slug, restaurantName }: {
  children: React.ReactNode;
  slug: string;
  restaurantName: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Top nav */}
      <header className="fixed left-0 top-0 right-0 z-40 bg-white border-b border-slate-200 lg:pl-60">
        <div className="mx-auto  px-4 sm:px-6 lg:px-8">
          <div className="h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                className="lg:hidden p-2 rounded-md hover:bg-slate-100"
              >
                ≡
              </button>

            </div>
            <div className="text-center font-bold">QuickR</div>
            <div className="flex items-center gap-3">
              <button className="hidden lg:inline-flex p-2 rounded-md hover:bg-slate-100">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar + overlay */}
      <Sidebar slug={slug} restaurantName={restaurantName} isOpen={open} onClose={() => setOpen(false)} />
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main content area; on lg keep left margin for sidebar */}
      <main className="pt-14 bg-slate-50 min-h-screen lg:ml-60">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
