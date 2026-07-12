import { Test, TestingModule } from '@nestjs/testing';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { PrismaService } from '../../prisma/prisma.service';
import { EsgConfigService } from '../esg-config/esg-config.service';
import { FleetCommutingService } from './fleet-commuting.service';

function createdData(mock: ReturnType<typeof vi.fn>): Record<string, unknown> {
  const call = mock.mock.calls[0] as [{ data: Record<string, unknown> }];
  return call[0].data;
}

function vehicleRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 1,
    employeeId: 1,
    employee: { id: 1, name: 'Alex', departmentId: 4, homeWorkDistance: 15 },
    modelId: 1,
    model: { id: 1, co2Emissions: 0.12 },
    startDate: new Date('2025-01-01'),
    endDate: null,
    ...overrides,
  };
}

describe('FleetCommutingService', () => {
  let service: FleetCommutingService;
  let prisma: {
    fleetVehicle: { findMany: ReturnType<typeof vi.fn> };
    emittedEmission: {
      deleteMany: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
    };
  };
  let esgConfig: { get: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    prisma = {
      fleetVehicle: { findMany: vi.fn() },
      emittedEmission: { deleteMany: vi.fn(), create: vi.fn() },
    };
    esgConfig = { get: vi.fn().mockResolvedValue(4) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FleetCommutingService,
        { provide: PrismaService, useValue: prisma },
        { provide: EsgConfigService, useValue: esgConfig },
      ],
    }).compile();
    service = module.get(FleetCommutingService);
  });

  it('reproduces the worked example: 15km x2 x4days x4weeks x0.12 = 57.6 kgCO2e over a 28-day month', async () => {
    prisma.fleetVehicle.findMany.mockResolvedValue([vehicleRow()]);

    const result = await service.run('2026-02');

    expect(createdData(prisma.emittedEmission.create)).toEqual(
      expect.objectContaining({
        sourceType: 'fleet_commuting',
        employeeId: 1,
        departmentId: 4,
        co2eValue: 57.6,
      }),
    );
    expect(result.employeesProcessed).toBe(1);
    expect(result.employeesSkipped).toBe(0);
  });

  it('skips an employee with no recorded home-work distance', async () => {
    prisma.fleetVehicle.findMany.mockResolvedValue([
      vehicleRow({
        employee: {
          id: 2,
          name: 'Sam',
          departmentId: 4,
          homeWorkDistance: null,
        },
      }),
    ]);

    const result = await service.run('2026-02');

    expect(prisma.emittedEmission.create).not.toHaveBeenCalled();
    expect(result.employeesSkipped).toBe(1);
  });

  it('is idempotent per (employee, period): deletes prior rows for the period before recreating', async () => {
    prisma.fleetVehicle.findMany.mockResolvedValue([vehicleRow()]);

    await service.run('2026-02');

    expect(prisma.emittedEmission.deleteMany).toHaveBeenCalledWith({
      where: {
        sourceType: 'fleet_commuting',
        employeeId: 1,
        periodStart: new Date(Date.UTC(2026, 1, 1)),
      },
    });
  });

  it('filters out vehicles whose assignment ended before the period', async () => {
    prisma.fleetVehicle.findMany.mockResolvedValue([]);

    const result = await service.run('2026-02');

    expect(prisma.fleetVehicle.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          startDate: { lte: new Date(Date.UTC(2026, 1, 28)) },
          OR: [
            { endDate: null },
            { endDate: { gte: new Date(Date.UTC(2026, 1, 1)) } },
          ],
        },
      }),
    );
    expect(result.employeesProcessed).toBe(0);
  });
});
