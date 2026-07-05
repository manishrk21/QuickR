"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Gift, Phone, Flame, ShoppingBag, Calendar } from "lucide-react";

interface CustomerDetailDrawerProps {
  customer: {
    id: string;
    name: string | null;
    mobile: string | null;
    total_orders: number;
    total_spent: number;
    has_reward: boolean;
  };
  streakTarget: number;
  onClose: () => void;
  onRewardRedeemed: (customerId: string) => void;
}

interface DetailData {
  customer?: {
    id: string;
    name: string | null;
    mobile: string | null;
    created_at?: string;
    is_guest?: boolean;
  } | null;
  orders: {
    id: string;
    status: string;
    total_amount: number;
    created_at: string;
    tables: { label: string } | null;
  }[];
  visits: { id: string; visit_date: string }[];
  rewards: {
    id: string;
    reward_type: string;
    is_redeemed: boolean;
    redeemed_at: string | null;
    created_at: string;
  }[];
  visitCount: number;
  streakProgress: number;
  streakTarget: number;
}

const ORDER_STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-blue-100 text-blue-700",
  preparing: "bg-violet-100 text-violet-700",
  ready: "bg-green-100 text-green-700",
  served: "bg-slate-100 text-slate-600",
  paid: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-600",
};

export function CustomerDetailDrawer({
  customer,
  streakTarget,
  onClose,
  onRewardRedeemed,
}: CustomerDetailDrawerProps) {
  const [data, setData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeemLoading, setRedeemLoading] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetch(`/api/admin/customers/${customer.id}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed to load customer details");
        return r.json();
      })
      .then((d) => {
        if (!isMounted) return;

        setData({
          customer: d?.customer ?? null,
          orders: d?.orders ?? [],
          visits: d?.visits ?? [],
          rewards: d?.rewards ?? [],
          visitCount: d?.visitCount ?? 0,
          streakProgress: d?.streakProgress ?? 0,
          streakTarget: d?.streakTarget ?? streakTarget,
        });
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setData({
          customer: null,
          orders: [],
          visits: [],
          rewards: [],
          visitCount: 0,
          streakProgress: 0,
          streakTarget,
        });
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [customer.id, streakTarget]);

  async function handleRedeem(rewardId: string) {
    setRedeemLoading(rewardId);
    const res = await fetch(`/api/admin/customers/${customer.id}/rewards/${rewardId}`, { method: "PATCH" });
    if (res.ok) {
      setData((prev) =>
        prev
          ? {
              ...prev,
              rewards: prev.rewards.map((r) => (r.id === rewardId ? { ...r, is_redeemed: true, redeemed_at: new Date().toISOString() } : r)),
            }
          : prev
      );
      onRewardRedeemed(customer.id);
    }
    setRedeemLoading(null);
  }

  const rewards = data?.rewards ?? [];
  const unredeemedRewards = rewards.filter((r) => !r.is_redeemed);
  const redeemedRewards = rewards.filter((r) => r.is_redeemed);
  const orders = data?.orders ?? [];
  const visits = data?.visits ?? [];
  const displayCustomer = data?.customer ?? customer;
  
  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full px-0 sm:max-w-md" side="right">
        <SheetHeader className="border-b px-6 pb-4">
          <SheetTitle className="text-base font-semibold">
            {displayCustomer.name ?? displayCustomer.mobile ?? "Customer"}
          </SheetTitle>
          {displayCustomer.mobile && (
            <p className="-mt-1 flex items-center gap-1.5 text-sm text-slate-500">
              <Phone size={12} />
              {displayCustomer.mobile}
            </p>
          )}
        </SheetHeader>

        <div className="h-[calc(100vh-80px)] overflow-auto">
          <div className="space-y-6 px-6 py-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: ShoppingBag, label: "Orders", value: customer.total_orders },
                { icon: null, label: "Spent", value: `₹${Number(customer.total_spent).toFixed(0)}` },
                { icon: Flame, label: "Visits", value: data?.visitCount ?? "…" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-lg border p-3 text-center">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="mt-0.5 text-lg font-bold text-slate-900">{value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                  <Flame size={14} className="text-orange-400" />
                  Loyalty streak
                </p>
                {loading ? <Skeleton className="h-4 w-12" /> : <span className="text-sm font-bold text-slate-700">{data?.streakProgress ?? 0}/{streakTarget}</span>}
              </div>

              <div className="flex flex-wrap gap-2">
                {Array.from({ length: streakTarget }).map((_, i) => {
                  const filled = Boolean(data && i < (data.streakProgress ?? 0));
                  return (
                    <span key={i} className="inline-flex">
                      <svg className={`w-5 h-5 ${filled ? "" : "filter grayscale opacity-40"}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                        <circle cx="12" cy="7" r="4" fill={filled ? "#fb923c" : "#e2e8f0"} />
                        <path d="M7 12c0 2 1.5 5 5 5s5-3 5-5v-1H7v1z" fill={filled ? "#fb923c" : "#e2e8f0"} />
                      </svg>
                    </span>
                  );
                })}
              </div>

              {data && (
                <p className="mt-2 text-xs text-slate-400">
                  {data.streakProgress === 0
                    ? "No visits in current cycle"
                    : data.streakProgress === streakTarget - 1
                      ? "One more visit to earn a reward!"
                      : `${streakTarget - data.streakProgress} more visits to earn a reward`}
                </p>
              )}
            </div>

            {(customer.has_reward || unredeemedRewards.length > 0) && (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Pending rewards</p>
                <div className="space-y-2">
                  {loading ? [1, 2].map((i) => <Skeleton key={i} className="h-14 w-full" />) : unredeemedRewards.map((reward) => (
                    <div key={reward.id} className="flex items-center justify-between rounded-xl border border-violet-200 bg-violet-50 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Gift size={16} className="text-violet-500" />
                        <div>
                          <p className="text-sm font-medium text-violet-800">Streak reward</p>
                          <p className="text-xs text-violet-500">
                            Earned {new Date(reward.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="border-violet-300 text-xs text-violet-700 hover:bg-violet-100" disabled={redeemLoading === reward.id} onClick={() => handleRedeem(reward.id)}>
                        {redeemLoading === reward.id ? "Redeeming…" : "Mark redeemed"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            
            {redeemedRewards.length > 0 && (


              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Redeemed rewards</p>
                <div className="space-y-1">
                  {redeemedRewards.map((reward) => (
                    <div key={reward.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                      <span className="text-xs text-slate-500">Streak reward</span>
                      <span className="text-xs text-slate-400">
                        Redeemed {reward.redeemed_at ? new Date(reward.redeemed_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Recent orders</p>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : orders.length === 0 ? (
              

                <p className="text-sm text-slate-400">No orders yet.</p>
              ) : (
                <div className="space-y-2">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-400">#{order.id.slice(0, 6).toUpperCase()}</span>
                          {order.tables?.label && <span className="text-xs text-slate-500">{order.tables.label}</span>}
                        </div>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-800">₹{Number(order.total_amount).toFixed(0)}</p>
                        <Badge className={`mt-0.5 text-xs ${ORDER_STATUS_BADGE[order.status] ?? ""}`}>{order.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Visit history</p>
              {loading ? <Skeleton className="h-20 w-full" /> : visits.length === 0 ? (
                <p className="text-sm text-slate-400">No visits recorded yet.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {visits.slice(0, 30).map((visit) => (
                    <span key={visit.id} className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
                      <Calendar size={10} />
                      {new Date(visit.visit_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  ))}
                  {visits.length > 30 && <span className="px-2 py-1 text-xs text-slate-400">+{visits.length - 30} more</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
