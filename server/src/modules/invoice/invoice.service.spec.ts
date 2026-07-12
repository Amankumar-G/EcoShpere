import { ConflictException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PostingEvents } from '../../common/events/posting.events';
import { PrismaService } from '../../prisma/prisma.service';
import { InvoiceService } from './invoice.service';

function invoiceRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 1,
    partnerId: 7,
    date: new Date('2026-01-01'),
    currency: 'EUR',
    status: 'draft',
    postedAt: null,
    lines: [],
    ...overrides,
  };
}

describe('InvoiceService', () => {
  let service: InvoiceService;
  let prisma: {
    invoice: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };
  let eventEmitter: { emit: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    prisma = {
      invoice: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    eventEmitter = { emit: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
  });

  describe('create', () => {
    it('derives each line amount (quantity × unitPrice) and the invoice total', async () => {
      prisma.invoice.create.mockResolvedValue(invoiceRow());

      await service.create({
        partnerId: 7,
        date: '2026-01-01',
        lines: [
          { accountId: 2, quantity: 200, uom: 'ream', unitPrice: 0.9 },
          { accountId: 2, quantity: 3, uom: 'unit', unitPrice: 10 },
        ],
      });

      const data = prisma.invoice.create.mock.calls[0][0].data;
      // 200 × 0.9 = 180, 3 × 10 = 30
      expect(data.lines.create[0].amount.toString()).toBe('180');
      expect(data.lines.create[1].amount.toString()).toBe('30');
      // total = 180 + 30 = 210
      expect(data.totalAmount.toString()).toBe('210');
    });
  });

  describe('update', () => {
    it('rejects editing a posted invoice', async () => {
      prisma.invoice.findUnique.mockResolvedValue(
        invoiceRow({ status: 'posted' }),
      );

      await expect(service.update(1, { partnerId: 9 })).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(prisma.invoice.update).not.toHaveBeenCalled();
    });
  });

  describe('post', () => {
    it('marks the invoice posted and emits invoice.posted', async () => {
      prisma.invoice.findUnique.mockResolvedValue(invoiceRow());
      prisma.invoice.update.mockResolvedValue(invoiceRow({ status: 'posted' }));

      await service.post(1);

      expect(prisma.invoice.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: expect.objectContaining({ status: 'posted' }),
        }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        PostingEvents.InvoicePosted,
        expect.objectContaining({ invoiceId: 1, partnerId: 7 }),
      );
    });

    it('refuses to post an already-posted invoice', async () => {
      prisma.invoice.findUnique.mockResolvedValue(
        invoiceRow({ status: 'posted' }),
      );

      await expect(service.post(1)).rejects.toBeInstanceOf(ConflictException);
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('throws when the invoice does not exist', async () => {
      prisma.invoice.findUnique.mockResolvedValue(null);

      await expect(service.post(99)).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
