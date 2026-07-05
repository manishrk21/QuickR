"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { playHelpRequestSound, playNewOrderSound } from "@/lib/audio/notification";
import { OrderCard } from "@/components/admin/OrderCard";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";

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
  item_status: "pending" | "preparing" | "done";
  is_new_addition: boolean;
  created_at: string;
}

interface Order {
  id: string;
  status: OrderStatus;
  total_amount: number;
  special_instructions: string | null;
  payment_method: string | null;
  payment_status: string;
  created_at: string;
  updated_at: string;
  tables: { id: string; label: string } | null;
  customers: { id: string; name: string | null; mobile: string | null } | null;
  order_items: OrderItem[];
}

interface OrdersClientProps {
  initialOrders: Order[];
  tables: { id: string; label: string }[];
  restaurantId: string;
  slug: string;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All orders" },
  { value: "active", label: "Live queue" },
  { value: "history", label: "Order history" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "preparing", label: "Preparing" },
  { value: "ready", label: "Ready" },
  { value: "served", label: "Served" },
  { value: "paid", label: "Paid" },
  { value: "cancelled", label: "Cancelled" },
];

function normalizeOrder(order: any): Order {
  return {
    ...order,
    tables: Array.isArray(order.tables)
      ? (order.tables[0] ?? null)
      : order.tables ?? null,
    customers: Array.isArray(order.customers)
      ? (order.customers[0] ?? null)
      : order.customers ?? null,
  };
}

function hasHelpRequest(order: Order) {
  return order.special_instructions?.toLowerCase().includes("need help") ?? false;
}

function isHelpOnlyOrder(order: Order) {
  return hasHelpRequest(order) && Number(order.total_amount) === 0 && order.order_items.length === 0;
}

