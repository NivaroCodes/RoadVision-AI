import { useQuery } from '@tanstack/react-query';
import { Clock3, MapPin, RefreshCcw } from 'lucide-react';
import { apiClient } from '@/api/client';
import type { DefectMarker } from '@/features/map/types';

const labels = {
  detected: 'Обнаружен',
  in_progress: 'В работе',
  fixed: 'Исправлен',
  rejected: 'Отклонён',
};

export default function MyDefectsPage() {
  const query = useQuery({
    queryKey: ['my-defects'],
    queryFn: async () => (await apiClient.get<DefectMarker[]>('/defects/mine')).data,
  });

  return <div className="mx-auto max-w-5xl space-y-6">
    <div><h1 className="text-3xl font-bold">Мои обращения</h1><p className="mt-2 text-muted-foreground">Следите за состоянием отправленных вами дорожных дефектов.</p></div>
    {query.isLoading && <div className="rounded-xl border bg-card p-8 text-muted-foreground">Загрузка обращений…</div>}
    {query.isError && <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-6"><p>Не удалось загрузить обращения.</p><button onClick={() => query.refetch()} className="mt-4 inline-flex items-center gap-2 rounded-lg border px-4 py-2"><RefreshCcw className="h-4 w-4" />Повторить</button></div>}
    {query.data?.length === 0 && <div className="rounded-xl border border-dashed bg-card p-10 text-center text-muted-foreground">У вас пока нет отправленных обращений.</div>}
    <div className="grid gap-4 sm:grid-cols-2">
      {query.data?.map((defect) => <article key={defect.id} className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs text-muted-foreground">Обращение</p><h2 className="text-xl font-bold">#{defect.id}</h2></div><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold">{labels[defect.status]}</span></div>
        <div className="mt-5 space-y-3 text-sm text-muted-foreground"><p className="flex gap-2"><MapPin className="h-4 w-4 shrink-0" />{defect.address || `${defect.latitude.toFixed(5)}, ${defect.longitude.toFixed(5)}`}</p>{defect.created_at && <p className="flex gap-2"><Clock3 className="h-4 w-4" />{new Date(defect.created_at).toLocaleString('ru-RU')}</p>}</div>
      </article>)}
    </div>
  </div>;
}
