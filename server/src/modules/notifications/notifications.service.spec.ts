import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../auth/interfaces/jwt-payload.interface';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: {
    notification: {
      findMany: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
      updateMany: ReturnType<typeof vi.fn>;
      findUniqueOrThrow: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
    };
  };

  const actor: AuthUser = {
    id: 1,
    email: 'actor@example.com',
    name: 'Actor',
    role: 'employee' as AuthUser['role'],
    departmentId: null,
  };

  beforeEach(async () => {
    prisma = {
      notification: {
        findMany: vi.fn(),
        count: vi.fn(),
        updateMany: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        create: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  describe('list', () => {
    it('scopes notifications to the actor and surfaces unreadCount', async () => {
      const items = [{ id: 1, employeeId: 1, isRead: false }];
      prisma.notification.findMany.mockResolvedValue(items);
      prisma.notification.count.mockResolvedValue(1);

      const result = await service.list(actor);

      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { employeeId: actor.id },
        orderBy: { createdAt: 'desc' },
      });
      expect(prisma.notification.count).toHaveBeenCalledWith({
        where: { employeeId: actor.id, isRead: false },
      });
      expect(result).toEqual({ items, unreadCount: 1 });
    });
  });

  describe('markRead', () => {
    it('marks the actor own notification as read', async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 1 });
      const updated = { id: 5, employeeId: 1, isRead: true };
      prisma.notification.findUniqueOrThrow.mockResolvedValue(updated);

      const result = await service.markRead(actor, 5);

      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { id: 5, employeeId: actor.id },
        data: { isRead: true },
      });
      expect(result).toEqual(updated);
    });

    it('throws ForbiddenException when the notification belongs to another employee', async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.markRead(actor, 999)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(prisma.notification.findUniqueOrThrow).not.toHaveBeenCalled();
    });
  });

  describe('markAllRead', () => {
    it('marks only the actor own unread notifications as read', async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.markAllRead(actor);

      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { employeeId: actor.id, isRead: false },
        data: { isRead: true },
      });
      expect(result).toEqual({ updated: 3 });
    });

    it('does not touch another employee notifications', async () => {
      const otherActor: AuthUser = { ...actor, id: 2 };
      prisma.notification.updateMany.mockResolvedValue({ count: 0 });

      await service.markAllRead(otherActor);

      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { employeeId: otherActor.id, isRead: false },
        data: { isRead: true },
      });
    });
  });
});
