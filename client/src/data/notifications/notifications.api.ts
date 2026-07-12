import { apiClient } from '@/lib/axios/api-client';
import { NotificationListResponse } from '@/types/notification.interface';

export const getNotifications = async (): Promise<NotificationListResponse> => {
  const { data } =
    await apiClient.get<NotificationListResponse>('/notifications');
  return data;
};

export const markNotificationRead = async (id: number): Promise<void> => {
  await apiClient.patch(`/notifications/${id}/read`);
};

export const markAllNotificationsRead = async (): Promise<void> => {
  await apiClient.patch('/notifications/read-all');
};
