"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FoodTypeIndicator } from "@/components/FoodTypeIndicator";
import { ChevronDown, Clock, User, Utensils } from "lucide-react";

type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "served"
  | "paid"
  | "cancelled";

type ItemStatus = "pending" | "preparing" | "done";

interface OrderItem {
  id: string;
  name_snapshot: string;
  price_snapshot: number;
  food_type_snapshot: string;
  quantity: number;
  special_instructions: string | null;
  item_status: ItemStatus;
  is_new_addition: boolean;
}

interface Order {
  id: string;
  status: OrderStatus;
  total_amount: number;
  special_instructions: string | null;
  payment_method: string | null;
  payment_status: string;
  created_at: string;
  tables: { id: string; label: string } | null;
  customers: { id: string; name: string | null; mobile: string | null } | null;
  order_items: OrderItem[];
}

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  onItemStatusChange: (orderId: string, itemId: string, status: ItemStatus) => void;
}

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  accepted: "bg-blue-100 text-blue-800",
  preparing: "bg-violet-100 text-violet-800",
  ready: "bg-green-100 text-green-700",
  served: "bg-slate-100 text-slate-700",
  paid: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

const ITEM_STATUS_BADGE: Record<ItemStatus, string> = {
  pending: "bg-[#630102]/[0.05] text-[#630102]/55",
  preparing: "bg-amber-100 text-amber-700",
  done: "bg-green-100 text-green-700",
};

const NEXT_ACTIONS: Record<
  OrderStatus,
  { label: string; next: OrderStatus; variant: "default" | "outline" | "destructive" }[]
