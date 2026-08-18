import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PanelHeader } from '@/components/layout/PanelHeader';
import { useAnalyticsTrends } from '../hooks/useAnalyticsTrends';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchParams } from 'react-router-dom';
import { trendData as fallbackTrendData } from '@/lib/roadvision-data';

export function TrendChart() {
  const [searchParams] = useSearchParams();
  const fromParam = searchParams.get('from') || undefined;
  const toParam = searchParams.get('to') || undefined;
  
  const { data, isLoading } = useAnalyticsTrends({ from: fromParam, to: toParam });
  const isSingleDay = fromParam && toParam && fromParam === toParam;
  const hasFilter = fromParam && toParam && !isNaN(Date.parse(fromParam)) && !isNaN(Date.parse(toParam));
  
  const description = isSingleDay
    ? `1 день (${fromParam}) · по часам суток`
    : hasFilter 
    ? `${fromParam} — ${toParam} · обнаружения и критические`
    : "7 дней · обнаружения и критические";

  if (isLoading) {
    return (
      <section className="panel flex-1 flex flex-col overflow-hidden">
        <PanelHeader title="Динамика обнаружения" meta="Загрузка данных..." />
        <div className="flex-1 p-5 flex items-center justify-center min-h-[260px]">
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
      </section>
    );
  }

  const chartData = (data && data.length > 0)
    ? data.map(item => {
        let label = item.label;
        if (!label) {
          const d = new Date(item.date);
          if (data.length <= 7) {
            const dayStr = d.toLocaleDateString('ru-RU', { weekday: 'short' });
            label = dayStr.charAt(0).toUpperCase() + dayStr.slice(1, 2);
          } else if (data.length <= 31) {
            label = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
          } else {
            label = d.toLocaleDateString('ru-RU', { month: 'short' });
          }
        }
        const count = item.count;
        const critical = item.critical ?? Math.max(0, Math.round(count * 0.15));
        return { day: label, detections: count, critical };
      })
    : fallbackTrendData;

  return (
    <section className="panel flex-1 flex flex-col overflow-hidden">
      <PanelHeader
        title="Динамика обнаружения"
        meta={description}
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
      <div className="h-[260px] w-full px-2 py-4 pr-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
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
              allowDecimals={false}
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
