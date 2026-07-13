// apps/web/components/superadmin/SuperadminClient.tsx
"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight, TrendingUp, Users, ShoppingBag } from "lucide-react";
import { RestaurantDetailDrawer } from "./RestaurantDetailDrawer";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  owner_email: string | null;
  owner_name: string | null;
  total_orders: number;
  total_revenue: number;
  total_customers: number;
  orders_today: number;
  revenue_today: number;
  last_order_at: string | null;
}

export function SuperadminClient({
  initialRestaurants,
}: {
  initialRestaurants: Restaurant[];
}) {
  const [restaurants, setRestaurants] = useState(initialRestaurants);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");

  const filtered = restaurants.filter((r) => {
    const matchSearch =
      !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.owner_email?.toLowerCase().includes(search.toLowerCase()) ||
      r.slug.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filterActive === "all" ||
      (filterActive === "active" && r.is_active) ||
      (filterActive === "inactive" && !r.is_active);
    return matchSearch && matchFilter;
  });

  function handleToggle(id: string, newStatus: boolean) {
    setRestaurants((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_active: newStatus } : r))
    );
    if (selected?.id === id) {
      setSelected((s) => s ? { ...s, is_active: newStatus } : s);
    }
  }

  // Summary stats
  const totalRevenue = restaurants.reduce((s, r) => s + Number(r.total_revenue), 0);
  const totalOrders  = restaurants.reduce((s, r) => s + Number(r.total_orders), 0);
  const activeCount  = restaurants.filter((r) => r.is_active).length;

  return (
    <div>
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total restaurants", value: restaurants.length, icon: ShoppingBag },
          { label: "Active",            value: activeCount,        icon: null, green: true },
          { label: "Total orders",      value: totalOrders,        icon: TrendingUp },
          {
            label: "Total revenue",
            value: `₹${totalRevenue >= 100000
              ? (totalRevenue / 100000).toFixed(1) + "L"
              : totalRevenue.toFixed(0)}`,
            icon: null,
          },
        ].map(({ label, value, green }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs text-slate-500 font-medium">{label}</p>
            <p
              className="text-2xl font-bold mt-1"
              style={{ color: green ? "#16a34a" : "#0f172a" }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by name, email, slug…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {(["all", "active", "inactive"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilterActive(f)}
            className="px-4 py-2 rounded-lg text-xs font-medium border transition-colors capitalize"
            style={
              filterActive === f
                ? { background: "#0d0000", color: "#fff", borderColor: "#0d0000" }
                : { background: "#fff", color: "#64748b", borderColor: "#e2e8f0" }
            }
          >
            {f}
          </button>
        ))}
      </div>

      {/* Restaurant table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="text-left px-5 py-3 font-medium text-slate-600">Restaurant</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 hidden sm:table-cell">Owner</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 hidden lg:table-cell">Orders</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 hidden lg:table-cell">Revenue</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 hidden xl:table-cell">Today</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-400">
                  No restaurants match your search.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => setSelected(r)}
                >
                  <td className="px-5 py-3">
                    <p className="font-semibold text-slate-900">{r.name}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{r.slug}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p className="text-slate-700 text-xs">{r.owner_name ?? "—"}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{r.owner_email ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-slate-700">
                    {Number(r.total_orders).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell font-medium text-slate-800">
                    ₹{Number(r.total_revenue).toFixed(0)}
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell text-slate-600 text-xs">
                    {Number(r.orders_today)} orders
                    <span className="text-slate-400 ml-1">
                      · ₹{Number(r.revenue_today).toFixed(0)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={
                        r.is_active
                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                          : "bg-red-100 text-red-600 hover:bg-red-100"
                      }
                    >
                      {r.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <ChevronRight size={16} className="text-slate-300" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail drawer */}
      {selected && (
        <RestaurantDetailDrawer
          restaurant={selected}
          onClose={() => setSelected(null)}
          onToggle={handleToggle}
        />
      )}
    </div>
  );
}
