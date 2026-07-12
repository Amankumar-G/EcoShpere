import { Test, TestingModule } from '@nestjs/testing';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { PrismaService } from '../../prisma/prisma.service';
import { AssignationMatchService } from './assignation-match.service';

function rule(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 1,
    emissionFactorId: 1,
    productId: null,
    partnerId: null,
    accountId: null,
    applicationPeriodStart: null,
    applicationPeriodEnd: null,
    replaceExisting: false,
    createdAt: new Date('2026-01-01'),
    ...overrides,
  };
}

describe('AssignationMatchService', () => {
  let service: AssignationMatchService;
  let prisma: { assignationRule: { findMany: ReturnType<typeof vi.fn> } };

  beforeEach(async () => {
    prisma = { assignationRule: { findMany: vi.fn() } };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignationMatchService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(AssignationMatchService);
  });

  it('prefers a product-specific rule over a partner-only rule', async () => {
    const productRule = rule({ id: 1, productId: 10 });
    const partnerRule = rule({ id: 2, partnerId: 20 });
    prisma.assignationRule.findMany.mockResolvedValue([
      partnerRule,
      productRule,
    ]);

    const match = await service.findBestMatch({
      productId: 10,
      partnerId: 20,
      accountId: null,
      date: new Date('2026-02-01'),
    });

    expect(match?.id).toBe(1);
  });

  it('prefers a partner-specific rule over an account-only rule', async () => {
    const partnerRule = rule({ id: 2, partnerId: 20 });
    const accountRule = rule({ id: 3, accountId: 30 });
    prisma.assignationRule.findMany.mockResolvedValue([
      accountRule,
      partnerRule,
    ]);

    const match = await service.findBestMatch({
      productId: null,
      partnerId: 20,
      accountId: 30,
      date: new Date('2026-02-01'),
    });

    expect(match?.id).toBe(2);
  });

  it('breaks ties on matched-attribute count within the same specificity bucket', async () => {
    const productOnly = rule({ id: 1, productId: 10 });
    const productAndPartner = rule({ id: 2, productId: 10, partnerId: 20 });
    prisma.assignationRule.findMany.mockResolvedValue([
      productOnly,
      productAndPartner,
    ]);

    const match = await service.findBestMatch({
      productId: 10,
      partnerId: 20,
      accountId: null,
      date: new Date('2026-02-01'),
    });

    expect(match?.id).toBe(2);
  });

  it('breaks final ties on newest createdAt', async () => {
    const older = rule({
      id: 1,
      productId: 10,
      createdAt: new Date('2026-01-01'),
    });
    const newer = rule({
      id: 2,
      productId: 10,
      createdAt: new Date('2026-03-01'),
    });
    prisma.assignationRule.findMany.mockResolvedValue([older, newer]);

    const match = await service.findBestMatch({
      productId: 10,
      partnerId: null,
      accountId: null,
      date: new Date('2026-04-01'),
    });

    expect(match?.id).toBe(2);
  });

  it('excludes a rule whose application period has ended', async () => {
    const expired = rule({
      id: 1,
      productId: 10,
      applicationPeriodEnd: new Date('2026-01-31'),
    });
    prisma.assignationRule.findMany.mockResolvedValue([expired]);

    const match = await service.findBestMatch({
      productId: 10,
      partnerId: null,
      accountId: null,
      date: new Date('2026-02-01'),
    });

    expect(match).toBeNull();
  });

  it('prefers a replaceExisting rule over a more specific non-overriding rule', async () => {
    const specific = rule({ id: 1, productId: 10, partnerId: 20 });
    const override = rule({ id: 2, accountId: 30, replaceExisting: true });
    prisma.assignationRule.findMany.mockResolvedValue([specific, override]);

    const match = await service.findBestMatch({
      productId: 10,
      partnerId: 20,
      accountId: 30,
      date: new Date('2026-02-01'),
    });

    expect(match?.id).toBe(2);
  });

  it('returns null when no rule has any attribute set', async () => {
    prisma.assignationRule.findMany.mockResolvedValue([rule({ id: 1 })]);

    const match = await service.findBestMatch({
      productId: 10,
      partnerId: null,
      accountId: null,
      date: new Date('2026-02-01'),
    });

    expect(match).toBeNull();
  });
});
