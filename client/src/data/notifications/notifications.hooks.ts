import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/data/notifications/notifications.api';
import { useAuthToken } from '@/hooks/useAuthToken';

export const notificationsQueryKeys = {
  list: ['notifications', 'list'] as const,
};

export const useNotifications = () => {
  const { getToken } = useAuthToken();
  return useQuery({
    queryKey: notificationsQueryKeys.list,
    queryFn: getNotifications,
    enabled: Boolean(getToken()),
  });
};

const useInvalidateNotifications = () => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.list });
};

export const useMarkNotificationRead = () => {
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: (id: number) => markNotificationRead(id),
    onSuccess: invalidate,
  });
};

export const useMarkAllNotificationsRead = () => {
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: invalidate,
  });
};
