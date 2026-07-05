"use client";

interface PeakHourRow { hour_of_day: number; day_of_week: number; order_count: number; }
interface PeakHoursHeatmapProps { data: PeakHourRow[]; }

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 8); 

function getCellColor(count: number, maxCount: number): string {
  if (count === 0 || maxCount === 0) return "#f6f0e3";
  const intensity = count / maxCount;
  if (intensity < 0.25) return "#e9dcc7";
  if (intensity < 0.5) return "#d9b88f";
  if (intensity < 0.75) return "#b86a4b";
  return "#630102";
}

function getFontColor(count: number, maxCount: number): string {
  if (count === 0 || maxCount === 0) return "#c7a98a";
  return (count / maxCount) >= 0.5 ? "#fff" : "#4b2415";
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
    <div className="rounded-2xl border border-[#630102]/10 bg-[#EDEBDE] p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold text-[#1a0000]">Peak hours</h2>
        {peakCount > 0 && <span className="text-xs text-[#630102]/50">Busiest: {DAYS[peakDay]} {formatHour(peakHour)}</span>}
      </div>
      {data.length === 0 ? <p className="py-8 text-center text-sm text-[#630102]/45">No data in this period.</p> : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: 420 }}>
            <thead><tr><th className="w-8" />{HOURS.map((h) => <th key={h} className="pb-1 text-center" style={{ minWidth: 24 }}><span className="block text-[#630102]/35" style={{ fontSize: 9, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>{formatHour(h)}</span></th>)}</tr></thead>
            <tbody>
              {DAYS.map((dayLabel, d) => (
                <tr key={d}>
                  <td className="pr-1.5 text-right font-medium text-[#630102]/45" style={{ fontSize: 10 }}>{dayLabel}</td>
                  {HOURS.map((h) => {
                    const count = grid[d][h] ?? 0;
                    return (
                      <td key={h} className="p-px">
                        <div className="flex items-center justify-center rounded-sm transition-colors" style={{ width: 22, height: 18, background: getCellColor(count, maxCount), color: getFontColor(count, maxCount), fontSize: 8, fontWeight: 600 }} title={`${dayLabel} ${formatHour(h)}: ${count} orders`} >
                          {count > 0 ? count : ""}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 flex flex-wrap items-center justify-end gap-1.5">
            <span className="text-xs text-[#630102]/45">Low</span>
            {["#f6f0e3", "#e9dcc7", "#d9b88f", "#630102"].map((c) => <div key={c} className="h-3 w-4 rounded-sm" style={{ background: c }} />)}
            <span className="text-xs text-[#630102]/45">High</span>
          </div>
        </div>
      )}
    </div>
  );
}
