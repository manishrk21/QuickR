"use client";

import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface DailyRow { day: string; revenue: number; order_count: number; }
interface RevenueChartProps { data: DailyRow[]; days: number; }

function formatDay(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  return days <= 7 ? d.toLocaleDateString("en-IN", { weekday: "short" }) : d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function formatRevenue(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
  return `₹${value}`;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[#630102]/10 bg-[#EDEBDE] px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-[#1a0000]">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>{entry.name}: {entry.dataKey === "revenue" ? `₹${Number(entry.value).toFixed(0)}` : entry.value}</p>
      ))}
    </div>
  );
};

export function RevenueChart({ data, days }: RevenueChartProps) {
  const [view, setView] = useState<"revenue" | "orders">("revenue");
  const chartData = data.map((row) => ({ ...row, day: formatDay(row.day, days), revenue: Number(row.revenue), order_count: Number(row.order_count) }));
  const tickInterval = days <= 7 ? 0 : days <= 30 ? 4 : 9;

  return (
    <div className="rounded-2xl border border-[#630102]/10 bg-[#EDEBDE] p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold text-[#1a0000]">{view === "revenue" ? "Daily revenue" : "Orders per day"}</h2>
        <div className="flex flex-wrap gap-1">
          <Button size="sm" variant={view === "revenue" ? "default" : "outline"} className="text-xs h-7" onClick={() => setView("revenue")}>Revenue</Button>
          <Button size="sm" variant={view === "orders" ? "default" : "outline"} className="text-xs h-7" onClick={() => setView("orders")}>Orders</Button>
        </div>
      </div>
      <div className="h-64 w-full sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        {view === "revenue" ? (
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs><linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} /><stop offset="95%" stopColor="#7c3aed" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} interval={tickInterval} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={formatRevenue} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={48} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#7c3aed" strokeWidth={2} fill="url(#revenueGrad)" dot={false} activeDot={{ r: 4, fill: "#7c3aed" }} />
          </AreaChart>
        ) : (
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} interval={tickInterval} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={32} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="order_count" name="Orders" fill="#7c3aed" radius={[3, 3, 0, 0]} maxBarSize={24} />
          </BarChart>
        )}
      </ResponsiveContainer>
      </div>
    </div>
  );
}
