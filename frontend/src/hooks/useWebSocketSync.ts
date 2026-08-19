import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

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

            // Display toast notifications
            if (data.id) {
              if (data.event === 'DEFECT_CREATED') {
                toast.success(`Новое обращение #${data.id} добавлено на карту!`);
              } else if (data.event === 'DEFECT_UPDATED') {
                toast.info(`Статус обращения #${data.id} обновлен`, {
                  description: 'Посмотрите обновленные этапы обработки в разделе «Мои обращения»',
                });
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
  }, [queryClient]);
}
