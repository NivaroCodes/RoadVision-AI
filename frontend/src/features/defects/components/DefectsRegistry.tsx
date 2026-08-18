import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, RefreshCcw, Search, SearchX } from 'lucide-react';
import { EmptyState } from '@/components/feedback/EmptyState';
import type { DefectMarker } from '@/features/map/types';
import { useDefects } from '../hooks/useDefects';
import { DefectEditDialog } from './DefectEditDialog';
import { DefectsTable } from './DefectsTable';
import { DefectsTableSkeleton } from './DefectsTableSkeleton';
import { exportToCSV } from '../utils/exportToCSV';
import { ReportExportDialog } from '@/features/reporting';
import { useAuth } from '@/features/auth/useAuth';

export function DefectsRegistry() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const fromParam = searchParams.get('from') || undefined;
  const toParam = searchParams.get('to') || undefined;
  
  const { data: defects = [], isLoading, error, refetch } = useDefects({ from: fromParam, to: toParam });
  const [selectedDefect, setSelectedDefect] = useState<DefectMarker | null>(null);
  const [query, setQuery] = useState('');

  const filteredDefects = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ru');
    if (!normalizedQuery) return defects;
    return defects.filter(
      (defect) =>
        String(defect.id).includes(normalizedQuery) ||
        defect.address?.toLocaleLowerCase('ru').includes(normalizedQuery) === true ||
        (defect.type && String(defect.type).toLowerCase().includes(normalizedQuery))
    );
  }, [defects, query]);

  const handleSave = () => {
    setSelectedDefect(null);
  };

  return (
    <div className="space-y-4 md:space-y-5" aria-labelledby="defects-registry-title">
      <section className="panel p-4 md:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 id="defects-registry-title" className="text-[14px] font-semibold tracking-tight text-foreground">
              Реестр дефектов
            </h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              Показано {filteredDefects.length} из {defects.length}. Нажмите на строку для редактирования.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <div className="relative sm:w-[260px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                id="defects-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Поиск по ID или адресу"
                className="h-9 w-full rounded-lg border border-border bg-surface/60 pl-9 pr-3 text-[12.5px] text-foreground outline-none transition focus-visible:border-ring"
              />
            </div>
            {user?.role === 'admin' && (
              <ReportExportDialog defects={filteredDefects} period={{ from: fromParam, to: toParam }} triggerClassName="h-9 text-[12.5px]" />
            )}
            {user?.role === 'admin' && (
              <button
                type="button"
                className="flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-[12.5px] font-semibold text-primary-foreground shadow-glow transition-opacity hover:opacity-90 disabled:opacity-50"
                onClick={() => exportToCSV(filteredDefects)}
                disabled={filteredDefects.length === 0 || isLoading}
              >
                <Download className="size-3.5" aria-hidden="true" />
                Скачать CSV
              </button>
            )}
          </div>
        </div>
      </section>

      {isLoading ? (
        <DefectsTableSkeleton />
      ) : error ? (
        <div className="panel flex min-h-72 flex-col items-center justify-center p-6 text-center sm:p-10 border-destructive/40 bg-destructive/10" role="alert">
          <p className="font-medium text-destructive">Ошибка загрузки дефектов</p>
          <p className="mt-1 max-w-md text-xs text-muted-foreground">Не удалось получить данные с сервера. Проверьте подключение и повторите попытку.</p>
          <button
            type="button"
            className="mt-4 flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-[12.5px] font-medium text-foreground hover:bg-surface"
            onClick={() => refetch()}
          >
            <RefreshCcw className="size-3.5" aria-hidden="true" />
            Повторить
          </button>
        </div>
      ) : defects.length === 0 ? (
        <div className="panel flex min-h-72 flex-col items-center justify-center p-6 text-center sm:p-10 border-dashed">
          <p className="font-medium text-[13.5px] text-foreground">Реестр дефектов пуст</p>
          <p className="mt-1 text-[12.5px] text-muted-foreground">В базе данных пока нет зафиксированных дефектов.</p>
        </div>
      ) : filteredDefects.length > 0 ? (
        <DefectsTable defects={filteredDefects} onSelect={setSelectedDefect} />
      ) : (
        <EmptyState icon={SearchX} className="panel p-8" />
      )}

      <DefectEditDialog
        defect={selectedDefect}
        onOpenChange={(open) => {
          if (!open) setSelectedDefect(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
}
