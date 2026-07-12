import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { RewardsService } from './rewards.service';
import type { AuthUser } from '../auth/interfaces/jwt-payload.interface';

const actor = { id: 5 } as AuthUser;

function makeTx(overrides: {
  reward?: Record<string, unknown> | null;
  employeePoints?: number;
  stockUpdateCount?: number;
}) {
  return {
    reward: {
      findUnique: vi.fn().mockResolvedValue(
        overrides.reward === undefined
          ? {
              id: 1,
              name: 'Eco mug',
              status: 'active',
              stock: 1,
              pointsRequired: 50,
            }
          : overrides.reward,
      ),
      updateMany: vi
        .fn()
        .mockResolvedValue({ count: overrides.stockUpdateCount ?? 1 }),
    },
    employee: {
      findUnique: vi
        .fn()
        .mockResolvedValue({ id: 5, points: overrides.employeePoints ?? 100 }),
      update: vi.fn(),
    },
    rewardRedemption: {
      create: vi.fn().mockResolvedValue({
        id: 99,
        employeeId: 5,
        rewardId: 1,
        pointsDeducted: 50,
        status: 'confirmed',
        redeemedAt: new Date(),
        reward: { name: 'Eco mug' },
      }),
    },
  };
}

describe('RewardsService.redeem', () => {
  let service: RewardsService;
  let prisma: { $transaction: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    prisma = { $transaction: vi.fn() };
    const module = await Test.createTestingModule({
      providers: [RewardsService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(RewardsService);
  });

  it('deducts points and stock on a successful redemption', async () => {
    const tx = makeTx({});
    prisma.$transaction.mockImplementation(
      (cb: (tx: unknown) => unknown): unknown => cb(tx),
    );

    const result = await service.redeem(1, actor);

    expect(tx.employee.update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: { points: { decrement: 50 } },
    });
    expect(tx.reward.updateMany).toHaveBeenCalledWith({
      where: { id: 1, stock: { gte: 1 } },
      data: { stock: { decrement: 1 } },
    });
    expect(result.pointsDeducted).toBe(50);
  });

  it('rejects when the employee has insufficient points', async () => {
    const tx = makeTx({ employeePoints: 10 });
    prisma.$transaction.mockImplementation(
      (cb: (tx: unknown) => unknown): unknown => cb(tx),
    );

    await expect(service.redeem(1, actor)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(tx.reward.updateMany).not.toHaveBeenCalled();
  });

  it('rejects when stock is claimed by a concurrent redemption (race guard)', async () => {
    const tx = makeTx({ stockUpdateCount: 0 });
    prisma.$transaction.mockImplementation(
      (cb: (tx: unknown) => unknown): unknown => cb(tx),
    );

    await expect(service.redeem(1, actor)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(tx.rewardRedemption.create).not.toHaveBeenCalled();
  });
});
