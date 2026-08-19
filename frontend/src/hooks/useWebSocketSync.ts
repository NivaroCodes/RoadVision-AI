import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/api/client';
import { useAuth } from '@/features/auth/useAuth';
import { defectTypeLabels } from '@/features/defects/labels';
import { statusLabel } from '@/lib/roadvision-data';

const getWebSocketUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  
  if (host.includes(':5173')) {
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:8000/api/v1/ws/events`;
  }
  
  return `${protocol}//${host}/api/v1/ws/events`;
};

export function useWebSocketSync() {
  const queryClient = useQueryClient();
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    function connect() {
      const url = getWebSocketUrl();
      
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current);
          reconnectTimeout.current = null;
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'DEFECT_CREATED' || data.event === 'DEFECT_UPDATED') {
            queryClient.invalidateQueries({ queryKey: ['defects'] });
            queryClient.invalidateQueries({ queryKey: ['map-defects'] });
            queryClient.invalidateQueries({ queryKey: ['my-defects'] });
            
            if (data.id) {
              queryClient.invalidateQueries({ queryKey: ['defect', data.id] });
              queryClient.invalidateQueries({ queryKey: ['defect-events', data.id] });
            }
            
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
            queryClient.invalidateQueries({ queryKey: ['analytics-trends'] });

            // Display toast notifications and dropdown updates
            if (data.id) {
              let shouldFetch = true;
              if (user?.role === 'resident') {
                const myDefects = queryClient.getQueryData<any[]>(['my-defects']);
                shouldFetch = myDefects?.some((d: any) => d.id === data.id) ?? false;
              }

              if (shouldFetch) {
                apiClient.get(`/defects/${data.id}`).then((response) => {
                  const defect = response.data;
                let title = '';
                let body = '';
                let severity = 'low';
                let isRelevant = false;

                if (user?.role === 'admin') {
                  isRelevant = true;
                  if (data.event === 'DEFECT_CREATED') {
                    title = `Поступило новое обращение #${defect.id}`;
                    body = `${defect.type ? defectTypeLabels[defect.type as keyof typeof defectTypeLabels] : 'Дефект'} · ${defect.address || 'Адрес не определен'}`;
                    severity = defect.severity || 'low';
                  } else {
                    title = `Обновлен статус дефекта #${defect.id}`;
                    body = `Новый статус: ${statusLabel[defect.status] ?? defect.status}`;
                    severity = defect.severity || 'low';
                  }
                } else if (user?.role === 'road_service') {
                  if (defect.assigned_to_id === user.id) {
                    isRelevant = true;
                    if (defect.status === 'detected' || defect.status === 'in_progress') {
                      title = `Вам назначена новая задача #${defect.id}!`;
                      body = `Устранить: ${defect.type ? defectTypeLabels[defect.type as keyof typeof defectTypeLabels] : 'Дефект'} · ${defect.address || 'Адрес не определен'}`;
                      severity = defect.severity || 'medium';
                    } else {
                      title = `Статус вашей задачи #${defect.id} обновлен`;
                      body = `Новый статус: ${statusLabel[defect.status] ?? defect.status}`;
                      severity = 'low';
                    }
                  }
                } else if (user?.role === 'resident' && defect.creator_id === user.id) {
                  isRelevant = true;
                  if (data.event === 'DEFECT_CREATED') {
                    title = `Ваше обращение #${defect.id} зарегистрировано`;
                    body = `ИИ Qala Vision анализирует снимок…`;
                    severity = 'low';
                  } else {
                    title = `Изменение по обращению #${defect.id}`;
                    body = `Статус вашего обращения изменен на «${statusLabel[defect.status] ?? defect.status}»`;
                    severity = 'low';
                  }
                }

                if (isRelevant) {
                  // 1. Show dynamic Toast notification
                  if (data.event === 'DEFECT_CREATED') {
                    toast.success(title, { description: body, duration: 6000 });
                  } else {
                    toast.info(title, { description: body, duration: 6000 });
                  }

                  // 2. Add to localStorage for Header notifications bell
                  const saved = localStorage.getItem('roadvision_notifications');
                  const list = saved ? JSON.parse(saved) : [];
                  const newNotify = {
                    id: `notify_${Date.now()}_${data.id}`,
                    title,
                    body,
                    ago: 'Только что',
                    severity,
                    unread: true,
                  };
                  list.unshift(newNotify);
                  localStorage.setItem('roadvision_notifications', JSON.stringify(list.slice(0, 30)));

                  // 3. Dispatch global event to notify Header
                  window.dispatchEvent(new Event('roadvision_notifications_updated'));
                }
              }).catch(() => {});
            }
          }
        }
      } catch {}
    };

      ws.current.onclose = () => {
        reconnectTimeout.current = window.setTimeout(connect, 3000);
      };
      
      ws.current.onerror = () => {
        ws.current?.close();
      };
    }

    connect();

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        const socket = ws.current;
        socket.onclose = null;
        if (socket.readyState === 0) { // CONNECTING
          socket.onopen = () => socket.close();
        } else {
          socket.close();
        }
      }
    };
  }, [queryClient, user]);
}
