import { ConflictException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PostingEvents } from '../../common/events/posting.events';
import { PrismaService } from '../../prisma/prisma.service';
import { ExpenseService } from './expense.service';

function expenseRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 1,
    employeeId: 5,
    date: new Date('2026-01-01'),
    accountId: null,
    productId: null,
    description: null,
    quantity: null,
    uom: null,
    amount: 100,
    status: 'draft',
    postedAt: null,
    ...overrides,
  };
}

describe('ExpenseService', () => {
  let service: ExpenseService;
  let prisma: {
    expenseRecord: {
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
      expenseRecord: {
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
        ExpenseService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<ExpenseService>(ExpenseService);
  });

  describe('state machine', () => {
    it('submits a draft → submitted', async () => {
      prisma.expenseRecord.findUnique.mockResolvedValue(expenseRow());
      prisma.expenseRecord.update.mockResolvedValue(
        expenseRow({ status: 'submitted' }),
      );

      await service.submit(1);

      expect(prisma.expenseRecord.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'submitted' },
      });
    });

    it('approves a submitted → approved', async () => {
      prisma.expenseRecord.findUnique.mockResolvedValue(
        expenseRow({ status: 'submitted' }),
      );
      prisma.expenseRecord.update.mockResolvedValue(
        expenseRow({ status: 'approved' }),
      );

      await service.approve(1);

      expect(prisma.expenseRecord.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'approved' },
      });
    });

    it('rejects an illegal transition (approve a draft)', async () => {
      prisma.expenseRecord.findUnique.mockResolvedValue(expenseRow());

      await expect(service.approve(1)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(prisma.expenseRecord.update).not.toHaveBeenCalled();
    });

    it('refuses to edit a non-draft expense', async () => {
      prisma.expenseRecord.findUnique.mockResolvedValue(
        expenseRow({ status: 'submitted' }),
      );

      await expect(service.update(1, { amount: 5 })).rejects.toBeInstanceOf(
        ConflictException,
      );
    });
  });

  describe('post', () => {
    it('posts only an approved expense and emits expense.posted', async () => {
      prisma.expenseRecord.findUnique.mockResolvedValue(
        expenseRow({ status: 'approved' }),
      );
      prisma.expenseRecord.update.mockResolvedValue(
        expenseRow({ status: 'posted' }),
      );

      await service.post(1);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        PostingEvents.ExpensePosted,
        expect.objectContaining({ expenseId: 1, employeeId: 5 }),
      );
    });

    it('refuses to post an expense that is not approved', async () => {
      prisma.expenseRecord.findUnique.mockResolvedValue(
        expenseRow({ status: 'submitted' }),
      );

      await expect(service.post(1)).rejects.toBeInstanceOf(ConflictException);
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('throws when the expense does not exist', async () => {
      prisma.expenseRecord.findUnique.mockResolvedValue(null);

      await expect(service.post(42)).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
