import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { EsgConfigService } from '../esg-config/esg-config.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CsrActivitiesService } from './csr-activities.service';

function participationRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 10,
    employeeId: 5,
    csrActivityId: 3,
    proofUrl: 'https://files/proof.pdf',
    approvalStatus: 'pending',
    pointsEarned: 0,
    completionDate: null,
    csrActivity: { id: 3, title: 'Beach cleanup', points: 25 },
    employee: { id: 5, name: 'Ada' },
    ...overrides,
  };
}

describe('CsrActivitiesService', () => {
  let service: CsrActivitiesService;
  let prisma: {
    employeeParticipation: {
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    employee: { update: ReturnType<typeof vi.fn> };
    $transaction: ReturnType<typeof vi.fn>;
  };
  let esgConfig: { get: ReturnType<typeof vi.fn> };
  let notifications: { create: ReturnType<typeof vi.fn> };
  let eventEmitter: { emit: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    prisma = {
      employeeParticipation: { findUnique: vi.fn(), update: vi.fn() },
      employee: { update: vi.fn() },
      $transaction: vi.fn(),
    };
    esgConfig = { get: vi.fn() };
    notifications = { create: vi.fn() };
    eventEmitter = { emit: vi.fn() };

    const module = await Test.createTestingModule({
      providers: [
        CsrActivitiesService,
        { provide: PrismaService, useValue: prisma },
        { provide: EsgConfigService, useValue: esgConfig },
        { provide: NotificationsService, useValue: notifications },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();
    service = module.get(CsrActivitiesService);
  });

  it('blocks approval when evidence is required and no proof exists', async () => {
    prisma.employeeParticipation.findUnique.mockResolvedValue(
      participationRow({ proofUrl: null }),
    );
    esgConfig.get.mockResolvedValue(true);

    await expect(service.approve(10)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('awards points, emits event and notifies on approval', async () => {
    prisma.employeeParticipation.findUnique.mockResolvedValue(
      participationRow(),
    );
    esgConfig.get.mockResolvedValue(true);
    const txEmployeeUpdate = vi.fn();
    prisma.$transaction.mockImplementation(
      (cb: (tx: unknown) => unknown): unknown =>
        cb({
          employeeParticipation: {
            update: vi.fn().mockResolvedValue(
              participationRow({
                approvalStatus: 'approved',
                pointsEarned: 25,
              }),
            ),
          },
          employee: { update: txEmployeeUpdate },
        }),
    );

    const result = await service.approve(10);

    expect(txEmployeeUpdate).toHaveBeenCalledWith({
      where: { id: 5 },
      data: { points: { increment: 25 } },
    });
    expect(eventEmitter.emit).toHaveBeenCalledWith('employee.points_changed', {
      employeeId: 5,
    });
    expect(notifications.create).toHaveBeenCalledWith(
      expect.objectContaining({ employeeId: 5, type: 'approval_decision' }),
    );
    expect(result.pointsEarned).toBe(25);
  });

  it('allows approval when evidence is not required even without proof', async () => {
    prisma.employeeParticipation.findUnique.mockResolvedValue(
      participationRow({ proofUrl: null }),
    );
    esgConfig.get.mockResolvedValue(false);
    prisma.$transaction.mockImplementation(
      (cb: (tx: unknown) => unknown): unknown =>
        cb({
          employeeParticipation: {
            update: vi.fn().mockResolvedValue(
              participationRow({
                approvalStatus: 'approved',
                pointsEarned: 25,
              }),
            ),
          },
          employee: { update: vi.fn() },
        }),
    );

    await expect(service.approve(10)).resolves.toBeDefined();
  });

  it('rejects re-approving an already approved participation', async () => {
    prisma.employeeParticipation.findUnique.mockResolvedValue(
      participationRow({ approvalStatus: 'approved' }),
    );
    await expect(service.approve(10)).rejects.toBeInstanceOf(ConflictException);
  });
});
