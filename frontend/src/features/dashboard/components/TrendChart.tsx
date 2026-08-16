import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnalyticsTrends } from '../hooks/useAnalyticsTrends';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, CalendarDays } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export function TrendChart() {
  const [searchParams] = useSearchParams();
  const fromParam = searchParams.get('from') || undefined;
  const toParam = searchParams.get('to') || undefined;
  
  const { data, isLoading, isError } = useAnalyticsTrends({ from: fromParam, to: toParam });
  const hasFilter = fromParam && toParam && !isNaN(Date.parse(fromParam)) && !isNaN(Date.parse(toParam));
  const description = hasFilter 
    ? `Динамика дефектов за выбранный период`
    : "Количество дефектов за последние 7 дней";

  if (isLoading) {
    return (
      <Card className="col-span-1 lg:col-span-4 h-full min-h-[400px] flex flex-col">
        <CardHeader>
          <CardTitle>Динамика обнаружения</CardTitle>
          <CardDescription>Загрузка данных...</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 items-center justify-center flex">
          <Skeleton className="h-full w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="col-span-1 lg:col-span-4 h-full min-h-[400px] flex flex-col">
        <CardHeader>
          <CardTitle>Динамика обнаружения</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center text-muted-foreground border-t">
          <LineChart className="mb-2 h-8 w-8 opacity-20" />
          <p>Не удалось загрузить график трендов.</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="col-span-1 lg:col-span-4 h-full min-h-[400px] flex flex-col">
        <CardHeader>
          <CardTitle>Динамика обнаружения</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center text-muted-foreground border-t">
          <CalendarDays className="mb-4 h-12 w-12 opacity-20" />
          <p className="font-medium text-lg text-foreground">Нет данных</p>
          <p className="text-sm">За последние 7 дней дефектов не обнаружено.</p>
        </CardContent>
      </Card>
    );
  }

  const formattedData = data.map(item => {
    const d = new Date(item.date);
    const label = d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
    return { ...item, label };
  });

  return (
    <Card className="col-span-1 lg:col-span-4 h-full min-h-[400px] flex flex-col">
      <CardHeader>
        <CardTitle>Динамика обнаружения</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-6">
        <ResponsiveContainer width="100%" height="100%" minHeight={300} className="outline-none" style={{ outline: 'none' }}>
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} className="outline-none" style={{ outline: 'none' }}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis 
              dataKey="label" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              allowDecimals={false}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#111827', fontWeight: 500 }}
              labelStyle={{ color: '#6b7280', marginBottom: '4px' }}
            />
            <Area 
              type="monotone" 
              dataKey="count" 
              name="Дефекты"
              stroke="#3b82f6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorCount)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
