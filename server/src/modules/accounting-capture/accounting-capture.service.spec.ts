import { Test, TestingModule } from '@nestjs/testing';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { PrismaService } from '../../prisma/prisma.service';
import { AssignationMatchService } from '../assignation-rules/assignation-match.service';
import { EmissionFactorsService } from '../emission-factors/emission-factors.service';
import { EsgConfigService } from '../esg-config/esg-config.service';
import { AccountingCaptureService } from './accounting-capture.service';

function createdData(mock: ReturnType<typeof vi.fn>): Record<string, unknown> {
  const call = mock.mock.calls[0] as [{ data: Record<string, unknown> }];
  return call[0].data;
}

function factorDto(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 1,
    name: 'Diesel',
    scopeId: 1,
    sourceDatabaseId: 1,
    computeMethod: 'physical',
    unitOfMeasure: 'L',
    status: 'active',
    value: 2.69,
    gasLines: [],
    ...overrides,
  };
}

describe('AccountingCaptureService', () => {
  let service: AccountingCaptureService;
  let prisma: {
    invoice: { findUnique: ReturnType<typeof vi.fn> };
    expenseRecord: { findUnique: ReturnType<typeof vi.fn> };
    employee: { findUnique: ReturnType<typeof vi.fn> };
    emittedEmission: { create: ReturnType<typeof vi.fn> };
  };
  let assignationMatch: { findBestMatch: ReturnType<typeof vi.fn> };
  let emissionFactorsService: { findOne: ReturnType<typeof vi.fn> };
  let esgConfig: { get: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    prisma = {
      invoice: { findUnique: vi.fn() },
      expenseRecord: { findUnique: vi.fn() },
      employee: { findUnique: vi.fn() },
      emittedEmission: { create: vi.fn() },
    };
    assignationMatch = { findBestMatch: vi.fn() };
    emissionFactorsService = { findOne: vi.fn() };
    esgConfig = { get: vi.fn().mockResolvedValue(true) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountingCaptureService,
        { provide: PrismaService, useValue: prisma },
        { provide: AssignationMatchService, useValue: assignationMatch },
        { provide: EmissionFactorsService, useValue: emissionFactorsService },
        { provide: EsgConfigService, useValue: esgConfig },
      ],
    }).compile();
    service = module.get(AccountingCaptureService);
  });

  it('does nothing when auto_emission_calculation is disabled', async () => {
    esgConfig.get.mockResolvedValue(false);

    await service.onInvoicePosted({
      invoiceId: 1,
      partnerId: 1,
      postedAt: new Date(),
    });

    expect(prisma.invoice.findUnique).not.toHaveBeenCalled();
  });

  it('captures a physical invoice line: quantity x factor.value', async () => {
    prisma.invoice.findUnique.mockResolvedValue({
      id: 1,
      lines: [
        { id: 10, productId: 5, accountId: 7, quantity: 100, amount: 1000 },
      ],
    });
    assignationMatch.findBestMatch.mockResolvedValue({
      emissionFactorId: 1,
    });
    emissionFactorsService.findOne.mockResolvedValue(factorDto());

    await service.onInvoicePosted({
      invoiceId: 1,
      partnerId: 2,
      postedAt: new Date('2026-02-01'),
    });

    expect(createdData(prisma.emittedEmission.create)).toEqual(
      expect.objectContaining({
        sourceType: 'accounting',
        sourceRefId: 10,
        departmentId: null,
        quantity: 100,
        co2eValue: 269,
      }),
    );
  });

  it('captures a monetary invoice line using line.amount as quantity', async () => {
    prisma.invoice.findUnique.mockResolvedValue({
      id: 1,
      lines: [
        { id: 10, productId: null, accountId: 7, quantity: 1, amount: 5000 },
      ],
    });
    assignationMatch.findBestMatch.mockResolvedValue({ emissionFactorId: 1 });
    emissionFactorsService.findOne.mockResolvedValue(
      factorDto({ computeMethod: 'monetary', value: 0.45 }),
    );

    await service.onInvoicePosted({
      invoiceId: 1,
      partnerId: 2,
      postedAt: new Date('2026-02-01'),
    });

    expect(createdData(prisma.emittedEmission.create)).toEqual(
      expect.objectContaining({ co2eValue: 2250 }),
    );
  });

  it('skips an invoice line when no rule matches', async () => {
    prisma.invoice.findUnique.mockResolvedValue({
      id: 1,
      lines: [
        { id: 10, productId: 5, accountId: 7, quantity: 100, amount: 1000 },
      ],
    });
    assignationMatch.findBestMatch.mockResolvedValue(null);

    await service.onInvoicePosted({
      invoiceId: 1,
      partnerId: 2,
      postedAt: new Date('2026-02-01'),
    });

    expect(prisma.emittedEmission.create).not.toHaveBeenCalled();
  });

  it('captures an expense and attributes department via the employee', async () => {
    prisma.expenseRecord.findUnique.mockResolvedValue({
      id: 20,
      productId: 5,
      accountId: 7,
      quantity: 50,
      amount: 500,
    });
    prisma.employee.findUnique.mockResolvedValue({ id: 3, departmentId: 9 });
    assignationMatch.findBestMatch.mockResolvedValue({ emissionFactorId: 1 });
    emissionFactorsService.findOne.mockResolvedValue(factorDto());

    await service.onExpensePosted({
      expenseId: 20,
      employeeId: 3,
      postedAt: new Date('2026-02-01'),
    });

    expect(createdData(prisma.emittedEmission.create)).toEqual(
      expect.objectContaining({
        sourceType: 'accounting',
        sourceRefId: 20,
        employeeId: 3,
        departmentId: 9,
        quantity: 50,
        co2eValue: 134.5,
      }),
    );
  });

  it('skips an expense with a matched rule but no usable quantity', async () => {
    prisma.expenseRecord.findUnique.mockResolvedValue({
      id: 20,
      productId: 5,
      accountId: 7,
      quantity: null,
      amount: 500,
    });
    assignationMatch.findBestMatch.mockResolvedValue({ emissionFactorId: 1 });
    emissionFactorsService.findOne.mockResolvedValue(factorDto());

    await service.onExpensePosted({
      expenseId: 20,
      employeeId: 3,
      postedAt: new Date('2026-02-01'),
    });

    expect(prisma.emittedEmission.create).not.toHaveBeenCalled();
  });
});
