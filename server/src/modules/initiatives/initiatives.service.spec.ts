import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { InitiativesService } from './initiatives.service';

type InitiativeRow = {
  id: number;
  title: string;
  description: string | null;
  departmentId: number | null;
  assigneeEmployeeId: number | null;
  estimatedCo2Reduction: unknown;
  actualCo2Reduction: unknown;
  progress: unknown;
  deadline: Date | null;
  status: string;
  createdAt: Date;
};

function initiativeRow(overrides: Partial<InitiativeRow> = {}): InitiativeRow {
  return {
    id: 1,
    title: 'LED retrofit',
    description: null,
    departmentId: null,
    assigneeEmployeeId: null,
    estimatedCo2Reduction: '500.00',
    actualCo2Reduction: null,
    progress: '0',
    deadline: null,
    status: 'open',
    createdAt: new Date('2026-01-01'),
    ...overrides,
  };
}

describe('InitiativesService', () => {
  let service: InitiativesService;
  let prisma: {
    initiative: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(async () => {
    prisma = {
      initiative: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    const module = await Test.createTestingModule({
      providers: [
        InitiativesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(InitiativesService);
  });

  it('defaults status/progress and coerces decimals on create', async () => {
    prisma.initiative.create.mockResolvedValue(initiativeRow());
    const result = await service.create({ title: 'LED retrofit' });

    expect(prisma.initiative.create).toHaveBeenCalledWith({
      data: {
        title: 'LED retrofit',
        description: null,
        departmentId: null,
        assigneeEmployeeId: null,
        estimatedCo2Reduction: null,
        actualCo2Reduction: null,
        progress: 0,
        deadline: null,
        status: 'open',
      },
    });
    expect(result.estimatedCo2Reduction).toBe(500);
    expect(result.actualCo2Reduction).toBeNull();
    expect(result.progress).toBe(0);
  });

  it('throws NotFound when updating a missing initiative', async () => {
    prisma.initiative.findUnique.mockResolvedValue(null);
    await expect(service.update(99, { progress: 50 })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws NotFound when deleting a missing initiative', async () => {
    prisma.initiative.findUnique.mockResolvedValue(null);
    await expect(service.remove(99)).rejects.toBeInstanceOf(NotFoundException);
  });
});
