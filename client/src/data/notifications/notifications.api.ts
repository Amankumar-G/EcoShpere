import { apiClient } from '@/lib/axios/api-client';
import { NotificationListResponse } from '@/types/notification.interface';

export const getNotifications = async (): Promise<NotificationListResponse> => {
  const { data } =
    await apiClient.get<NotificationListResponse>('/notifications');
  return data;
};
