import { useQuery } from '@tanstack/react-query';
import { ClipboardList, Clock3, MapPin, RefreshCcw, UploadCloud } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '@/api/client';
import type { DefectMarker } from '@/features/map/types';
import { PanelHeader } from '@/components/layout/PanelHeader';
import { statusChip, statusLabel, severityClasses, severityLabel, type Severity } from '@/lib/roadvision-data';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyDefectsPage() {
  const query = useQuery({
    queryKey: ['my-defects'],
    queryFn: async () => (await apiClient.get<DefectMarker[]>('/defects/mine')).data,
    retry: 1,
  });

  const defects = query.data ?? [];

  return (
    <div className="space-y-4 md:space-y-5">
      <section className="panel overflow-hidden">
        <PanelHeader
          title="Отправленные обращения"
          meta={`${defects.length} обращений`}
        />

        <div className="px-4 py-10 md:px-5">
          {query.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="panel p-5 space-y-3 bg-surface/30">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-20 rounded-md" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : query.isError ? (
            <div role="alert" className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-destructive/40 bg-destructive/10">
              <p className="text-[13px] font-medium text-destructive">Не удалось загрузить обращения.</p>
              <button
                type="button"
                onClick={() => query.refetch()}
                className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-[12.5px] font-medium text-foreground hover:bg-surface"
              >
                <RefreshCcw className="size-3.5" />
                Повторить
              </button>
            </div>
          ) : defects.length === 0 ? (
            <div className="mx-auto flex max-w-md flex-col items-center rounded-xl border border-dashed border-border-strong bg-surface/40 px-6 py-10 text-center">
              <span className="grid size-11 place-items-center rounded-xl border border-border bg-card">
                <ClipboardList className="size-[21px] text-primary" strokeWidth={1.9} />
              </span>
              <p className="mt-4 text-[13.5px] font-medium text-foreground">
                У вас пока нет отправленных обращений
              </p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
                Загрузите фотографию дороги — ИИ определит тип дефекта, а статус обработки
                появится здесь.
              </p>
              <Link
                to="/upload"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-[12.5px] font-semibold text-primary-foreground shadow-glow transition-opacity hover:opacity-90"
              >
                <UploadCloud className="size-4" /> Загрузить дефект
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {defects.map((defect) => (
                <article
                  key={defect.id}
                  className="rounded-xl border border-border bg-surface/40 p-4 sm:p-5 transition-colors hover:border-border-strong"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-eyebrow">Обращение</span>
                      <h2 className="num text-[17px] font-bold text-foreground">
                        #{defect.id}
                      </h2>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {defect.severity && (
                        <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold", severityClasses[defect.severity as Severity]?.chip)}>
                          {severityLabel[defect.severity as Severity] ?? defect.severity}
                        </span>
                      )}
                      <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold", statusChip[defect.status])}>
                        {statusLabel[defect.status] ?? defect.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-[12.5px] text-muted-foreground">
                    <p className="flex items-center gap-2 text-foreground">
                      <MapPin className="size-3.5 shrink-0 text-primary" />
                      <span className="truncate">{defect.address || `${defect.latitude.toFixed(5)}, ${defect.longitude.toFixed(5)}`}</span>
                    </p>
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Clock3 className="size-3.5 shrink-0" />
                      <span>{defect.created_at ? new Date(defect.created_at).toLocaleString('ru-RU') : 'Недавно'}</span>
                    </p>
                    <p className="pt-1 text-[11.5px] text-muted-foreground/80">
                      Приоритет: <span className="capitalize text-foreground font-medium">{defect.priority}</span> · подтверждений: {defect.confirmation_count}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
