import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import type { AuthUser, UserRole } from '@/features/auth/types';

const roleNames: Record<UserRole, string> = { admin: 'Администратор', road_service: 'Дорожная служба', resident: 'Житель' };

export default function UsersPage() {
  const queryClient = useQueryClient();
  const users = useQuery({ queryKey: ['users'], queryFn: async () => (await apiClient.get<AuthUser[]>('/users/')).data });
  const update = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { role?: UserRole; is_active?: boolean } }) => (await apiClient.patch<AuthUser>(`/users/${id}`, data)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  return <div className="mx-auto max-w-6xl space-y-6"><div><h1 className="text-3xl font-bold">Пользователи</h1><p className="mt-2 text-muted-foreground">Управление ролями и доступом к системе.</p></div>
    {users.isLoading && <div className="rounded-xl border bg-card p-8">Загрузка…</div>}
    {users.isError && <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-6">Не удалось загрузить пользователей.</div>}
    {update.isError && <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-4">Не удалось сохранить изменение.</div>}
    <div className="overflow-x-auto rounded-xl border bg-card"><table className="w-full min-w-[700px] text-left text-sm"><thead className="border-b bg-muted/40"><tr><th className="p-4">Пользователь</th><th className="p-4">Роль</th><th className="p-4">Статус</th></tr></thead><tbody>{users.data?.map((user) => <tr key={user.id} className="border-b last:border-0"><td className="p-4"><p className="font-medium">{user.email}</p><p className="text-xs text-muted-foreground">ID {user.id}</p></td><td className="p-4"><select aria-label={`Роль ${user.email}`} value={user.role} disabled={update.isPending} onChange={(event) => update.mutate({ id: user.id, data: { role: event.target.value as UserRole } })} className="h-10 rounded-lg border bg-background px-3">{Object.entries(roleNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td><td className="p-4"><button disabled={update.isPending} onClick={() => update.mutate({ id: user.id, data: { is_active: !user.is_active } })} className={`rounded-full px-3 py-1 text-xs font-semibold ${user.is_active ? 'bg-green-500/15 text-green-500' : 'bg-destructive/15 text-destructive'}`}>{user.is_active ? 'Активен' : 'Отключён'}</button></td></tr>)}</tbody></table></div>
  </div>;
}
