import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { EnvironmentalGoalsService } from './environmental-goals.service';

type GoalRow = {
  id: number;
  departmentId: number | null;
  metric: string;
  targetValue: unknown;
  unit: string;
  startDate: Date;
  endDate: Date;
  status: string;
  createdAt: Date;
};

function goalRow(overrides: Partial<GoalRow> = {}): GoalRow {
  return {
    id: 1,
    departmentId: null,
    metric: 'scope_2_kgco2e',
    targetValue: '1000.00',
    unit: 'kgCO2e',
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
    status: 'active',
    createdAt: new Date('2026-01-01'),
    ...overrides,
  };
}

describe('EnvironmentalGoalsService', () => {
  let service: EnvironmentalGoalsService;
  let prisma: {
    environmentalGoal: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(async () => {
    prisma = {
      environmentalGoal: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    const module = await Test.createTestingModule({
      providers: [
        EnvironmentalGoalsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(EnvironmentalGoalsService);
  });

  it('creates a goal with defaulted status and coerced decimal', async () => {
    prisma.environmentalGoal.create.mockResolvedValue(goalRow());
    const result = await service.create({
      metric: 'scope_2_kgco2e',
      targetValue: 1000,
      unit: 'kgCO2e',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    });

    expect(prisma.environmentalGoal.create).toHaveBeenCalledWith({
      data: {
        departmentId: null,
        metric: 'scope_2_kgco2e',
        targetValue: 1000,
        unit: 'kgCO2e',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        status: 'active',
      },
    });
    expect(result.targetValue).toBe(1000);
  });

  it('filters list by department when provided', async () => {
    prisma.environmentalGoal.findMany.mockResolvedValue([]);
    await service.list(3);
    expect(prisma.environmentalGoal.findMany).toHaveBeenCalledWith({
      where: { departmentId: 3 },
      orderBy: { endDate: 'asc' },
    });
  });

  it('throws NotFound when updating a missing goal', async () => {
    prisma.environmentalGoal.findUnique.mockResolvedValue(null);
    await expect(service.update(99, { metric: 'x' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws NotFound when deleting a missing goal', async () => {
    prisma.environmentalGoal.findUnique.mockResolvedValue(null);
    await expect(service.remove(99)).rejects.toBeInstanceOf(NotFoundException);
  });
});
