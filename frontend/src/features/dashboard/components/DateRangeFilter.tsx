import * as React from 'react';
import { format, subDays, parseISO, isValid } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { useSearchParams } from 'react-router-dom';

import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function DateRangeFilter({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [searchParams, setSearchParams] = useSearchParams();
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');

  const dateRange: DateRange | undefined = React.useMemo(() => {
    const parsedFrom = fromParam ? parseISO(fromParam) : undefined;
    const parsedTo = toParam ? parseISO(toParam) : undefined;

    if (parsedFrom && isValid(parsedFrom) && parsedTo && isValid(parsedTo)) {
      if (parsedFrom > parsedTo) {
        return { from: parsedTo, to: parsedFrom };
      }
      return { from: parsedFrom, to: parsedTo };
    }
    return undefined;
  }, [fromParam, toParam]);

  const [date, setDate] = React.useState<DateRange | undefined>(dateRange);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isWideViewport, setIsWideViewport] = React.useState(() => window.matchMedia('(min-width: 768px)').matches);

  React.useEffect(() => {
    setDate(dateRange);
  }, [dateRange]);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const updateViewport = (event: MediaQueryListEvent) => setIsWideViewport(event.matches);
    mediaQuery.addEventListener('change', updateViewport);
    return () => mediaQuery.removeEventListener('change', updateViewport);
  }, []);

  const updateUrl = (newDate: DateRange | undefined) => {
    setDate(newDate);
    const newParams = new URLSearchParams(searchParams);

    if (newDate?.from && newDate?.to) {
      newParams.set('from', format(newDate.from, 'yyyy-MM-dd'));
      newParams.set('to', format(newDate.to, 'yyyy-MM-dd'));
    } else {
      newParams.delete('from');
      newParams.delete('to');
    }

    setSearchParams(newParams);
  };

  const handleSelect = (selectedDate: DateRange | undefined) => {
    setDate(selectedDate);
    if (!selectedDate) {
      updateUrl(undefined);
    } else if (selectedDate.from && selectedDate.to) {
      if (selectedDate.from > selectedDate.to) {
        updateUrl({ from: selectedDate.to, to: selectedDate.from });
      } else {
        updateUrl(selectedDate);
      }
    }
  };

  const setPreset = (days: number) => {
    const toDate = new Date();
    const fromDate = subDays(toDate, days - 1);
    updateUrl({ from: fromDate, to: toDate });
    setIsOpen(false);
  };

  const resetFilter = () => {
    setDate(undefined);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('from');
    newParams.delete('to');
    setSearchParams(newParams);
  };

  const hasFilter = !!fromParam || !!toParam;

  return (
    <div className={cn('flex min-w-0 flex-wrap items-center gap-2', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              'flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-[12.5px] font-medium text-foreground/90 transition-colors hover:border-border-strong hover:bg-surface',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="size-3.5 text-muted-foreground" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'dd MMM yyyy', { locale: ru })} -{' '}
                  {format(date.to, 'dd MMM yyyy', { locale: ru })}
                </>
              ) : (
                format(date.from, 'dd MMM yyyy', { locale: ru })
              )
            ) : (
              <span>Период: Выберите даты</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto max-w-[calc(100vw-1rem)] overflow-x-hidden p-0 border border-border bg-popover text-popover-foreground shadow-panel rounded-xl" align="end">
          <div className="flex flex-col md:flex-row">
            <div className="flex flex-col gap-2 border-b border-border p-4 md:border-r md:border-b-0">
              <span className="text-eyebrow mb-1">Пресеты</span>
              <button
                type="button"
                className="h-8 rounded-md border border-border bg-surface/50 px-2.5 text-left text-[12px] text-foreground transition-colors hover:bg-surface"
                onClick={() => setPreset(7)}
              >
                За последние 7 дней
              </button>
              <button
                type="button"
                className="h-8 rounded-md border border-border bg-surface/50 px-2.5 text-left text-[12px] text-foreground transition-colors hover:bg-surface"
                onClick={() => setPreset(30)}
              >
                За последние 30 дней
              </button>
              <button
                type="button"
                className="h-8 rounded-md border border-border bg-surface/50 px-2.5 text-left text-[12px] text-foreground transition-colors hover:bg-surface"
                onClick={() => setPreset(365)}
              >
                За последние 365 дней
              </button>
            </div>
            <div className="p-2">
              <Calendar
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={handleSelect}
                numberOfMonths={isWideViewport ? 2 : 1}
                locale={ru}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {hasFilter && (
        <button
          type="button"
          onClick={resetFilter}
          className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-[12px] text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
        >
          Сбросить фильтр
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
