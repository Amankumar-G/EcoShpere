export interface NotificationItem {
  id: number;
  type: string;
  payload: unknown;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  unreadCount: number;
}
