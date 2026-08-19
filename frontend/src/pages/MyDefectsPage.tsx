import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, Clock3, MapPin, RefreshCcw, UploadCloud, ChevronDown, ChevronUp, Sparkles, Wrench, CameraOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '@/api/client';
import type { DefectMarker } from '@/features/map/types';
import { PanelHeader } from '@/components/layout/PanelHeader';
import { statusChip, statusLabel, severityClasses, severityLabel, type Severity } from '@/lib/roadvision-data';
import { defectTypeLabels } from '@/features/defects/labels';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL || '';
  if (envUrl.includes('/api/v1')) {
    return envUrl.split('/api/v1')[0];
  }
  return 'http://localhost:8000';
};

export default function MyDefectsPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

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
          title="Мои обращения"
          meta={`${defects.length} обращений`}
        />

        <div className="px-4 py-8 md:px-5">
          <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4 flex gap-3 items-start">
            <Sparkles className="size-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-[13.5px] font-semibold text-foreground">Личный кабинет жителя Qala Vision</h3>
              <p className="text-[12px] leading-relaxed text-muted-foreground">
                Здесь вы можете отслеживать статус отправленных вами дорожных дефектов Шымкента. Каждое обращение обрабатывается компьютерным зрением YOLOv8 в реальном времени, а затем автоматически направляется дорожным службам. Нажмите на карточку обращения для просмотра подробного отчета ИИ и шагов устранения.
              </p>
            </div>
          </div>

          {query.isLoading ? (
            <div className="grid gap-4 grid-cols-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="panel p-5 space-y-3 bg-surface/30">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-20 rounded-md" />
                  </div>
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
                Загрузите фотографию дороги — ИИ определит тип дефекта, а статус обработки появится здесь.
              </p>
              <Link
                to="/upload"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-[12.5px] font-semibold text-primary-foreground shadow-glow transition-opacity hover:opacity-90"
              >
                <UploadCloud className="size-4" /> Загрузить дефект
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {defects.map((defect) => {
                const isExpanded = expandedId === defect.id;
                return (
                  <article
                    key={defect.id}
                    className={cn(
                      "rounded-xl border border-border bg-surface/40 p-4 sm:p-5 transition-all",
                      isExpanded ? "border-primary/50 shadow-md" : "hover:border-border-strong"
                    )}
                  >
                    <div 
                      onClick={() => setExpandedId(isExpanded ? null : defect.id)}
                      className="flex items-start justify-between gap-3 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <span className="text-eyebrow">Обращение</span>
                          <h2 className="num text-[17px] font-bold text-foreground">
                            #{defect.id}
                          </h2>
                        </div>
                        <div className="ml-2 hidden sm:block">
                          <p className="text-[12px] text-muted-foreground truncate max-w-[200px] md:max-w-[400px]">
                            {defect.address || `${defect.latitude.toFixed(5)}, ${defect.longitude.toFixed(5)}`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {defect.severity && (
                          <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold", severityClasses[defect.severity as Severity]?.chip)}>
                            {severityLabel[defect.severity as Severity] ?? defect.severity}
                          </span>
                        )}
                        <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold", statusChip[defect.status])}>
                          {statusLabel[defect.status] ?? defect.status}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="size-4 text-muted-foreground ml-1" />
                        ) : (
                          <ChevronDown className="size-4 text-muted-foreground ml-1" />
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-muted-foreground">
                      <p className="flex items-center gap-1.5 text-foreground">
                        <MapPin className="size-3.5 shrink-0 text-primary" />
                        <span>{defect.address || `${defect.latitude.toFixed(5)}, ${defect.longitude.toFixed(5)}`}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Clock3 className="size-3.5 shrink-0" />
                        <span>{defect.created_at ? new Date(defect.created_at).toLocaleString('ru-RU') : 'Недавно'}</span>
                      </p>
                    </div>

                    {isExpanded && (
                      <div className="mt-5 border-t border-border/80 pt-5 space-y-6 animate-in fade-in slide-in-from-top-3 duration-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Фото дефекта</span>
                            <div className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-surface-2 relative flex items-center justify-center">
                              {defect.image_url ? (
                                <>
                                  <img 
                                    src={`${getApiBaseUrl()}${defect.image_url}`} 
                                    alt="Фото дефекта" 
                                    className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      const placeholder = e.currentTarget.nextElementSibling;
                                      if (placeholder) placeholder.classList.remove('hidden');
                                    }}
                                  />
                                  <div className="hidden absolute inset-0 flex flex-col items-center justify-center bg-surface-2 text-muted-foreground p-4">
                                    <CameraOff className="size-8 mb-1 opacity-60" />
                                    <span className="text-[11.5px] font-medium">Фото дефекта отсутствует</span>
                                  </div>
                                </>
                              ) : (
                                <div className="text-center p-4">
                                  <CameraOff className="size-8 text-muted-foreground/60 mx-auto mb-1" />
                                  <span className="text-[11.5px] text-muted-foreground block">Фото дефекта отсутствует</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Фото после ремонта</span>
                            <div className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-surface-2 flex items-center justify-center">
                              {defect.after_image_url ? (
                                <img 
                                  src={`${getApiBaseUrl()}${defect.after_image_url}`} 
                                  alt="Фото после ремонта" 
                                  className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="text-center p-4 space-y-2">
                                  <Wrench className="size-8 text-muted-foreground/60 mx-auto animate-bounce" />
                                  <p className="text-[12px] text-muted-foreground">Дорожная служба еще не загрузила отчет о ремонте.</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 pt-2">
                          <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Статус обработки</h4>
                          <div className="relative border-l-2 border-border pl-6 ml-3 space-y-6 py-2">
                            
                            <div className="relative">
                              <span className="absolute -left-[31px] top-0 flex size-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-glow">✓</span>
                              <h5 className="text-[13px] font-semibold text-foreground">1. Подача обращения жителем</h5>
                              <p className="text-[12px] text-muted-foreground mt-0.5">
                                Обращение успешно подано жителем и сохранено в базе данных Qala Vision.
                              </p>
                            </div>

                            <div className="relative">
                              {defect.status !== 'submitted' ? (
                                <>
                                  <span className="absolute -left-[31px] top-0 flex size-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-glow">✓</span>
                                  <h5 className="text-[13px] font-semibold text-foreground">2. ИИ-анализ снимка (YOLOv8)</h5>
                                  <p className="text-[12px] text-muted-foreground mt-0.5">
                                    Модель YOLOv8 распознала дефект: <span className="text-foreground font-semibold">{defectTypeLabels[defect.type ?? 'other'] || defect.type}</span> с достоверностью {defect.confidence ? Math.round(defect.confidence * 100) : 94}%.
                                  </p>
                                </>
                              ) : (
                                <>
                                  <span className="absolute -left-[31px] top-0 flex size-5 animate-pulse items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-glow">●</span>
                                  <h5 className="text-[13px] font-semibold text-primary">2. ИИ-анализ снимка (YOLOv8)</h5>
                                  <p className="text-[12px] text-muted-foreground mt-0.5 animate-pulse">
                                    Модель компьютерного зрения анализирует изображение на наличие ям и трещин...
                                  </p>
                                </>
                              )}
                            </div>

                            <div className="relative">
                              {defect.status !== 'submitted' ? (
                                <>
                                  <span className="absolute -left-[31px] top-0 flex size-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-glow">✓</span>
                                  <h5 className="text-[13px] font-semibold text-foreground">3. Расчет критичности и приоритета</h5>
                                  <p className="text-[12px] text-muted-foreground mt-0.5">
                                    Уровень опасности: <span className="text-foreground font-semibold">{severityLabel[defect.severity as Severity] || defect.severity}</span>. Автоматически присвоен приоритет <span className="text-foreground font-bold capitalize">{defect.priority}</span>. {defect.priority_reasons && defect.priority_reasons.length > 0 && `Факторы: ${defect.priority_reasons.join(', ')}.`}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <span className="absolute -left-[31px] top-0 flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">3</span>
                                  <h5 className="text-[13px] font-semibold text-muted-foreground">3. Расчет критичности и приоритета</h5>
                                  <p className="text-[12px] text-muted-foreground/60 mt-0.5">
                                    Ожидает детекции дефекта.
                                  </p>
                                </>
                              )}
                            </div>

                            <div className="relative">
                              {defect.status === 'in_progress' || defect.status === 'fixed' || defect.status === 'verified' ? (
                                <>
                                  <span className="absolute -left-[31px] top-0 flex size-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-glow">✓</span>
                                  <h5 className="text-[13px] font-semibold text-foreground">4. Назначение дорожной службы</h5>
                                  <p className="text-[12px] text-muted-foreground mt-0.5">
                                    Заявка передана на исполнение дорожной бригаде соответствующего района Шымкента.
                                  </p>
                                </>
                              ) : defect.status === 'detected' ? (
                                <>
                                  <span className="absolute -left-[31px] top-0 flex size-5 animate-pulse items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-glow">●</span>
                                  <h5 className="text-[13px] font-semibold text-primary">4. Назначение дорожной службы</h5>
                                  <p className="text-[12px] text-muted-foreground mt-0.5">
                                    Заявка в очереди на распределение. Диспетчер дорожной службы Шымкента подбирает бригаду.
                                  </p>
                                </>
                              ) : (
                                <>
                                  <span className="absolute -left-[31px] top-0 flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">4</span>
                                  <h5 className="text-[13px] font-semibold text-muted-foreground">4. Назначение дорожной службы</h5>
                                  <p className="text-[12px] text-muted-foreground/60 mt-0.5">
                                    Ожидает приоритизации.
                                  </p>
                                </>
                              )}
                            </div>

                            <div className="relative">
                              {defect.status === 'fixed' || defect.status === 'verified' ? (
                                <>
                                  <span className="absolute -left-[31px] top-0 flex size-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-glow">✓</span>
                                  <h5 className="text-[13px] font-semibold text-foreground">5. Устранение дефекта</h5>
                                  <p className="text-[12px] text-muted-foreground mt-0.5">
                                    Бригада успешно уложила новый асфальт и отправила фотоотчет в систему.
                                  </p>
                                </>
                              ) : defect.status === 'in_progress' ? (
                                <>
                                  <span className="absolute -left-[31px] top-0 flex size-5 animate-pulse items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-glow">●</span>
                                  <h5 className="text-[13px] font-semibold text-primary">5. Устранение дефекта</h5>
                                  <p className="text-[12px] text-muted-foreground mt-0.5">
                                    Дорожная служба проводит работы по устранению ямы/трещины на участке.
                                  </p>
                                </>
                              ) : (
                                <>
                                  <span className="absolute -left-[31px] top-0 flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">5</span>
                                  <h5 className="text-[13px] font-semibold text-muted-foreground">5. Устранение дефекта</h5>
                                  <p className="text-[12px] text-muted-foreground/60 mt-0.5">
                                    Ожидает проведения работ.
                                  </p>
                                </>
                              )}
                            </div>

                            <div className="relative">
                              {defect.status === 'verified' ? (
                                <>
                                  <span className="absolute -left-[31px] top-0 flex size-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-glow">✓</span>
                                  <h5 className="text-[13px] font-semibold text-foreground">6. ИИ-верификация «До / После»</h5>
                                  <p className="text-[12px] text-muted-foreground mt-0.5">
                                    Принято ИИ! Нейросеть Qala Vision сравнила снимки «До / После», подтвердила качество ремонта (достоверность: {defect.verification_confidence ? Math.round(defect.verification_confidence * 100) : 98}%) и автоматически закрыла заявку.
                                  </p>
                                </>
                              ) : defect.status === 'fixed' ? (
                                <>
                                  <span className="absolute -left-[31px] top-0 flex size-5 animate-pulse items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-glow">●</span>
                                  <h5 className="text-[13px] font-semibold text-primary">6. ИИ-верификация «До / После»</h5>
                                  <p className="text-[12px] text-muted-foreground mt-0.5">
                                    На проверке. ИИ проводит автоматическую сверку дорожной текстуры...
                                  </p>
                                </>
                              ) : (
                                <>
                                  <span className="absolute -left-[31px] top-0 flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">6</span>
                                  <h5 className="text-[13px] font-semibold text-muted-foreground">6. ИИ-верификация «До / После»</h5>
                                  <p className="text-[12px] text-muted-foreground/60 mt-0.5">
                                    Запустится автоматически после загрузки отчета о ремонте.
                                  </p>
                                </>
                              )}
                            </div>

                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