> = {
  pending: [
    { label: "Accept", next: "accepted", variant: "default" },
    { label: "Reject", next: "cancelled", variant: "destructive" },
  ],
  accepted: [
    { label: "Start preparing", next: "preparing", variant: "default" },
    { label: "Cancel", next: "cancelled", variant: "destructive" },
  ],
  preparing: [{ label: "Mark ready", next: "ready", variant: "default" }],
  ready: [{ label: "Mark served", next: "served", variant: "default" }],
  served: [{ label: "Mark paid", next: "paid", variant: "default" }],
  paid: [],
  cancelled: [],
};

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export function OrderCard({ order, onStatusChange, onItemStatusChange }: OrderCardProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>(order.payment_method ?? "");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [error, setError] = useState("");
  const paymentRef = useRef<HTMLDivElement>(null);

  async function handleStatusChange(nextStatus: OrderStatus) {
    setLoading(nextStatus);
    setError("");

    if (nextStatus === "paid" && !paymentMethod) {
      setError("Select a payment method before marking paid.");
      setLoading(null);
      return;
    }

    const res = await fetch(`/api/admin/orders/${order.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to update status.");
      setLoading(null);
      return;
    }

    if (nextStatus === "paid" && paymentMethod) {
      await fetch(`/api/admin/orders/${order.id}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_method: paymentMethod }),
      });
    }

    onStatusChange(order.id, nextStatus);
    setLoading(null);
  }

  async function handleItemStatus(itemId: string, newStatus: ItemStatus) {
    const res = await fetch(`/api/admin/orders/${order.id}/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_status: newStatus }),
    });

    if (res.ok) {
      onItemStatusChange(order.id, itemId, newStatus);
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (paymentRef.current && !paymentRef.current.contains(event.target as Node)) {
        setPaymentOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const actions = NEXT_ACTIONS[order.status] ?? [];
  const hasNewAdditions = order.order_items.some((item) => item.is_new_addition);
  const needsHelp = order.special_instructions?.toLowerCase().includes("need help");
  const selectedPaymentLabel =
    [
      { value: "cash", label: "Cash" },
      { value: "upi", label: "UPI" },
      { value: "card", label: "Card" },
      { value: "other", label: "Other" },
    ].find((option) => option.value === paymentMethod)?.label ?? "Select…";
  const cardBorder =
    order.status === "pending"
      ? "border-amber-300 ring-1 ring-amber-200"
      : "border-[#630102]/10";

  return (
    <div className={`overflow-visible rounded-xl border bg-[#EDEBDE] shadow-sm ${cardBorder}`}>
      <div className="flex items-start justify-between gap-2 border-b border-[#630102]/10 bg-[#630102]/[0.03] px-4 py-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-[#1a0000]">
              {order.tables?.label ?? "Takeaway"}
            </span>
            <Badge className={`${STATUS_BADGE[order.status]} text-xs`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
            {needsHelp && (
              <Badge className="bg-rose-100 text-xs text-rose-700">
                Need help
              </Badge>
            )}
            {hasNewAdditions && (
              <Badge className="bg-amber-100 text-xs text-amber-700">+ New items</Badge>
            )}
          </div>

          <div className="mt-1 flex items-center gap-3">
            {(order.customers?.name || order.customers?.mobile) && (
              <span className="flex items-center gap-1 text-xs text-[#630102]/55">
                <User size={11} />
                {order.customers?.name ?? order.customers?.mobile ?? "Customer"}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-[#630102]/40">
              <Clock size={11} />
              {timeAgo(order.created_at)}
            </span>
          </div>
        </div>

        <span className="shrink-0 text-base font-bold text-[#1a0000]">
          ₹{Number(order.total_amount).toFixed(0)}
        </span>
      </div>

      <div className="divide-y divide-[#630102]/8 px-4 py-2">
        {order.order_items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 py-2.5 ${item.is_new_addition ? "-mx-4 bg-amber-50/60 px-4" : ""}`}
          >
            <FoodTypeIndicator type={item.food_type_snapshot as "veg" | "non_veg" | "egg"} size="sm" />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#1a0000]">
                {item.name_snapshot}
                {item.is_new_addition && (
                  <span className="ml-1.5 text-xs font-normal text-amber-600">↑ added later</span>
                )}
              </p>
              {item.special_instructions && (
                <p className="truncate text-xs text-[#630102]/40">{item.special_instructions}</p>
              )}
            </div>

            <span className="shrink-0 text-xs text-[#630102]/55">×{item.quantity}</span>

            {(["accepted", "preparing"].includes(order.status)) && (
              <button
                onClick={() => {
                  const next: ItemStatus =
                    item.item_status === "pending"
                      ? "preparing"
                      : item.item_status === "preparing"
                        ? "done"
                        : "done";
                  handleItemStatus(item.id, next);
                }}
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${ITEM_STATUS_BADGE[item.item_status]}`}
                title="Click to advance item status"
              >
                {item.item_status === "pending"
                  ? "Queued"
                  : item.item_status === "preparing"
                    ? "Preparing →"
                    : "✓ Done"}
              </button>
            )}
          </div>
        ))}
      </div>

      {order.special_instructions && (
        <>
          <Separator />
          <div className="px-4 py-2">
            <p className="text-xs text-[#630102]/45">
              <span className="font-medium">Note: </span>
              {order.special_instructions}
            </p>
          </div>
        </>
      )}

      {order.status === "served" && (
        <>
          <Separator />
          <div className="flex items-center gap-3 bg-[#630102]/[0.03] px-4 py-3">
            <Utensils size={14} className="shrink-0 text-[#630102]/40" />
            <span className="text-xs text-[#630102]/60">Payment method</span>
            <div
              ref={paymentRef}
              className="relative ml-auto"
              onMouseEnter={() => setPaymentOpen(true)}
              onMouseLeave={() => setPaymentOpen(false)}
            >
              <button
                type="button"
                onClick={() => setPaymentOpen((prev) => !prev)}
                className="flex h-8 w-36 items-center justify-between rounded-md border border-[#630102]/10 bg-[#EDEBDE] px-2.5 text-xs text-[#1a0000]/80 shadow-sm transition hover:border-[#630102]/20 hover:bg-[#630102]/[0.03]"
              >
                <span className="truncate">{selectedPaymentLabel}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${paymentOpen ? "rotate-180" : ""}`} />
              </button>

              {paymentOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-36 rounded-lg border border-[#630102]/10 bg-[#EDEBDE] p-1 shadow-lg">
                  {[
                    { value: "cash", label: "Cash" },
                    { value: "upi", label: "UPI" },
                    { value: "card", label: "Card" },
                    { value: "other", label: "Other" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setPaymentMethod(option.value);
                        setPaymentOpen(false);
                      }}
                      className={`flex w-full items-center rounded-md px-3 py-2 text-left text-sm transition ${
                        paymentMethod === option.value
                          ? "bg-[#630102]/[0.06] font-medium text-[#1a0000]"
                          : "text-[#630102]/60 hover:bg-[#630102]/[0.03] hover:text-[#1a0000]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {error && (
        <div className="px-4 py-2">
          <p className="rounded-md bg-red-50 px-3 py-1.5 text-xs text-red-600">{error}</p>
        </div>
      )}

      {actions.length > 0 && (
        <>
          <Separator />
          <div className="flex flex-wrap gap-2 px-4 py-3">
            {actions.map((action) => (
              <Button
                key={action.next}
                size="sm"
                variant={action.variant}
                disabled={loading !== null}
                onClick={() => handleStatusChange(action.next)}
                className={`${action.variant === "default" ? "flex-1" : ""}`}
              >
                {loading === action.next ? "Updating…" : action.label}
              </Button>
            ))}
          </div>
        </>
      )}

      {order.status === "paid" && (
        <div className="bg-emerald-50 px-4 py-3 text-center">
          <p className="text-xs font-medium text-emerald-700">
            ✓ Paid via {order.payment_method ? order.payment_method.toUpperCase() : "—"}
          </p>
        </div>
      )}
    </div>
  );
}
