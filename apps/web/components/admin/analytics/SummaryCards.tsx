"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

interface Summary { period_revenue: number; period_orders: number; prev_revenue: number; prev_orders: number; today_revenue: number; today_orders: number; avg_order_value: number; }
interface SummaryCardsProps { summary: Summary | null; days: number; }

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

function TrendBadge({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-xs text-slate-400">No prior data</span>;
  const positive = pct >= 0;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-medium ${positive ? "text-emerald-600" : "text-red-500"}`}>
      {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {Math.abs(pct).toFixed(1)}% <span className="text-slate-400 font-normal">vs prev</span>
    </span>
  );
}

export function SummaryCards({ summary, days }: SummaryCardsProps) {
  if (!summary) return <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 text-sm">No paid orders yet.</div>;
  const revenuePct = pctChange(summary.period_revenue, summary.prev_revenue);
  const ordersPct = pctChange(summary.period_orders, summary.prev_orders);
  const cards = [
    { label: "Today's revenue", value: `₹${Number(summary.today_revenue).toFixed(0)}`, sub: `${summary.today_orders} orders today`, trend: null },
    { label: `Revenue (${days}d)`, value: `₹${Number(summary.period_revenue).toFixed(0)}`, sub: <TrendBadge pct={revenuePct} />, trend: revenuePct },
    { label: `Orders (${days}d)`, value: String(summary.period_orders), sub: <TrendBadge pct={ordersPct} />, trend: ordersPct },
    { label: "Avg order value", value: `₹${Number(summary.avg_order_value).toFixed(0)}`, sub: `last ${days} days`, trend: null },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs text-slate-500 font-medium">{card.label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1 mb-1">{card.value}</p>
          <div className="text-xs text-slate-400">{typeof card.sub === "string" ? card.sub : card.sub}</div>
        </div>
      ))}
    </div>
  );
}
