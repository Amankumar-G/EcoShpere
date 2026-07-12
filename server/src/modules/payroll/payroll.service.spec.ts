import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../../prisma/prisma.service';
import { PayrollService } from './payroll.service';

describe('PayrollService', () => {
  let service: PayrollService;
  let prisma: {
    payrollContract: {
      create: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(async () => {
    prisma = {
      payrollContract: {
        create: vi.fn(),
        findUnique: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PayrollService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<PayrollService>(PayrollService);
  });

  describe('create', () => {
    it('maps fields, coerces dates, and defaults optional columns to null', async () => {
      prisma.payrollContract.create.mockResolvedValue({ id: 1 });

      await service.create({
        employeeId: 5,
        jobPosition: 'Engineer',
        contractType: 'permanent',
        wage: 5000,
        startDate: '2026-01-01',
      });

      const { data } = prisma.payrollContract.create.mock.calls[0][0] as {
        data: {
          employeeId: number;
          leadershipLevel: string | null;
          country: string | null;
          endDate: Date | null;
          startDate: Date;
        };
      };
      expect(data.employeeId).toBe(5);
      expect(data.leadershipLevel).toBeNull();
      expect(data.country).toBeNull();
      expect(data.endDate).toBeNull();
      expect(data.startDate).toBeInstanceOf(Date);
    });
  });

  describe('findOne', () => {
    it('throws when the contract does not exist', async () => {
      prisma.payrollContract.findUnique.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
