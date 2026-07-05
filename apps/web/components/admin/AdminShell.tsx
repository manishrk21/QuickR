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
      <header className="fixed left-0 top-0 right-0 z-40 border-b border-[#630102]/10 bg-[#EDEBDE]/95 backdrop-blur lg:pl-60">
        <div className="mx-auto  px-4 sm:px-6 lg:px-8">
          <div className="h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                className="rounded-md p-2 hover:bg-[#630102]/5 lg:hidden"
              >
                ≡
              </button>

            </div>
            <div className="text-center font-bold">QuickR</div>
            <div className="flex items-center gap-3">
              <button className="hidden rounded-md p-2 hover:bg-[#630102]/5 lg:inline-flex">
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
      <main className="min-h-screen bg-[#EDEBDE] pt-14 lg:ml-60">
        <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
