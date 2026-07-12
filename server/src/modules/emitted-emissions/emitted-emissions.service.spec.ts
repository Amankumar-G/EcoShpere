import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../auth/interfaces/jwt-payload.interface';
import { DepartmentScopeService } from '../departments/department-scope.service';
import { EmissionFactorsService } from '../emission-factors/emission-factors.service';
import { EmissionScopeTreeService } from '../emission-scopes/emission-scope-tree.service';
import { EmittedEmissionsService } from './emitted-emissions.service';

function createdData(mock: ReturnType<typeof vi.fn>): Record<string, unknown> {
  const call = mock.mock.calls[0] as [{ data: Record<string, unknown> }];
  return call[0].data;
}

function emissionRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 1,
    name: 'Refrigerant leak',
    departmentId: 1,
    sourceType: 'manual',
    sourceRefId: null,
    emissionFactorId: 1,
    employeeId: null,
    quantity: 2,
    co2eValue: 2600,
    periodStart: null,
    periodEnd: null,
    date: new Date('2026-01-15'),
    evidenceUrl: null,
    createdAt: new Date('2026-01-15'),
    ...overrides,
  };
}

function factorDto(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 1,
    name: 'R-134a refrigerant',
    scopeId: 1,
    scope: { id: 1, name: 'Scope 1', code: 'scope_1' },
    sourceDatabaseId: 1,
    sourceDatabase: { id: 1, name: 'ADEME' },
    uncertainty: null,
    computeMethod: 'physical',
    unitOfMeasure: 'kg',
    status: 'active',
    value: 1300,
    gasLines: [
      {
        id: 1,
        emissionFactorId: 1,
        gasId: 1,
        gas: { id: 1, name: 'HFC-134a', symbol: 'HFC', gwp: 1300 },
        activityType: null,
        value: 1,
        unit: 'kg',
      },
    ],
    ...overrides,
  };
}

