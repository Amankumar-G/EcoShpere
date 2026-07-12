import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../../prisma/prisma.service';
import { FleetService } from './fleet.service';

describe('FleetService', () => {
  let service: FleetService;
  let prisma: {
    fleetVehicleModel: {
      create: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
    };
    fleetVehicle: {
      create: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(async () => {
    prisma = {
      fleetVehicleModel: {
        create: vi.fn(),
        findUnique: vi.fn(),
      },
      fleetVehicle: {
        create: vi.fn(),
        findFirst: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [FleetService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<FleetService>(FleetService);
  });

  describe('createVehicle — one active vehicle per employee', () => {
    it('rejects a second open-ended assignment for the same employee', async () => {
      prisma.fleetVehicleModel.findUnique.mockResolvedValue({ id: 3 });
      prisma.fleetVehicle.findFirst.mockResolvedValue({ id: 10 });

      await expect(
        service.createVehicle({
          employeeId: 5,
          modelId: 3,
          startDate: '2026-01-01',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(prisma.fleetVehicle.create).not.toHaveBeenCalled();
    });

    it('allows an open-ended assignment when the employee has no active vehicle', async () => {
      prisma.fleetVehicleModel.findUnique.mockResolvedValue({ id: 3 });
      prisma.fleetVehicle.findFirst.mockResolvedValue(null);
      prisma.fleetVehicle.create.mockResolvedValue({ id: 11 });

      await service.createVehicle({
        employeeId: 5,
        modelId: 3,
        startDate: '2026-01-01',
      });

      expect(prisma.fleetVehicle.findFirst).toHaveBeenCalledWith({
        where: { employeeId: 5, endDate: null },
      });
      expect(prisma.fleetVehicle.create).toHaveBeenCalled();
    });

    it('skips the active-vehicle check for a closed (endDate set) assignment', async () => {
      prisma.fleetVehicleModel.findUnique.mockResolvedValue({ id: 3 });
      prisma.fleetVehicle.create.mockResolvedValue({ id: 12 });

      await service.createVehicle({
        employeeId: 5,
        modelId: 3,
        startDate: '2026-01-01',
        endDate: '2026-06-01',
      });

      expect(prisma.fleetVehicle.findFirst).not.toHaveBeenCalled();
      expect(prisma.fleetVehicle.create).toHaveBeenCalled();
    });
  });

  describe('importModelsCsv — happy + malformed rows', () => {
    it('imports valid rows and isolates malformed ones by row number', async () => {
      prisma.fleetVehicleModel.create.mockResolvedValue({ id: 1 });

      const csv = [
        'name,co2Emissions,status',
        'Sedan,0.12,active', // ok
        ',0.20,active', // missing name
        'Van,notANumber,active', // bad number
        'Truck,0.30,', // ok, blank status defaults
      ].join('\n');

      const result = await service.importModelsCsv(csv);

      expect(result.imported).toBe(2);
      expect(result.failed).toHaveLength(2);
      expect(result.failed.map((f) => f.row)).toEqual([2, 3]);
    });
  });
});
