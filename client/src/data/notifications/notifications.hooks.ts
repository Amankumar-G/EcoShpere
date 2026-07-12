import { useQuery } from '@tanstack/react-query';
import { getNotifications } from '@/data/notifications/notifications.api';
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
