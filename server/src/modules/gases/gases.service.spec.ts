import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { PrismaService } from '../../prisma/prisma.service';
import { GasesService } from './gases.service';

function uniqueSymbolViolation(): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    clientVersion: '7.0.0',
  });
}

function gasRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 1,
    name: 'Carbon Dioxide',
    symbol: 'CO2',
    gwp: 1,
    gwpMetric: 'AR6_100',
    ...overrides,
  };
}

describe('GasesService', () => {
  let service: GasesService;
  let prisma: {
    gas: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(async () => {
    prisma = {
      gas: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [GasesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<GasesService>(GasesService);
  });

  it('creates a gas with the given fields', async () => {
    prisma.gas.create.mockResolvedValue(gasRow());

    const result = await service.create({
      name: 'Carbon Dioxide',
      symbol: 'CO2',
      gwp: 1,
    });

    expect(result.symbol).toBe('CO2');
  });

  it('raises a conflict when creating a gas with a duplicate symbol', async () => {
    prisma.gas.create.mockRejectedValue(uniqueSymbolViolation());

    await expect(
      service.create({ name: 'Carbon Dioxide', symbol: 'CO2', gwp: 1 }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('raises a conflict when updating a gas to a duplicate symbol', async () => {
    prisma.gas.findUnique.mockResolvedValue(gasRow());
    prisma.gas.update.mockRejectedValue(uniqueSymbolViolation());

    await expect(service.update(1, { symbol: 'CH4' })).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('propagates non-unique-constraint errors unchanged', async () => {
    const otherError = new Error('connection lost');
    prisma.gas.create.mockRejectedValue(otherError);

    await expect(
      service.create({ name: 'Carbon Dioxide', symbol: 'CO2', gwp: 1 }),
    ).rejects.toBe(otherError);
  });
});
