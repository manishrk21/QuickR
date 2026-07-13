// apps/web/components/superadmin/RestaurantDetailDrawer.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Users,
  ShoppingBag,
  Calendar,
} from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  owner_email: string | null;
  owner_name: string | null;
  total_orders: number;
  total_revenue: number;
  total_customers: number;
  orders_today: number;
  revenue_today: number;
  created_at: string;
}

interface DetailData {
  restaurant: {
    avg_order_value: number;
    month_orders: number;
    month_revenue: number;
    primary_color: string;
  } | null;
  recentOrders: {
    id: string;
    status: string;
    total_amount: number;
    created_at: string;
    tables: { label: string } | null;
    customers: { mobile: string | null; name: string | null } | null;
  }[];
}

const STATUS_BADGE: Record<string, string> = {
  pending:   "bg-amber-100 text-amber-700",
  accepted:  "bg-blue-100 text-blue-700",
  preparing: "bg-violet-100 text-violet-700",
  ready:     "bg-green-100 text-green-700",
  served:    "bg-slate-100 text-slate-600",
  paid:      "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-600",
};

export function RestaurantDetailDrawer({
  restaurant,
  onClose,
  onToggle,
}: {
  restaurant: Restaurant;
  onClose: () => void;
  onToggle: (id: string, status: boolean) => void;
}) {
  const [detail, setDetail] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [isActive, setIsActive] = useState(restaurant.is_active);

  useEffect(() => {
    setIsActive(restaurant.is_active);
    setLoading(true);
    fetch(`/api/superadmin/restaurants/${restaurant.id}`)
      .then((r) => r.json())
      .then((d) => {
        setDetail(d);
        setLoading(false);
      });
  }, [restaurant.id]);

  async function handleToggle() {
    setToggling(true);
    const newStatus = !isActive;

    const res = await fetch(
      `/api/superadmin/restaurants/${restaurant.id}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: newStatus }),
      }
    );

    if (res.ok) {
      setIsActive(newStatus);
      onToggle(restaurant.id, newStatus);
    }
    setToggling(false);
  }

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg px-0">
        <SheetHeader className="px-6 pb-4 border-b">
          <div className="flex items-start justify-between gap-3">
            <div>
              <SheetTitle className="text-base font-bold text-slate-900">
                {restaurant.name}
              </SheetTitle>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                {restaurant.slug}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={`/r/${restaurant.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
                title="View menu page"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </SheetHeader>

        
        <div className="h-[calc(100vh-8rem)] overflow-y-auto">  
          <div className="px-6 py-5 space-y-6">

            {/* Active toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Subscription status
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isActive
                    ? "Restaurant is live — customers can order"
                    : "Deactivated — menu and QR codes are inaccessible"}
                </p>
              </div>
              <button
                onClick={handleToggle}
                disabled={toggling}
                className="transition-opacity hover:opacity-80 disabled:opacity-40"
                title={isActive ? "Deactivate" : "Activate"}
              >
                {isActive ? (
                  <ToggleRight size={40} className="text-green-600" />
                ) : (
                  <ToggleLeft size={40} className="text-slate-400" />
                )}
              </button>
            </div>

            {/* Owner info */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Owner
              </p>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-800">
                  {restaurant.owner_name ?? "—"}
                </p>
                <p className="text-xs text-slate-500">
                  {restaurant.owner_email ?? "—"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Registered{" "}
                  {new Date(restaurant.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <Separator />

            {/* Stats grid */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Stats
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Total orders",
                    value: Number(restaurant.total_orders).toLocaleString(),
                    icon: ShoppingBag,
                  },
                  {
                    label: "Total revenue",
                    value: `₹${Number(restaurant.total_revenue).toFixed(0)}`,
                    icon: TrendingUp,
                  },
                  {
                    label: "Customers",
                    value: Number(restaurant.total_customers).toLocaleString(),
                    icon: Users,
                  },
                  {
                    label: "Today",
                    value: `${restaurant.orders_today} orders`,
                    icon: Calendar,
                    sub: `₹${Number(restaurant.revenue_today).toFixed(0)}`,
                  },
                ].map(({ label, value, icon: Icon, sub }) => (
                  <div key={label} className="border rounded-xl p-3 bg-white">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon size={12} className="text-slate-400" />
                      <p className="text-xs text-slate-500">{label}</p>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{value}</p>
                    {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
                  </div>
                ))}
              </div>

              {/* Monthly + avg — loaded async */}
              {loading ? (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Skeleton className="h-16 rounded-xl" />
                  <Skeleton className="h-16 rounded-xl" />
                </div>
              ) : detail?.restaurant ? (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="border rounded-xl p-3 bg-white">
                    <p className="text-xs text-slate-500">This month</p>
                    <p className="text-lg font-bold text-slate-900">
                      {detail.restaurant.month_orders} orders
                    </p>
                    <p className="text-xs text-slate-400">
                      ₹{Number(detail.restaurant.month_revenue).toFixed(0)}
                    </p>
                  </div>
                  <div className="border rounded-xl p-3 bg-white">
                    <p className="text-xs text-slate-500">Avg order value</p>
                    <p className="text-lg font-bold text-slate-900">
                      ₹{Number(detail.restaurant.avg_order_value).toFixed(0)}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            <Separator />

            {/* Recent orders */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Recent orders
              </p>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-xl" />
                  ))}
                </div>
              ) : detail?.recentOrders.length === 0 ? (
                <p className="text-sm text-slate-400">No orders yet.</p>
              ) : (
                <div className="space-y-2">
                  {detail?.recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between border rounded-xl px-3 py-2.5 bg-white"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-400">
                            #{order.id.slice(0, 6).toUpperCase()}
                          </span>
                          {order.tables?.label && (
                            <span className="text-xs text-slate-500">
                              {order.tables.label}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(order.created_at).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-800">
                          ₹{Number(order.total_amount).toFixed(0)}
                        </p>
                        <Badge
                          className={`text-xs mt-0.5 ${STATUS_BADGE[order.status] ?? ""}`}
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div> 
      </SheetContent>
    </Sheet>
  );
}
