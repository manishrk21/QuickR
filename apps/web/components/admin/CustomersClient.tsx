"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomerDetailDrawer } from "@/components/admin/CustomerDetailDrawer";
import { Search, Gift, Flame } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

interface Customer {
  id: string;
  name: string | null;
  mobile: string | null;
  google_id?: string | null;
  is_guest: boolean;
  created_at: string;
  total_orders: number;
  total_spent: number;
  last_visit: string | null;
  visit_count: number;
  streak_progress: number;
  has_reward: boolean;
}

interface CustomersClientProps {
  initialCustomers: Customer[];
  streakTarget: number;
  restaurantId: string;
}
const SORT_OPTIONS = [
  { value: "last_visit", label: "Last visit" },
  { value: "total_spent", label: "Total spent" },
  { value: "total_orders", label: "Total orders" },
  { value: "streak", label: "Loyalty streak" },
];

export function CustomersClient({
  initialCustomers,
  streakTarget,
}: CustomersClientProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("last_visit");
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const debouncedSearch = useDebounce(search, 300);
  const isFirstRender = useRef(true);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      q: debouncedSearch,
      sort,
    });

    try {
      const res = await fetch(`/api/admin/customers?${params}`);
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (res.ok) setCustomers(data.customers ?? []);
    } catch (error) {
      console.error("Failed to load customers", error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, sort]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchCustomers();
  }, [fetchCustomers]);

  function handleRewardRedeemed(customerId: string) {
    setCustomers((prev) => prev.map((c) => (c.id === customerId ? { ...c, has_reward: false } : c)));
  }

  function getCustomerDisplay(customer: Customer) {
    const name = customer.name?.trim();
    const mobile = customer.mobile?.trim();

    return {
      primary: name || mobile || "Customer",
      secondary: name ? mobile || "Google sign-in" : mobile || "Google sign-in",
    };
  }

  return (
    <div>
      <div className="mb-6 flex gap-3">
        <div className="relative max-w-sm flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by name or mobile…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={sort} onValueChange={setSort} openOnHover>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last_visit">Last visit</SelectItem>
            <SelectItem value="total_spent">Total spent</SelectItem>
            <SelectItem value="total_orders">Total orders</SelectItem>
            <SelectItem value="streak">Loyalty streak</SelectItem>
          </SelectContent>
        </Select>
        
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          { label: "Total customers", value: customers.length },
          { label: "With active rewards", value: customers.filter((c) => c.has_reward).length },
          { label: "At full streak", value: customers.filter((c) => c.streak_progress === streakTarget - 1).length },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border bg-white p-4">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-400">Searching…</div>
      ) : customers.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-12 text-center">
          <p className="text-sm text-slate-400">No customers found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="px-4 py-3 text-left font-medium text-slate-600">Customer</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Streak</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Orders</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Total spent</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Last visit</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Reward</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((customer) => {
                const display = getCustomerDisplay(customer);

                return (
                  <tr
                    key={customer.id}
                    className="cursor-pointer transition-colors hover:bg-slate-50"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{display.primary}</p>
                      <p className="text-xs text-slate-400">{display.secondary}</p>
                    </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Flame size={13} className={customer.streak_progress > 0 ? "text-orange-400" : "text-slate-300"} />
                      <span className="text-sm text-slate-700">{customer.streak_progress}/{streakTarget}</span>
                    </div>
                    <div className="mt-1 h-1 w-16 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-orange-400 transition-all"
                        style={{ width: `${(customer.streak_progress / streakTarget) * 100}%` }}
                      />
                    </div>
                  </td>

                  <td className="px-4 py-3 text-slate-700">{customer.total_orders}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">₹{Number(customer.total_spent).toFixed(0)}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {customer.last_visit
                      ? new Date(customer.last_visit).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                      : "Never"}
                  </td>
                    <td className="px-4 py-3">
                      {customer.has_reward ? (
                        <Badge className="gap-1 bg-violet-100 text-violet-700 hover:bg-violet-100">
                          <Gift size={10} />
                          Unredeemed
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedCustomer && (
        <CustomerDetailDrawer
          customer={selectedCustomer}
          streakTarget={streakTarget}
          onClose={() => setSelectedCustomer(null)}
          onRewardRedeemed={handleRewardRedeemed}
        />
      )}
    </div>
  );
}


