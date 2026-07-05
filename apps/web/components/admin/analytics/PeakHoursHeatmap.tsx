"use client";

interface PeakHourRow { hour_of_day: number; day_of_week: number; order_count: number; }
interface PeakHoursHeatmapProps { data: PeakHourRow[]; }

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 8); 

function getCellColor(count: number, maxCount: number): string {
  if (count === 0 || maxCount === 0) return "#f8fafc";
  const intensity = count / maxCount;
  if (intensity < 0.25) return "#ede9fe";
  if (intensity < 0.5) return "#c4b5fd";
  if (intensity < 0.75) return "#8b5cf6";
  return "#6d28d9";
}

function getFontColor(count: number, maxCount: number): string {
  if (count === 0 || maxCount === 0) return "#cbd5e1";
  return (count / maxCount) >= 0.5 ? "#fff" : "#4c1d95";
}

function formatHour(h: number): string {
  return h === 12 ? "12pm" : h < 12 ? `${h}am` : `${h - 12}pm`;
}

export function PeakHoursHeatmap({ data }: PeakHoursHeatmapProps) {
  const grid: Record<number, Record<number, number>> = {};
  for (let d = 0; d < 7; d++) { grid[d] = {}; for (const h of HOURS) grid[d][h] = 0; }
  for (const row of data) { if (HOURS.includes(row.hour_of_day)) grid[row.day_of_week][row.hour_of_day] = Number(row.order_count); }
  const maxCount = Math.max(...data.map((r) => Number(r.order_count)), 1);

  let peakDay = 0, peakHour = 8, peakCount = 0;
  for (const row of data) { if (Number(row.order_count) > peakCount) { peakCount = Number(row.order_count); peakDay = row.day_of_week; peakHour = row.hour_of_day; } }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-800">Peak hours</h2>
        {peakCount > 0 && <span className="text-xs text-slate-500">Busiest: {DAYS[peakDay]} {formatHour(peakHour)}</span>}
      </div>
      {data.length === 0 ? <p className="text-sm text-slate-400 text-center py-8">No data in this period.</p> : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: 320 }}>
            <thead><tr><th className="w-8" />{HOURS.map((h) => <th key={h} className="text-center pb-1" style={{ minWidth: 24 }}><span className="text-slate-400 block" style={{ fontSize: 9, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>{formatHour(h)}</span></th>)}</tr></thead>
            <tbody>
              {DAYS.map((dayLabel, d) => (
                <tr key={d}>
                  <td className="text-right pr-1.5 text-slate-400 font-medium" style={{ fontSize: 10 }}>{dayLabel}</td>
                  {HOURS.map((h) => {
                    const count = grid[d][h] ?? 0;
                    return (
                      <td key={h} className="p-px">
                        <div className="rounded-sm flex items-center justify-center transition-colors" style={{ width: 22, height: 18, background: getCellColor(count, maxCount), color: getFontColor(count, maxCount), fontSize: 8, fontWeight: 600 }} title={`${dayLabel} ${formatHour(h)}: ${count} orders`} >
                          {count > 0 ? count : ""}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center gap-1.5 mt-3 justify-end">
            <span className="text-xs text-slate-400">Low</span>
            {["#ede9fe", "#c4b5fd", "#8b5cf6", "#6d28d9"].map((c) => <div key={c} className="w-4 h-3 rounded-sm" style={{ background: c }} />)}
            <span className="text-xs text-slate-400">High</span>
          </div>
        </div>
      )}
    </div>
  );
}