function FilterDropdown({
  label,
  value,
  options,
  onValueChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onValueChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative w-full sm:w-40"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
      >
        <span className="truncate">{selected?.label ?? label}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onValueChange(option.value);
                setOpen(false);
              }}
              className={`flex w-full items-center rounded-md px-3 py-2 text-left text-sm transition ${
                option.value === value
                  ? "bg-slate-100 font-medium text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function OrdersClient({
  initialOrders,
  tables,
  restaurantId,
}: OrdersClientProps) {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>(() => initialOrders.map(normalizeOrder));
  const [helpDismissLoadingId, setHelpDismissLoadingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("active");
  const [filterTable, setFilterTable] = useState("all");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundEnabledRef = useRef(true);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    const channel = supabase
      .channel(`admin-orders:${restaurantId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        async (payload) => {
          const { data: newOrder } = await supabase
            .from("orders")
            .select(`
              id, status, total_amount, special_instructions,
              payment_method, payment_status, created_at, updated_at,
              tables(id, label),
              customers(id, name, mobile),
              order_items(
                id, name_snapshot, price_snapshot, food_type_snapshot,
                quantity, special_instructions, item_status, is_new_addition, created_at
              )
            `)
            .eq("id", payload.new.id)
            .single();

          if (newOrder) {
            setOrders((prev) => [normalizeOrder(newOrder), ...prev]);
            if (soundEnabledRef.current) {
              if (hasHelpRequest(normalizeOrder(newOrder))) {
                playHelpRequestSound();
              } else {
                playNewOrderSound();
              }
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          const updated = payload.new as Order;
          setOrders((prev) => {
            const normalizedUpdated = normalizeOrder(updated);
            const previous = prev.find((order) => order.id === normalizedUpdated.id);
            const hadHelp = previous ? hasHelpRequest(previous) : false;
            const hasHelp = hasHelpRequest(normalizedUpdated);

            if (soundEnabledRef.current && hasHelp && !hadHelp) {
              playHelpRequestSound();
            }

            return prev.map((order) =>
              order.id === normalizedUpdated.id ? { ...order, ...normalizedUpdated } : order
            );
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          const deleted = payload.old as { id: string };
          setOrders((prev) => prev.filter((order) => order.id !== deleted.id));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "order_items",
        },
        (payload) => {
          const updatedItem = payload.new as OrderItem;
          setOrders((prev) =>
            prev.map((order) => ({
              ...order,
              order_items: order.order_items.map((item) =>
                item.id === updatedItem.id ? { ...item, ...updatedItem } : item
              ),
            }))
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "order_items",
        },
        (payload) => {
          const newItem = payload.new as OrderItem & { order_id: string };
          setOrders((prev) =>
            prev.map((order) =>
              order.id === newItem.order_id
                ? { ...order, order_items: [...order.order_items, newItem] }
                : order
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId, supabase]);

  function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  }

  function updateItemStatus(orderId: string, itemId: string, newStatus: "pending" | "preparing" | "done") {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              order_items: order.order_items.map((item) =>
                item.id === itemId ? { ...item, item_status: newStatus } : item
              ),
            }
          : order
      )
    );
  }

  const filtered = orders.filter((order) => {
    if (isHelpOnlyOrder(order)) {
      return false;
    }

    let statusMatch = false;

    if (filterStatus === "all") {
      statusMatch = true;
    } else if (filterStatus === "active") {
      statusMatch = !["paid", "cancelled"].includes(order.status);
    } else if (filterStatus === "history") {
      statusMatch = ["paid", "cancelled"].includes(order.status);
    } else {
      statusMatch = order.status === filterStatus;
    }

    const tableMatch = filterTable === "all" || order.tables?.id === filterTable;
    return statusMatch && tableMatch;
  });

  const pendingCount = orders.filter(
    (order) => order.status === "pending" && !isHelpOnlyOrder(order)
  ).length;
  const helpOrders = orders.filter(hasHelpRequest);

  async function dismissHelp(orderId: string) {
    setHelpDismissLoadingId(orderId);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/help`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to dismiss help request.");
      }

      if (data.dismissed) {
        setOrders((prev) => prev.filter((order) => order.id !== orderId));
      }
    } catch (error: any) {
      alert(error?.message ?? "Failed to dismiss help request.");
    } finally {
      setHelpDismissLoadingId((current) => (current === orderId ? null : current));
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <FilterDropdown
          label="Filter by status"
          value={filterStatus}
          options={STATUS_OPTIONS}
          onValueChange={setFilterStatus}
        />

        <FilterDropdown
          label="Filter by table"
          value={filterTable}
          options={[{ value: "all", label: "All tables" }, ...tables.map((table) => ({ value: table.id, label: table.label }))]}
          onValueChange={setFilterTable}
        />

        <div className="ml-auto flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="text-xs text-slate-500">Live</span>
        </div>

        <button
          onClick={() => setSoundEnabled((value) => !value)}
          className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
            soundEnabled
              ? "border-slate-200 text-slate-600 hover:bg-slate-50"
              : "border-slate-200 text-slate-400 line-through"
          }`}
          title={soundEnabled ? "Mute order sounds" : "Unmute order sounds"}
        >
          🔔 Sound {soundEnabled ? "on" : "off"}
        </button>
      </div>

      {pendingCount > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-medium text-amber-800">
            {pendingCount} order{pendingCount > 1 ? "s" : ""} waiting for acceptance
          </p>
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            {pendingCount} pending
          </Badge>
        </div>
      )}

      {helpOrders.length > 0 && (
        <div className="mb-4 space-y-2">
          {helpOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-rose-800">
                  Help needed at {order.tables?.label ?? "Unknown table"}
                </p>
                <p className="text-xs text-rose-600">Waiter requested</p>
              </div>
              <button
                type="button"
                onClick={() => dismissHelp(order.id)}
                disabled={helpDismissLoadingId === order.id}
                className="rounded-full bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {helpDismissLoadingId === order.id ? "Closing…" : "OK"}
              </button>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
          <p className="text-sm text-slate-400">
            {orders.length === 0
              ? "No orders yet."
              : "No orders match the current filter."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={updateOrderStatus}
              onItemStatusChange={updateItemStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
