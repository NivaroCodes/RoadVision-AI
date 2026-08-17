import * as React from 'react';
import { format, subDays, parseISO, isValid } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { useSearchParams } from 'react-router-dom';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
    <div className={cn('flex min-w-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger 
          render={
            <Button
              id="date"
              variant={'outline'}
              className={cn(
                'w-full min-w-0 justify-start overflow-hidden text-left font-normal sm:w-[280px]',
                !date && 'text-muted-foreground'
              )}
            />
          }
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
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
            <span>Выберите период</span>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-auto max-w-[calc(100vw-1rem)] overflow-x-hidden p-0" align="end">
          <div className="flex flex-col md:flex-row">
            <div className="flex flex-col gap-2 border-b border-neutral-800 p-4 md:border-r md:border-b-0">
              <span className="text-sm font-medium mb-1">Пресеты</span>
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => setPreset(7)}
              >
                За последние 7 дней
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => setPreset(30)}
              >
                За последние 30 дней
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => setPreset(365)}
              >
                За последние 365 дней
              </Button>
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
        <Button
          variant="ghost"
          onClick={resetFilter}
          className="text-muted-foreground hover:text-foreground"
        >
          Сбросить фильтр
          <X className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
