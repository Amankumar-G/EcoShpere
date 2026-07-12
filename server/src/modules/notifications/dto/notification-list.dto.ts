import { Prisma } from '@prisma/client';

export class NotificationListItemDto {
  id: number;
  type: string;
  payload: Prisma.JsonValue;
  isRead: boolean;
  createdAt: Date;
}

export class NotificationListResponseDto {
  items: NotificationListItemDto[];
  unreadCount: number;
}
