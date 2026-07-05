"use client";

import { useState } from "react";
import { FoodTypeIndicator } from "@/components/FoodTypeIndicator";
import { Button } from "@/components/ui/button";

interface TopItem { menu_item_id: string; name: string; food_type: string; total_quantity: number; total_revenue: number; order_count: number; }
interface TopItemsTableProps { items: TopItem[]; }

export function TopItemsTable({ items }: TopItemsTableProps) {
  const [sortBy, setSortBy] = useState<"quantity" | "revenue">("quantity");
  const sorted = [...items].sort((a, b) => sortBy === "quantity" ? b.total_quantity - a.total_quantity : b.total_revenue - a.total_revenue);
  const maxValue = sortBy === "quantity" ? Math.max(...sorted.map((i) => i.total_quantity), 1) : Math.max(...sorted.map((i) => i.total_revenue), 1);

  return (
    <div className="rounded-2xl border border-[#630102]/10 bg-[#EDEBDE] p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold text-[#1a0000]">Top items</h2>
        <div className="flex flex-wrap gap-1">
          <Button size="sm" variant={sortBy === "quantity" ? "default" : "outline"} className="text-xs h-7" onClick={() => setSortBy("quantity")}>Qty</Button>
          <Button size="sm" variant={sortBy === "revenue" ? "default" : "outline"} className="text-xs h-7" onClick={() => setSortBy("revenue")}>Revenue</Button>
        </div>
      </div>
      {sorted.length === 0 ? <p className="py-8 text-center text-sm text-[#630102]/45">No paid orders in this period.</p> : (
        <div className="space-y-3">
          {sorted.map((item, idx) => {
            const value = sortBy === "quantity" ? item.total_quantity : item.total_revenue;
            const barWidth = (value / maxValue) * 100;
            return (
              <div key={item.menu_item_id}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-4 shrink-0 text-right text-xs text-[#630102]/45">{idx + 1}</span>
                  <FoodTypeIndicator type={item.food_type as "veg" | "non_veg" | "egg"} size="sm" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#1a0000]">{item.name}</span>
                  <span className="shrink-0 text-sm font-semibold text-[#630102]">{sortBy === "quantity" ? `×${item.total_quantity}` : `₹${Number(item.total_revenue).toFixed(0)}`}</span>
                </div>
                <div className="ml-6 h-1.5 overflow-hidden rounded-full bg-[#630102]/10"><div className="h-full rounded-full bg-[#630102] transition-all duration-500" style={{ width: `${barWidth}%` }} /></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
