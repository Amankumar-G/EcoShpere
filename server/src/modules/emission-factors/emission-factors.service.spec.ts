import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { PrismaService } from '../../prisma/prisma.service';
import { EmissionFactorsService } from './emission-factors.service';

function factorRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 1,
    name: 'Natural Gas',
    scopeId: 1,
    scope: { id: 1, name: 'Scope 1', code: 'scope_1' },
    sourceDatabaseId: 1,
    sourceDatabase: { id: 1, name: 'ADEME' },
    uncertainty: null,
    computeMethod: 'physical',
    unitOfMeasure: 'kWh',
    status: 'active',
    value: 0,
    gasLines: [],
    ...overrides,
  };
}

function gasLineRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 1,
    emissionFactorId: 1,
    gasId: 1,
    gas: { id: 1, name: 'Carbon Dioxide', symbol: 'CO2', gwp: 1 },
    activityType: null,
    value: 0.183,
    unit: 'kg/kWh',
    ...overrides,
  };
}

describe('EmissionFactorsService', () => {
  let service: EmissionFactorsService;
  let prisma: {
    emissionFactor: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
    emissionFactorGasLine: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(async () => {
    prisma = {
      emissionFactor: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      emissionFactorGasLine: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmissionFactorsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<EmissionFactorsService>(EmissionFactorsService);
  });

  it('creates an emission factor with the given fields', async () => {
    prisma.emissionFactor.create.mockResolvedValue(factorRow());

    const result = await service.create({
      name: 'Natural Gas',
      scopeId: 1,
      sourceDatabaseId: 1,
      computeMethod: 'physical',
      unitOfMeasure: 'kWh',
    });

    expect(result.name).toBe('Natural Gas');
    expect(result.computeMethod).toBe('physical');
  });

  it('rejects a gas line with a non-positive value', async () => {
    prisma.emissionFactor.findUnique.mockResolvedValue(factorRow());

    await expect(
      service.addGasLine(1, { gasId: 1, value: 0, unit: 'kg/kWh' }),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.addGasLine(1, { gasId: 1, value: -5, unit: 'kg/kWh' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws not found when adding a gas line to a missing factor', async () => {
    prisma.emissionFactor.findUnique.mockResolvedValue(null);

    await expect(
      service.addGasLine(999, { gasId: 1, value: 1, unit: 'kg/kWh' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('reproduces the natural-gas worked example: 0.1833 kgCO2e/kWh', async () => {
    prisma.emissionFactor.findUnique.mockResolvedValue(factorRow());
    prisma.emissionFactorGasLine.create.mockResolvedValue(gasLineRow());
    prisma.emissionFactorGasLine.findMany.mockResolvedValue([
      gasLineRow({ value: 0.183, gas: { id: 1, gwp: 1 } }),
      gasLineRow({ value: 0.0000035, gas: { id: 2, gwp: 28 } }),
      gasLineRow({ value: 0.0000006, gas: { id: 3, gwp: 265 } }),
    ]);
    prisma.emissionFactor.update.mockResolvedValue(
      factorRow({ value: 0.1833 }),
    );

    await service.addGasLine(1, { gasId: 1, value: 0.183, unit: 'kg/kWh' });

    expect(prisma.emissionFactor.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: { value: 0.1833 },
      }),
    );
  });

  it('reproduces the diesel worked example: single line factor equals its own value', async () => {
    prisma.emissionFactor.findUnique.mockResolvedValue(factorRow());
    prisma.emissionFactorGasLine.create.mockResolvedValue(
      gasLineRow({ value: 2.69, gas: { id: 1, gwp: 1 } }),
    );
    prisma.emissionFactorGasLine.findMany.mockResolvedValue([
      gasLineRow({ value: 2.69, gas: { id: 1, gwp: 1 } }),
    ]);
    prisma.emissionFactor.update.mockResolvedValue(factorRow({ value: 2.69 }));

    await service.addGasLine(1, { gasId: 1, value: 2.69, unit: 'kgCO2e/L' });

    expect(prisma.emissionFactor.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: { value: 2.69 },
      }),
    );
  });

  it('recomputes every factor using a gas when that gas changes', async () => {
    prisma.emissionFactor.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    prisma.emissionFactorGasLine.findMany.mockResolvedValue([
      gasLineRow({ value: 0.183, gas: { id: 1, gwp: 1 } }),
    ]);
    prisma.emissionFactor.update.mockResolvedValue(factorRow());

    await service.recomputeFactorsForGas(1);

    expect(prisma.emissionFactor.findMany).toHaveBeenCalledWith({
      where: { gasLines: { some: { gasId: 1 } } },
      select: { id: true },
    });
    expect(prisma.emissionFactor.update).toHaveBeenCalledTimes(2);
  });

  it('recomputes the cached value after removing a gas line', async () => {
    prisma.emissionFactorGasLine.findUnique.mockResolvedValue({
      id: 1,
      emissionFactorId: 1,
    });
    prisma.emissionFactorGasLine.findMany.mockResolvedValue([]);
    prisma.emissionFactor.update.mockResolvedValue(factorRow({ value: 0 }));

    await service.removeGasLine(1, 1);

    expect(prisma.emissionFactorGasLine.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(prisma.emissionFactor.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { value: 0 } }),
    );
  });

  it('throws not found when the gas line does not belong to the factor', async () => {
    prisma.emissionFactorGasLine.findUnique.mockResolvedValue({
      id: 1,
      emissionFactorId: 2,
    });

    await expect(service.removeGasLine(1, 1)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
