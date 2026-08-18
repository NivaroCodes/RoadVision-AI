import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/api/client';
import type { AuthUser, UserRole } from '@/features/auth/types';
import { useAuth } from '@/features/auth/useAuth';
import { PanelHeader } from '@/components/layout/PanelHeader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Администратор' },
  { value: 'road_service', label: 'Дорожная служба' },
  { value: 'resident', label: 'Житель' },
];

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: async () => (await apiClient.get<AuthUser[]>('/users/')).data,
  });

  const update = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { role?: UserRole; is_active?: boolean } }) =>
      (await apiClient.patch<AuthUser>(`/users/${id}`, data)).data,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      if (variables.data.role) {
        const roleLabel = roleOptions.find((r) => r.value === variables.data.role)?.label ?? variables.data.role;
        toast.success(`Роль обновлена: ${roleLabel}`);
      } else if (variables.data.is_active !== undefined) {
        toast.success(variables.data.is_active ? 'Пользователь активирован' : 'Пользователь отключён');
      }
    },
    onError: () => {
      toast.error('Не удалось сохранить изменение.');
    },
  });

  const users = usersQuery.data ?? [];

  return (
    <div className="space-y-4 md:space-y-5">
      <section className="panel overflow-hidden">
        <PanelHeader
          title="Список пользователей"
          meta={`${users.length} пользователей в системе`}
        />

        <div className="hidden grid-cols-[minmax(0,2fr)_200px_120px] gap-4 border-b border-border px-5 py-2.5 text-eyebrow md:grid">
          <span>Пользователь</span>
          <span>Роль</span>
          <span className="text-right">Статус</span>
        </div>

        {usersQuery.isLoading ? (
          <div className="p-5 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-2">
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-9 w-44 rounded-lg" />
                <Skeleton className="h-6 w-20 rounded-md" />
              </div>
            ))}
          </div>
        ) : usersQuery.isError ? (
          <div className="p-8 text-center text-[12.5px] text-destructive">
            Не удалось загрузить пользователей.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {users.map((u) => {
              const isSelf = u.id === currentUser?.id;
              return (
                <li
                  key={u.id}
                  className="grid grid-cols-1 items-center gap-3 px-5 py-4 md:grid-cols-[minmax(0,2fr)_200px_120px] md:gap-4 transition-colors hover:bg-accent/40"
                >
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-medium text-foreground">
                      {u.email}
                      {isSelf && <span className="ml-2 text-[11px] text-primary">(Вы)</span>}
                    </div>
                    <div className="num mt-0.5 text-[11px] text-muted-foreground">ID {u.id}</div>
                  </div>

                  <Select
                    value={u.role}
                    disabled={update.isPending || isSelf}
                    onValueChange={(v) => {
                      update.mutate({ id: u.id, data: { role: v as UserRole } });
                    }}
                  >
                    <SelectTrigger className="h-9 rounded-lg border-border bg-surface/60 text-[12.5px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((r) => (
                        <SelectItem key={r.value} value={r.value} className="text-[13px]">
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="md:text-right">
                    <button
                      type="button"
                      disabled={update.isPending || isSelf}
                      onClick={() => update.mutate({ id: u.id, data: { is_active: !u.is_active } })}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold transition-opacity hover:opacity-80 disabled:opacity-50",
                        u.is_active
                          ? "bg-primary/12 text-primary"
                          : "bg-destructive/12 text-destructive"
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          u.is_active ? "bg-primary" : "bg-destructive"
                        )}
                      />
                      {u.is_active ? "Активен" : "Отключён"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
