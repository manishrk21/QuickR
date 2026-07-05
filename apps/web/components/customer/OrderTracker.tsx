
// apps/web/components/customer/OrderTracker.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FoodTypeIndicator } from "@/components/FoodTypeIndicator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "served"
  | "paid"
  | "cancelled";

interface OrderItem {
  id: string;
  name_snapshot: string;
  price_snapshot: number;
  food_type_snapshot: string;
  quantity: number;
  special_instructions: string | null;
  item_status: string;
  is_new_addition: boolean;
}

interface OrderTrackerProps {
  order: {
    id: string;
    status: OrderStatus;
    total_amount: number;
    special_instructions: string | null;
    created_at: string;
    tables: { label: string } | null;
    order_items: OrderItem[];
  };
  orderId: string;
  slug: string;
  primaryColor: string;
  restaurantId: string;
}

const STATUS_STEPS: { key: OrderStatus; label: string; emoji: string }[] = [
  { key: "pending",   label: "Order received",  emoji: "📋" },
  { key: "accepted",  label: "Confirmed",        emoji: "✅" },
  { key: "preparing", label: "Being prepared",   emoji: "👨‍🍳" },
  { key: "ready",     label: "Ready to serve",   emoji: "🔔" },
  { key: "served",    label: "Served",           emoji: "🍽️" },
  { key: "paid",      label: "Paid",             emoji: "💳" },
];

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:   "bg-slate-100 text-slate-600",
  accepted:  "bg-blue-100 text-blue-700",
  preparing: "bg-amber-100 text-amber-700",
  ready:     "bg-green-100 text-green-700",
  served:    "bg-violet-100 text-violet-700",
  paid:      "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

export function OrderTracker({
  order: initialOrder,
  orderId,
  slug,
  primaryColor,
  restaurantId,
}: OrderTrackerProps) {
  const supabase = createClient();
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(initialOrder.status);
  const [items, setItems] = useState<OrderItem[]>(initialOrder.order_items);

  // Realtime — subscribe to this order's status changes
  useEffect(() => {
    const channel = supabase
      .channel(`order:${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          const updated = payload.new as { status: OrderStatus };
          setStatus(updated.status);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "order_items",
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const updated = payload.new as OrderItem;
          setItems((prev) =>
            prev.map((i) => (i.id === updated.id ? { ...i, ...updated } : i))
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "order_items",
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          setItems((prev) => [...prev, payload.new as OrderItem]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === status);
  const isCancelled = status === "cancelled";
  const isPaid = status === "paid";

  return (
    <div className="pt-6 space-y-6">
      {/* Order header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400 font-mono">
            #{orderId.slice(0, 8).toUpperCase()}
          </p>
          <p className="text-sm text-slate-600 mt-0.5">
            {initialOrder.tables?.label ?? "Takeaway"}
          </p>
        </div>
        <Badge className={STATUS_COLORS[status]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </div>

      {/* Status progress steps */}
      {!isCancelled && (
        <div className="relative">
          {STATUS_STEPS.filter((s) => s.key !== "paid" || isPaid).map(
            (step, idx) => {
              const done = idx < currentStepIndex;
              const active = idx === currentStepIndex;
              return (
                <div key={step.key} className="flex items-start gap-3 pb-5 last:pb-0">
                  {/* Connector line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center
                                 text-sm shrink-0 transition-all duration-500 ${
                                   done
                                     ? "bg-green-500 text-white"
                                     : active
                                     ? "text-white ring-2 ring-offset-2"
                                     : "bg-slate-100 text-slate-400"
                                 }`}
                      style={
                        active
                          ? { background: primaryColor, boxShadow: `0 0 0 2px ${primaryColor}` }
                          : undefined
                      }
                    >
                      {done ? "✓" : step.emoji}
                    </div>
                    {idx < STATUS_STEPS.length - 1 && (
                      <div
                        className={`w-0.5 h-5 mt-1 transition-colors duration-500 ${
                          done ? "bg-green-300" : "bg-slate-100"
                        }`}
                      />
                    )}
                  </div>
                  <div className="pt-1.5">
                    <p
                      className={`text-sm font-medium ${
                        done
                          ? "text-green-600"
                          : active
                          ? "text-slate-900"
                          : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </p>
                    {active && (
                      <p className="text-xs text-slate-400 mt-0.5 animate-pulse">
                        {step.key === "pending" && "Waiting for restaurant to confirm…"}
                        {step.key === "accepted" && "Your order is confirmed!"}
                        {step.key === "preparing" && "The kitchen is working on it…"}
                        {step.key === "ready" && "Your food is on the way!"}
                        {step.key === "served" && "Enjoy your meal!"}
                      </p>
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}

      {isCancelled && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700 font-medium text-sm">Order cancelled</p>
          <p className="text-red-500 text-xs mt-1">
            Please speak with our staff if you have any questions.
          </p>
        </div>
      )}

      {/* Order items */}
      <div className="border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b bg-slate-50">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Items
          </p>
        </div>
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-start gap-3 px-4 py-3 border-b last:border-0 ${
              item.is_new_addition ? "bg-amber-50/50" : ""
            }`}
          >
            <FoodTypeIndicator
              type={item.food_type_snapshot as "veg" | "non_veg" | "egg"}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between">
                <p className="text-sm font-medium text-slate-800">
                  {item.name_snapshot}
                  {item.is_new_addition && (
                    <span className="ml-1.5 text-xs text-amber-600 font-normal">
                      (added later)
                    </span>
                  )}
                </p>
                <span className="text-sm text-slate-600 ml-2 shrink-0">
                  ×{item.quantity}
                </span>
              </div>
              {item.special_instructions && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {item.special_instructions}
                </p>
              )}
              {/* Per-item cooking status */}
              <span
                className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                  item.item_status === "done"
                    ? "bg-green-100 text-green-700"
                    : item.item_status === "preparing"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {item.item_status === "done"
                  ? "Ready"
                  : item.item_status === "preparing"
                  ? "Preparing"
                  : "Queued"}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-700 shrink-0">
              ₹{(item.price_snapshot * item.quantity).toFixed(0)}
            </p>
          </div>
        ))}
        <div className="flex justify-between px-4 py-3 bg-slate-50">
          <span className="text-sm font-semibold text-slate-700">Total</span>
          <span className="text-sm font-bold text-slate-900">
            ₹{Number(initialOrder.total_amount).toFixed(0)}
          </span>
        </div>
      </div>

      {/* Special instructions */}
      {initialOrder.special_instructions && (
        <div className="text-xs text-slate-500 bg-slate-50 px-4 py-3 rounded-xl">
          <span className="font-medium">Note:</span> {initialOrder.special_instructions}
        </div>
      )}

      {/* Add more items — only if pending or accepted */}
      {["pending", "accepted"].includes(status) && (
        <div className="border border-dashed border-slate-200 rounded-xl p-4 text-center">
          <p className="text-sm text-slate-500 mb-3">
            Want to add more items to this order?
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/r/${slug}?addToOrder=${orderId}`)}
          >
            Browse menu
          </Button>
        </div>
      )}

      {/* Back to menu */}
      <div className="pb-8">
        <Button
          variant="ghost"
          className="w-full text-slate-500"
          onClick={() => router.push(`/r/${slug}`)}
        >
          ← Back to menu
        </Button>
      </div>
    </div>
  );
}
