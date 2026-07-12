import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthUser } from '../auth/interfaces/jwt-payload.interface';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationListResponseDto } from './dto/notification-list.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        employeeId: dto.employeeId,
        type: dto.type,
        channel: dto.channel ?? 'in_app',
        payload: dto.payload as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async list(actor: AuthUser): Promise<NotificationListResponseDto> {
    const [items, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { employeeId: actor.id },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({
        where: { employeeId: actor.id, isRead: false },
      }),
    ]);

    return { items, unreadCount };
  }

  async markRead(actor: AuthUser, notificationId: number) {
    const { count } = await this.prisma.notification.updateMany({
      where: { id: notificationId, employeeId: actor.id },
      data: { isRead: true },
    });

    if (count === 0) {
      throw new ForbiddenException(
        "You cannot mark another employee's notification as read",
      );
    }

    return this.prisma.notification.findUniqueOrThrow({
      where: { id: notificationId },
    });
  }

  async markAllRead(actor: AuthUser): Promise<{ updated: number }> {
    const { count } = await this.prisma.notification.updateMany({
      where: { employeeId: actor.id, isRead: false },
      data: { isRead: true },
    });

    return { updated: count };
  }
}
