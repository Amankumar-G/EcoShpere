import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { EsgConfigService } from '../esg-config/esg-config.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ChallengesService } from './challenges.service';

function participationRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 20,
    challengeId: 7,
    employeeId: 5,
    progress: '40',
    proofUrl: 'https://files/proof.png',
    approvalStatus: 'pending',
    xpAwarded: 0,
    challenge: { id: 7, title: 'Bike to work', xp: 50, evidenceRequired: true },
    employee: { id: 5, name: 'Ada' },
    ...overrides,
  };
}

describe('ChallengesService', () => {
  let service: ChallengesService;
  let prisma: {
    challengeParticipation: {
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
      challengeParticipation: { findUnique: vi.fn(), update: vi.fn() },
      employee: { update: vi.fn() },
      $transaction: vi.fn(),
    };
    esgConfig = { get: vi.fn() };
    notifications = { create: vi.fn() };
    eventEmitter = { emit: vi.fn() };

    const module = await Test.createTestingModule({
      providers: [
        ChallengesService,
        { provide: PrismaService, useValue: prisma },
        { provide: EsgConfigService, useValue: esgConfig },
        { provide: NotificationsService, useValue: notifications },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();
    service = module.get(ChallengesService);
  });

  it('blocks approval when the challenge requires evidence and none exists', async () => {
    prisma.challengeParticipation.findUnique.mockResolvedValue(
      participationRow({ proofUrl: null }),
    );
    esgConfig.get.mockResolvedValue(false); // global off, but challenge flag on

    await expect(service.approve(20)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('awards xp, emits xp-changed and notifies on approval', async () => {
    prisma.challengeParticipation.findUnique.mockResolvedValue(
      participationRow(),
    );
    esgConfig.get.mockResolvedValue(false);
    const txEmployeeUpdate = vi.fn();
    prisma.$transaction.mockImplementation(
      (cb: (tx: unknown) => unknown): unknown =>
        cb({
          challengeParticipation: {
            update: vi
              .fn()
              .mockResolvedValue(
                participationRow({ approvalStatus: 'approved', xpAwarded: 50 }),
              ),
          },
          employee: { update: txEmployeeUpdate },
        }),
    );

    const result = await service.approve(20);

    expect(txEmployeeUpdate).toHaveBeenCalledWith({
      where: { id: 5 },
      data: { xp: { increment: 50 } },
    });
    expect(eventEmitter.emit).toHaveBeenCalledWith('employee.xp_changed', {
      employeeId: 5,
    });
    expect(notifications.create).toHaveBeenCalledWith(
      expect.objectContaining({ employeeId: 5, type: 'approval_decision' }),
    );
    expect(result.xpAwarded).toBe(50);
  });

  it('rejects re-approving an already approved participation', async () => {
    prisma.challengeParticipation.findUnique.mockResolvedValue(
      participationRow({ approvalStatus: 'approved' }),
    );
    await expect(service.approve(20)).rejects.toBeInstanceOf(ConflictException);
  });
});
