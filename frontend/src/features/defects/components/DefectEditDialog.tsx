import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock3, Loader2, Upload, Wrench } from 'lucide-react';
import { apiClient } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AuthUser } from '@/features/auth/types';
import { useAuth } from '@/features/auth/useAuth';
import type { DefectMarker, DefectSeverity, DefectStatus, DefectType } from '@/features/map/types';
import { analyzeDefect, assignDefect, getDefect, getDefectEvents, uploadAfterImage, type AnalysisPayload } from '../api';
import { defectSeverityLabels, defectTypeLabels } from '../labels';
import { useUpdateDefect } from '../hooks/useUpdateDefect';
import { cn } from '@/lib/utils';
import { statusLabel, severityLabel, type Severity } from '@/lib/roadvision-data';

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL || '';
  if (envUrl.includes('/api/v1')) {
    return envUrl.split('/api/v1')[0];
  }
  return 'http://localhost:8000';
};

interface DefectEditDialogProps {
  defect: DefectMarker | null;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

const statusTransitions: Record<DefectStatus, DefectStatus[]> = {
  submitted: ['rejected'],
  detected: ['in_progress', 'rejected'],
  in_progress: [],
  fixed: ['verified', 'in_progress'],
  verified: [],
  rejected: [],
};

const priorityLabels = { low: 'Низкий', medium: 'Средний', high: 'Высокий', critical: 'Критический' };
const eventLabels: Record<string, string> = {
  submitted: 'Обращение создано',
  detected: 'Дефект обнаружен',
  report_confirmed: 'Обращение подтверждено другим жителем',
  analysis_completed: 'Анализ завершён',
  assigned: 'Назначена дорожная служба',
  status_changed: 'Статус изменён',
  verification_requested: 'Запущена проверка ремонта',
};

function invalidateDefectData(queryClient: ReturnType<typeof useQueryClient>, id: number) {
  for (const queryKey of [['defect', id], ['defect-events', id], ['defects'], ['map-defects'], ['my-defects'], ['dashboard-summary'], ['analytics-trends']] as const) {
    queryClient.invalidateQueries({ queryKey: [...queryKey] });
  }
}

export function DefectEditDialog({ defect, onOpenChange, onSave }: DefectEditDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const defectId = defect?.id ?? 0;
  const detailQuery = useQuery({ queryKey: ['defect', defectId], queryFn: () => getDefect(defectId), enabled: defectId > 0 });
  const eventsQuery = useQuery({ queryKey: ['defect-events', defectId], queryFn: () => getDefectEvents(defectId), enabled: defectId > 0 });
  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: async () => (await apiClient.get<AuthUser[]>('/users/')).data,
    enabled: defectId > 0 && user?.role === 'admin',
  });

  const current = detailQuery.data ?? defect;
  const [status, setStatus] = useState<DefectStatus>('submitted');
  const [severity, setSeverity] = useState<DefectSeverity | null>(null);
  const [detected, setDetected] = useState(true);
  const [analysisType, setAnalysisType] = useState<DefectType>('pothole');
  const [analysisSeverity, setAnalysisSeverity] = useState<DefectSeverity>('medium');
  const [confidence, setConfidence] = useState(80);
  const [assigneeId, setAssigneeId] = useState('');
  const [afterImage, setAfterImage] = useState<File | null>(null);

  useEffect(() => {
    if (current) {
      setStatus(current.status);
      setSeverity(current.severity);
      setAnalysisType(current.type ?? 'pothole');
      setAnalysisSeverity(current.severity ?? 'medium');
      setConfidence(Math.round((current.confidence ?? 0.8) * 100));
      setAssigneeId(current.assigned_to_id ? String(current.assigned_to_id) : '');
    }
  }, [current]);

  const roadUsers = useMemo(
    () => usersQuery.data?.filter((item) => item.role === 'road_service' && item.is_active) ?? [],
    [usersQuery.data]
  );

  const updateMutation = useUpdateDefect();
  const analysisMutation = useMutation({
    mutationFn: (payload: AnalysisPayload) => analyzeDefect(defectId, payload),
    onSuccess: () => invalidateDefectData(queryClient, defectId),
  });
  const assignmentMutation = useMutation({
    mutationFn: (roadServiceUserId: number) => assignDefect(defectId, roadServiceUserId),
    onSuccess: () => invalidateDefectData(queryClient, defectId),
  });
  const afterImageMutation = useMutation({
    mutationFn: (image: File) => uploadAfterImage(defectId, image),
    onSuccess: () => {
      setAfterImage(null);
      invalidateDefectData(queryClient, defectId);
    },
  });

  if (!current) return null;

  const availableStatuses = [status, ...statusTransitions[status].filter((value) => value !== 'verified' || user?.role === 'admin')];
  const canSelfAssign = user?.role === 'road_service' && current.assigned_to_id !== user.id;
  const canUploadAfterImage = current.status === 'in_progress' && (user?.role === 'admin' || current.assigned_to_id === user?.id);
  const hasMutationError = updateMutation.isError || analysisMutation.isError || assignmentMutation.isError || afterImageMutation.isError;

  const handleSave = () => {
    const data = user?.role === 'admin' && severity ? { status, severity } : { status };
    updateMutation.mutate(
      { id: current.id, data },
      {
        onSuccess: () => {
          invalidateDefectData(queryClient, current.id);
          onSave();
        },
      }
    );
  };

  const handleAnalysis = () =>
    analysisMutation.mutate({
      detected,
      defect_type: detected ? analysisType : null,
      confidence: Math.max(0, Math.min(100, confidence)) / 100,
      severity: detected ? analysisSeverity : null,
    });

  const typeName = current.type ? defectTypeLabels[current.type] : 'Дефект дороги';
  const confidencePercent = current.confidence === null ? '—' : `${Math.round(current.confidence * 100)}%`;

  return (
    <Dialog open={defect !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[16px] font-semibold text-foreground">
            {typeName} · #{current.id}
          </DialogTitle>
          <DialogDescription className="text-[12.5px] text-muted-foreground">
            {current.address ?? 'Адрес не указан'} · зафиксировано{' '}
            {current.created_at ? new Date(current.created_at).toLocaleString('ru-RU') : 'недавно'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {hasMutationError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-[12.5px] text-destructive font-medium" role="alert">
              Операция не выполнена. Проверьте текущий статус и права доступа, затем повторите.
            </div>
          )}

          {/* 2x2 Info Grid matching UX */}
          <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 pt-1">
            <div className="rounded-lg border border-border bg-surface/50 px-3 py-2.5">
              <dt className="text-eyebrow">Критичность</dt>
              <dd className="mt-0.5 text-[13px] font-semibold text-foreground">
                {current.severity ? (severityLabel[current.severity as Severity] ?? current.severity) : 'Ожидает'}
              </dd>
            </div>
            <div className="rounded-lg border border-border bg-surface/50 px-3 py-2.5">
              <dt className="text-eyebrow">Статус</dt>
              <dd className="mt-0.5 text-[13px] font-semibold text-foreground">
                {statusLabel[current.status] ?? current.status}
              </dd>
            </div>
            <div className="rounded-lg border border-border bg-surface/50 px-3 py-2.5">
              <dt className="text-eyebrow">Приоритет</dt>
              <dd className="mt-0.5 text-[13px] font-semibold text-foreground capitalize">
                {priorityLabels[current.priority] ?? current.priority}
              </dd>
            </div>
            <div className="rounded-lg border border-border bg-surface/50 px-3 py-2.5">
              <dt className="text-eyebrow">Уверенность ИИ</dt>
              <dd className="num mt-0.5 text-[13px] font-semibold text-foreground">
                {confidencePercent}
              </dd>
            </div>
          </dl>

          {/* Images Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-2">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Изображение дефекта</span>
              <div className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-surface/50">
                <img 
                  src={`${getApiBaseUrl()}${current.image_url}`} 
                  alt="Изображение дефекта" 
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=600&auto=format&fit=crop';
                  }}
                />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Отчет о ремонте</span>
              <div className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-surface/50 flex items-center justify-center">
                {current.after_image_url ? (
                  <img 
                    src={`${getApiBaseUrl()}${current.after_image_url}`} 
                    alt="Отчет о ремонте" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <Wrench className="size-7 text-muted-foreground/60 mx-auto mb-1 animate-bounce" />
                    <span className="text-[11.5px] text-muted-foreground block">Отчет о ремонте еще не загружен</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick status change buttons */}
          <div className="rounded-xl border border-border bg-surface/30 p-4 space-y-2.5">
            <div className="text-eyebrow">Изменить статус</div>
            <div className="flex flex-wrap gap-2">
              {availableStatuses.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-[12.5px] font-medium transition-colors",
                    status === s
                      ? "border-primary/45 bg-primary/10 text-primary"
                      : "border-border bg-surface/40 text-muted-foreground hover:border-border-strong hover:text-foreground"
                  )}
                >
                  {statusLabel[s] ?? s}
                </button>
              ))}
            </div>

            {user?.role === 'admin' && (
              <div className="pt-2">
                <label className="text-[12px] font-medium text-foreground block mb-1.5" htmlFor="defect-severity">
                  Критичность (для администратора)
                </label>
                <Select value={severity ?? undefined} onValueChange={(value) => setSeverity(value as DefectSeverity)}>
                  <SelectTrigger id="defect-severity" className="h-9 rounded-lg border-border bg-surface/60 text-[12.5px]">
                    <SelectValue placeholder="Выберите критичность" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(defectSeverityLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value} className="text-[13px]">{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Admin manual analysis */}
          {user?.role === 'admin' && current.status === 'submitted' && (
            <section className="rounded-xl border border-border bg-surface/30 p-4 space-y-3" aria-labelledby="analysis-title">
              <h3 id="analysis-title" className="text-[13px] font-semibold text-foreground">Ручной AI-анализ</h3>
              <label className="flex items-center gap-2 text-[12.5px] text-foreground cursor-pointer">
                <input type="checkbox" checked={detected} onChange={(event) => setDetected(event.target.checked)} className="accent-primary" />
                Дефект подтверждён
              </label>
              {detected && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 text-[12px] text-muted-foreground">
                    Тип дефекта
                    <select value={analysisType} onChange={(event) => setAnalysisType(event.target.value as DefectType)} className="h-9 rounded-lg border border-border bg-surface/60 px-3 text-[12.5px] text-foreground">
                      {Object.entries(defectTypeLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1 text-[12px] text-muted-foreground">
                    Критичность
                    <select value={analysisSeverity} onChange={(event) => setAnalysisSeverity(event.target.value as DefectSeverity)} className="h-9 rounded-lg border border-border bg-surface/60 px-3 text-[12.5px] text-foreground">
                      {Object.entries(defectSeverityLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </label>
                </div>
              )}
              <Button type="button" onClick={handleAnalysis} disabled={analysisMutation.isPending} className="bg-primary text-primary-foreground font-semibold shadow-glow hover:opacity-90 h-9 text-[12.5px]">
                {analysisMutation.isPending && <Loader2 className="animate-spin mr-1.5 size-3.5" />}
                Сохранить анализ
              </Button>
            </section>
          )}

          {/* Road service assignment */}
          {(current.status === 'detected' || current.status === 'in_progress') && (
            <section className="rounded-xl border border-border bg-surface/30 p-4 space-y-2.5" aria-labelledby="assignment-title">
              <h3 id="assignment-title" className="text-[13px] font-semibold text-foreground">Исполнитель ремонта</h3>
              {user?.role === 'admin' ? (
                <div className="flex flex-col sm:flex-row gap-2">
                  <select value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)} className="h-9 rounded-lg border border-border bg-surface/60 px-3 text-[12.5px] text-foreground flex-1" aria-label="Дорожная служба">
                    <option value="">Выберите сотрудника</option>
                    {roadUsers.map((roadUser) => (
                      <option key={roadUser.id} value={roadUser.id}>{roadUser.email}</option>
                    ))}
                  </select>
                  <Button type="button" variant="outline" className="h-9 border-border bg-surface hover:bg-surface-2 text-[12.5px]" disabled={!assigneeId || assignmentMutation.isPending} onClick={() => assignmentMutation.mutate(Number(assigneeId))}>
                    Назначить
                  </Button>
                </div>
              ) : canSelfAssign ? (
                <Button type="button" variant="outline" className="h-9 border-border bg-surface hover:bg-surface-2 text-[12.5px]" disabled={assignmentMutation.isPending} onClick={() => assignmentMutation.mutate(user.id)}>
                  Назначить себе
                </Button>
              ) : (
                <p className="text-[12px] text-muted-foreground">Дефект назначен вам.</p>
              )}
            </section>
          )}

          {/* Upload after image */}
          {canUploadAfterImage && (
            <section className="rounded-xl border border-border bg-surface/30 p-4 space-y-2.5" aria-labelledby="repair-title">
              <h3 id="repair-title" className="text-[13px] font-semibold text-foreground">Завершение ремонта</h3>
              <p className="text-[12px] text-muted-foreground">Загрузите фотографию после ремонта. Статус изменится на «Исправлено», затем запустится проверка результата.</p>
              <input type="file" accept="image/*" onChange={(event) => setAfterImage(event.target.files?.[0] ?? null)} className="text-[12px]" aria-label="Фото после ремонта" />
              <Button type="button" disabled={!afterImage || afterImageMutation.isPending} onClick={() => afterImage && afterImageMutation.mutate(afterImage)} className="bg-primary text-primary-foreground font-semibold shadow-glow hover:opacity-90 h-9 text-[12.5px]">
                <Upload className="size-3.5 mr-1.5" />
                Загрузить и проверить
              </Button>
            </section>
          )}

          {/* History */}
          <section className="rounded-xl border border-border bg-surface/30 p-4 space-y-2.5" aria-labelledby="history-title">
            <h3 id="history-title" className="text-[13px] font-semibold text-foreground">История изменений</h3>
            {eventsQuery.isLoading ? (
              <p className="text-[12px] text-muted-foreground">Загрузка истории…</p>
            ) : eventsQuery.isError ? (
              <p className="text-[12px] text-destructive">История временно недоступна.</p>
            ) : eventsQuery.data?.length ? (
              <ol className="space-y-2.5 border-l-2 border-primary/40 pl-3">
                {eventsQuery.data.map((event) => (
                  <li key={event.id} className="text-[12px]">
                    <p className="font-medium text-foreground">{eventLabels[event.event_type] ?? event.event_type}</p>
                    <p className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                      <Clock3 className="size-3" />
                      {new Date(event.created_at).toLocaleString('ru-RU')}
                      {event.actor_id ? ` · пользователь #${event.actor_id}` : ''}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-[12px] text-muted-foreground">Событий пока нет.</p>
            )}
          </section>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline" className="border-border bg-surface/50 text-foreground hover:bg-surface text-[12.5px]">Закрыть</Button>
          </DialogClose>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending || (status === current.status && severity === current.severity)}
            className="bg-primary text-primary-foreground hover:opacity-90 font-semibold shadow-glow text-[12.5px]"
          >
            {updateMutation.isPending && <Loader2 className="animate-spin mr-1.5 size-3.5" />}
            Сохранить статус
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
