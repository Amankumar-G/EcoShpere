import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { EsgConfigService } from '../esg-config/esg-config.service';
import { NotificationsService } from '../notifications/notifications.service';
import { BadgesService } from './badges.service';

describe('BadgesService.evaluateForEmployee', () => {
  let service: BadgesService;
  let prisma: {
    employee: { findUnique: ReturnType<typeof vi.fn> };
    challengeParticipation: { count: ReturnType<typeof vi.fn> };
    employeeParticipation: { count: ReturnType<typeof vi.fn> };
    employeeBadge: {
      findMany: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
    };
    badge: { findMany: ReturnType<typeof vi.fn> };
  };
  let esgConfig: { get: ReturnType<typeof vi.fn> };
  let notifications: { create: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    prisma = {
      employee: { findUnique: vi.fn() },
      challengeParticipation: { count: vi.fn() },
      employeeParticipation: { count: vi.fn() },
      employeeBadge: { findMany: vi.fn(), create: vi.fn() },
      badge: { findMany: vi.fn() },
    };
    esgConfig = { get: vi.fn() };
    notifications = { create: vi.fn() };

    const module = await Test.createTestingModule({
      providers: [
        BadgesService,
        { provide: PrismaService, useValue: prisma },
        { provide: EsgConfigService, useValue: esgConfig },
        { provide: NotificationsService, useValue: notifications },
      ],
    }).compile();
    service = module.get(BadgesService);

    prisma.employee.findUnique.mockResolvedValue({ id: 5, xp: 150, points: 0 });
    prisma.challengeParticipation.count.mockResolvedValue(0);
    prisma.employeeParticipation.count.mockResolvedValue(0);
    prisma.employeeBadge.findMany.mockResolvedValue([]);
    prisma.badge.findMany.mockResolvedValue([
      { id: 1, name: 'Century', unlockRule: { type: 'xp', threshold: 100 } },
      { id: 2, name: 'Legend', unlockRule: { type: 'xp', threshold: 999 } },
    ]);
  });

  it('auto-awards satisfied badges and notifies when auto-award is on', async () => {
    esgConfig.get.mockResolvedValue(true);
    await service.evaluateForEmployee(5);

    expect(prisma.employeeBadge.create).toHaveBeenCalledTimes(1);
    expect(prisma.employeeBadge.create).toHaveBeenCalledWith({
      data: { employeeId: 5, badgeId: 1, status: 'awarded' },
    });
    expect(notifications.create).toHaveBeenCalledWith(
      expect.objectContaining({ employeeId: 5, type: 'badge_unlock' }),
    );
  });

  it('queues satisfied badges as pending and does not notify when auto-award is off', async () => {
    esgConfig.get.mockResolvedValue(false);
    await service.evaluateForEmployee(5);

    expect(prisma.employeeBadge.create).toHaveBeenCalledWith({
      data: { employeeId: 5, badgeId: 1, status: 'pending' },
    });
    expect(notifications.create).not.toHaveBeenCalled();
  });
});
