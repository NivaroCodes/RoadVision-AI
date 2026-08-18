import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { trendData } from "@/lib/roadvision-data";
import { PanelHeader } from "./DashboardShell";

export function DetectionTrends({ dateRange }: { dateRange: string }) {
  return (
    <section className="panel overflow-hidden">
      <PanelHeader
        title="Динамика обнаружения"
        meta={`${dateRange} · всего дефектов и критические`}
        action={
          <div className="hidden items-center gap-3 sm:flex">
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="h-[2px] w-3 rounded-full bg-primary" /> Дефекты
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="h-[2px] w-3 rounded-full bg-critical" /> Критические
            </span>
          </div>
        }
      />
      <div className="h-[248px] w-full px-2 py-4 pr-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="rv-detections" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 4"
              stroke="var(--border-strong)"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              stroke="var(--muted-foreground)"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
              dy={6}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
              width={32}
            />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border-strong)",
                borderRadius: 10,
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--muted-foreground)", fontSize: 11 }}
            />
            <Area
              type="monotone"
              dataKey="detections"
              stroke="var(--primary)"
              strokeWidth={2.2}
              fill="url(#rv-detections)"
              dot={{ r: 3, fill: "var(--primary)", strokeWidth: 0 }}
              activeDot={{ r: 4.5 }}
              name="Дефекты"
            />
            <Line
              type="monotone"
              dataKey="critical"
              stroke="var(--critical)"
              strokeWidth={2}
              dot={{ r: 2.5, fill: "var(--critical)", strokeWidth: 0 }}
              name="Критические"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
