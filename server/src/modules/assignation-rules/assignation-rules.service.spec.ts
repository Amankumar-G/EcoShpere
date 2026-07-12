import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { PrismaService } from '../../prisma/prisma.service';
import { AssignationRulesService } from './assignation-rules.service';

function createdData(mock: ReturnType<typeof vi.fn>): Record<string, unknown> {
  const call = mock.mock.calls[0] as [{ data: Record<string, unknown> }];
  return call[0].data;
}

function ruleRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 1,
    emissionFactorId: 1,
    productId: null,
    partnerId: null,
    accountId: 5,
    applicationPeriodStart: null,
    applicationPeriodEnd: null,
    replaceExisting: false,
    createdAt: new Date('2026-01-01'),
    ...overrides,
  };
}

describe('AssignationRulesService', () => {
  let service: AssignationRulesService;
  let prisma: {
    assignationRule: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(async () => {
    prisma = {
      assignationRule: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignationRulesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(AssignationRulesService);
  });

  it('creates a rule with defaults for optional fields', async () => {
    prisma.assignationRule.create.mockResolvedValue(ruleRow());

    const result = await service.create({
      emissionFactorId: 1,
      accountId: 5,
    });

    expect(createdData(prisma.assignationRule.create)).toEqual(
      expect.objectContaining({
        productId: null,
        partnerId: null,
        accountId: 5,
        replaceExisting: false,
      }),
    );
    expect(result.accountId).toBe(5);
  });

  it('throws not found when updating a missing rule', async () => {
    prisma.assignationRule.findUnique.mockResolvedValue(null);

    await expect(service.update(999, { accountId: 6 })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws not found when removing a missing rule', async () => {
    prisma.assignationRule.findUnique.mockResolvedValue(null);

    await expect(service.remove(999)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('removes an existing rule', async () => {
    prisma.assignationRule.findUnique.mockResolvedValue(ruleRow());

    await service.remove(1);

    expect(prisma.assignationRule.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });
});
