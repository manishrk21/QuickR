"use client";

import { useState, useTransition } from "react";
import { SummaryCards } from "./SummaryCards";
import { RevenueChart } from "./RevenueChart";
import { TopItemsTable } from "./TopItemsTable";
import { PeakHoursHeatmap } from "./PeakHoursHeatmap";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type DailyRow = { day: string; revenue: number; order_count: number; };
type TopItem = { menu_item_id: string; name: string; food_type: string; total_quantity: number; total_revenue: number; order_count: number; };
type PeakHourRow = { hour_of_day: number; day_of_week: number; order_count: number; };
type Summary = { period_revenue: number; period_orders: number; prev_revenue: number; prev_orders: number; today_revenue: number; today_orders: number; avg_order_value: number; };

interface AnalyticsData { daily: DailyRow[]; topItems: TopItem[]; peakHours: PeakHourRow[]; summary: Summary | null; }
interface AnalyticsClientProps { initialData: AnalyticsData; restaurantId: string; defaultDays: number; }

const DAY_OPTIONS = [{ label: "7 days", value: 7 }, { label: "30 days", value: 30 }, { label: "90 days", value: 90 }];

export function AnalyticsClient({ initialData, restaurantId, defaultDays }: AnalyticsClientProps) {
  const [days, setDays] = useState(defaultDays);
  const [data, setData] = useState<AnalyticsData>(initialData);
  const [isPending, startTransition] = useTransition();

  async function handleDaysChange(newDays: number) {
    setDays(newDays);
    startTransition(async () => {
      const res = await fetch(`/api/admin/analytics?days=${newDays}`);
      const json = await res.json();
      if (res.ok) setData(json);
    });
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {DAY_OPTIONS.map((opt) => (
          <Button key={opt.value} size="sm" variant={days === opt.value ? "default" : "outline"} onClick={() => handleDaysChange(opt.value)} disabled={isPending} className="text-xs">
            {opt.label}
          </Button>
        ))}
        {isPending && <span className="ml-1 animate-pulse text-xs text-[#630102]/50">Loading…</span>}
      </div>

      {isPending ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-2xl border border-[#630102]/10 bg-[#EDEBDE]" />)}</div> : <SummaryCards summary={data.summary} days={days} />}
      <div className="grid grid-cols-1 gap-4">{isPending ? <Skeleton className="h-72 rounded-2xl border border-[#630102]/10 bg-[#EDEBDE]" /> : <RevenueChart data={data.daily} days={days} />}</div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">{isPending ? <><Skeleton className="h-80 rounded-2xl border border-[#630102]/10 bg-[#EDEBDE]" /><Skeleton className="h-80 rounded-2xl border border-[#630102]/10 bg-[#EDEBDE]" /></> : <><TopItemsTable items={data.topItems} /><PeakHoursHeatmap data={data.peakHours} /></>}</div>
    </div>
  );
}
