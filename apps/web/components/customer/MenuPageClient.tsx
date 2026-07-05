"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { MenuItemCard } from "./MenuItemCard";
import { CartDrawer } from "./CartDrawer";
import { LoyaltyBanner } from "./LoyaltyBanner";

export function MenuPageClient({ restaurant, categories, items, session, tableLabel, visitCount, hasUnredeemedReward }: any) {
  const { setContext, clearCart, cart, tableId: storeTableId } = useCartStore();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [helpLoading, setHelpLoading] = useState(false);
  const [helpRequested, setHelpRequested] = useState(false);
  const searchParams = useSearchParams();
  const addToOrderId = searchParams.get("addToOrder");

  // Sync session to store on mount
  useEffect(() => {
    if (session?.restaurantId) {
      const cookieTableId = typeof document !== "undefined"
        ? document.cookie
            .split(";")
            .map((cookie) => cookie.trim())
            .find((cookie) => cookie.startsWith("qr_table="))
            ?.split("=")[1] ?? null
        : null;

      setContext(session.restaurantId, session.tableId ?? cookieTableId);
    }
  }, [session?.restaurantId, session?.tableId, setContext]);

  useEffect(() => {
    if (addToOrderId) {
      clearCart();
    }
  }, [addToOrderId, clearCart]);

  const primaryColor = restaurant.primary_color || "#16a34a";
  const totalItems = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
  const displayTableLabel = tableLabel ?? session?.tableId?.slice(0, 8)?.toUpperCase() ?? null;

  async function requestHelp() {
    if (helpRequested || helpLoading) return;
    if (!session?.tableId && !storeTableId) {
      alert("Table not detected. Please refresh the page and try again.");
      return;
    }

    setHelpLoading(true);
    try {
      const response = await fetch("/api/customer/orders/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not request help.");
      }

      setHelpRequested(true);
      alert(data.message || "Waiter has been alerted.");
    } catch (error: any) {
      alert(error?.message ?? "Failed to request help.");
    } finally {
      setHelpLoading(false);
    }
  }

  return (
    <div className="pb-24">
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: primaryColor }}
          >
            {restaurant.name.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{restaurant.name}</p>
            {displayTableLabel && (
              <p className="text-xs text-slate-500">Table {displayTableLabel}</p>
            )}
          </div>

          <button
            onClick={requestHelp}
            disabled={helpLoading}
            className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {helpLoading ? "Sending…" : helpRequested ? "Waiter called" : "Call waiter"}
          </button>
        </div>
      </header>

      <LoyaltyBanner 
        visitCount={visitCount % restaurant.loyalty_streak_target} 
        target={restaurant.loyalty_streak_target} 
        hasReward={hasUnredeemedReward} 
        primaryColor={primaryColor} 
      />

      <div className="sticky top-[57px] z-20 border-b bg-white/95 p-2 backdrop-blur">
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex min-w-max flex-nowrap gap-2">
          <button
            onClick={() => setActiveCategory("all")}
            className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === "all" ? "text-white" : "bg-slate-100 text-slate-600"
            }`}
            style={{ backgroundColor: activeCategory === "all" ? primaryColor : undefined }}
          >
            All
          </button>
          {categories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === cat.id ? "text-white" : "bg-slate-100 text-slate-600"
              }`}
              style={{ backgroundColor: activeCategory === cat.id ? primaryColor : undefined }}
            >
              {cat.name}
            </button>
          ))}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {items
          .filter((i: any) => activeCategory === "all" || i.category_id === activeCategory)
          .map((item: any) => (
            <MenuItemCard key={item.id} item={item} primaryColor={primaryColor} />
          ))}
      </div>

      {totalItems > 0 && (
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="fixed bottom-4 left-4 right-4 py-3 rounded-xl text-white font-bold text-center shadow-lg transition-all active:scale-95 z-40"
          style={{ backgroundColor: primaryColor }}
        >
          View Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
        </button>
      )}

      {/* Prop drilling tableId to ensure it is always available */}
      <CartDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        slug={restaurant.slug} 
        primaryColor={primaryColor}
        tableId={session?.tableId ?? storeTableId}
        existingOrderId={addToOrderId}
      />
    </div>
  );
}