describe('EmittedEmissionsService', () => {
  let service: EmittedEmissionsService;
  let prisma: {
    emittedEmission: {
      findMany: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
    };
    businessTravel: {
      findUnique: ReturnType<typeof vi.fn>;
    };
  };
  let emissionFactorsService: { findOne: ReturnType<typeof vi.fn> };
  let departmentScope: { resolveSubtreeIds: ReturnType<typeof vi.fn> };
  let scopeTree: { resolveSubtreeIds: ReturnType<typeof vi.fn> };

  const adminActor: AuthUser = {
    id: 1,
    email: 'admin@example.com',
    name: 'Admin',
    role: Role.admin,
    departmentId: null,
  };
  const managerActor: AuthUser = {
    id: 2,
    email: 'manager@example.com',
    name: 'Manager',
    role: Role.manager,
    departmentId: 1,
  };

  beforeEach(async () => {
    prisma = {
      emittedEmission: { findMany: vi.fn(), create: vi.fn() },
      businessTravel: { findUnique: vi.fn() },
    };
    emissionFactorsService = { findOne: vi.fn() };
    departmentScope = { resolveSubtreeIds: vi.fn() };
    scopeTree = { resolveSubtreeIds: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmittedEmissionsService,
        { provide: PrismaService, useValue: prisma },
        { provide: EmissionFactorsService, useValue: emissionFactorsService },
        { provide: DepartmentScopeService, useValue: departmentScope },
        { provide: EmissionScopeTreeService, useValue: scopeTree },
      ],
    }).compile();

    service = module.get<EmittedEmissionsService>(EmittedEmissionsService);
  });

  it('reproduces the refrigerant worked example: 2 kg x GWP 1300 = 2600 kgCO2e', async () => {
    emissionFactorsService.findOne.mockResolvedValue(factorDto());
    prisma.emittedEmission.create.mockResolvedValue(emissionRow());

    await service.create(adminActor, {
      name: 'Refrigerant leak',
      emissionFactorId: 1,
      quantity: 2,
      date: new Date('2026-01-15'),
      departmentId: 1,
    });

    expect(createdData(prisma.emittedEmission.create)).toEqual(
      expect.objectContaining({
        co2eValue: 2600,
        sourceType: 'manual',
      }),
    );
  });

  it('reproduces the spend-based worked example: 5000 x 0.45 = 2250 kgCO2e', async () => {
    emissionFactorsService.findOne.mockResolvedValue(
      factorDto({ computeMethod: 'monetary', value: 0.45 }),
    );
    prisma.emittedEmission.create.mockResolvedValue(emissionRow());

    await service.create(adminActor, {
      name: 'Office supplies spend',
      emissionFactorId: 1,
      quantity: 5000,
      date: new Date('2026-01-15'),
      departmentId: 1,
    });

    expect(createdData(prisma.emittedEmission.create)).toEqual(
      expect.objectContaining({ co2eValue: 2250 }),
    );
  });

  it('rejects non-positive quantity', async () => {
    await expect(
      service.create(adminActor, {
        name: 'Bad entry',
        emissionFactorId: 1,
        quantity: 0,
        date: new Date(),
        departmentId: 1,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(emissionFactorsService.findOne).not.toHaveBeenCalled();
  });

  it('rejects a factor with zero gas lines', async () => {
    emissionFactorsService.findOne.mockResolvedValue(
      factorDto({ gasLines: [] }),
    );

    await expect(
      service.create(adminActor, {
        name: 'No gas lines',
        emissionFactorId: 1,
        quantity: 1,
        date: new Date(),
        departmentId: 1,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('forbids a manager from recording an emission outside their department subtree', async () => {
    emissionFactorsService.findOne.mockResolvedValue(factorDto());
    departmentScope.resolveSubtreeIds.mockResolvedValue([1, 2]);

    await expect(
      service.create(managerActor, {
        name: 'Out of scope',
        emissionFactorId: 1,
        quantity: 1,
        date: new Date(),
        departmentId: 99,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows a manager to record an emission within their department subtree', async () => {
    emissionFactorsService.findOne.mockResolvedValue(factorDto());
    departmentScope.resolveSubtreeIds.mockResolvedValue([1, 2]);
    prisma.emittedEmission.create.mockResolvedValue(emissionRow());

    await expect(
      service.create(managerActor, {
        name: 'In scope',
        emissionFactorId: 1,
        quantity: 1,
        date: new Date(),
        departmentId: 2,
      }),
    ).resolves.toBeDefined();
  });

  it('scopes the ledger list to the manager subtree when no department filter is given', async () => {
    departmentScope.resolveSubtreeIds.mockResolvedValue([1, 2]);
    prisma.emittedEmission.findMany.mockResolvedValue([]);

    await service.list(managerActor, {});

    expect(prisma.emittedEmission.findMany).toHaveBeenCalledWith({
      where: { departmentId: { in: [1, 2] } },
    });
  });

  it('returns an empty scope for a manager filtering a department outside their subtree', async () => {
    departmentScope.resolveSubtreeIds.mockResolvedValue([1, 2]);
    prisma.emittedEmission.findMany.mockResolvedValue([]);

    await service.list(managerActor, { departmentId: 99 });

    expect(prisma.emittedEmission.findMany).toHaveBeenCalledWith({
      where: { departmentId: { in: [] } },
    });
  });

  it('links a manual entry to a business travel record via sourceRefId', async () => {
    emissionFactorsService.findOne.mockResolvedValue(factorDto());
    prisma.businessTravel.findUnique.mockResolvedValue({ id: 42 });
    prisma.emittedEmission.create.mockResolvedValue(emissionRow());

    await service.create(adminActor, {
      name: 'Flight to conference',
      emissionFactorId: 1,
      quantity: 1,
      date: new Date('2026-01-15'),
      departmentId: 1,
      businessTravelRefId: 42,
    });

    expect(createdData(prisma.emittedEmission.create)).toEqual(
      expect.objectContaining({ sourceRefId: 42 }),
    );
  });

  it('rejects a manual entry linking a business travel record that does not exist', async () => {
    emissionFactorsService.findOne.mockResolvedValue(factorDto());
    prisma.businessTravel.findUnique.mockResolvedValue(null);

    await expect(
      service.create(adminActor, {
        name: 'Flight to conference',
        emissionFactorId: 1,
        quantity: 1,
        date: new Date('2026-01-15'),
        departmentId: 1,
        businessTravelRefId: 999,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('groups footprint totals by department and sums co2eValue', async () => {
    prisma.emittedEmission.findMany.mockResolvedValue([
      {
        ...emissionRow({ co2eValue: 100, departmentId: 1 }),
        department: { id: 1, name: 'Facilities' },
        emissionFactor: { scope: { id: 1, name: 'Scope 1' } },
      },
      {
        ...emissionRow({ co2eValue: 50, departmentId: 1 }),
        department: { id: 1, name: 'Facilities' },
        emissionFactor: { scope: { id: 1, name: 'Scope 1' } },
      },
    ]);

    const result = await service.footprint(adminActor, {
      groupBy: 'department',
    });

    expect(result).toEqual([{ key: 1, label: 'Facilities', co2eValue: 150 }]);
  });
});
