import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ExpensePostedEvent,
  PostingEvents,
} from '../../common/events/posting.events';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';

@Injectable()
export class ExpenseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  create(dto: CreateExpenseDto) {
    return this.prisma.expenseRecord.create({
      data: {
        employeeId: dto.employeeId,
        date: new Date(dto.date),
        accountId: dto.accountId ?? null,
        productId: dto.productId ?? null,
        description: dto.description ?? null,
        quantity: dto.quantity ?? null,
        uom: dto.uom ?? null,
        amount: dto.amount,
      },
    });
  }

  findAll() {
    return this.prisma.expenseRecord.findMany({ orderBy: { date: 'desc' } });
  }

  async findOne(id: number) {
    const expense = await this.prisma.expenseRecord.findUnique({
      where: { id },
    });
    if (!expense) {
      throw new NotFoundException(`Expense ${id} not found`);
    }
    return expense;
  }

  async update(id: number, dto: UpdateExpenseDto) {
    const expense = await this.findOne(id);
    if (expense.status !== 'draft') {
      throw new ConflictException('Only a draft expense can be edited');
    }
    return this.prisma.expenseRecord.update({
      where: { id },
      data: {
        date: dto.date ? new Date(dto.date) : undefined,
        accountId: dto.accountId,
        productId: dto.productId,
        description: dto.description,
        quantity: dto.quantity,
        uom: dto.uom,
        amount: dto.amount,
      },
    });
  }

  async remove(id: number) {
    const expense = await this.findOne(id);
    if (expense.status !== 'draft') {
      throw new ConflictException('Only a draft expense can be deleted');
    }
    return this.prisma.expenseRecord.delete({ where: { id } });
  }

  /** Employee submits a draft for manager approval. */
  submit(id: number) {
    return this.transition(id, 'draft', 'submitted');
  }

  /** Manager approves a submitted expense. */
  approve(id: number) {
    return this.transition(id, 'submitted', 'approved');
  }

  /** Manager rejects a submitted expense. */
  reject(id: number) {
    return this.transition(id, 'submitted', 'rejected');
  }

  /**
   * Post an approved expense: mark it final and emit the domain event the
   * Phase 2 accounting capture path subscribes to.
   */
  async post(id: number) {
    const expense = await this.findOne(id);
    if (expense.status !== 'approved') {
      throw new ConflictException(
        `Only an approved expense can be posted (current: ${expense.status})`,
      );
    }

    const postedAt = new Date();
    const posted = await this.prisma.expenseRecord.update({
      where: { id },
      data: { status: 'posted', postedAt },
    });

    const event: ExpensePostedEvent = {
      expenseId: id,
      employeeId: expense.employeeId,
      postedAt,
    };
    this.eventEmitter.emit(PostingEvents.ExpensePosted, event);

    return posted;
  }

  private async transition(id: number, from: string, to: string) {
    const expense = await this.findOne(id);
    if (expense.status !== from) {
      throw new ConflictException(
        `Cannot move expense from ${expense.status} to ${to}`,
      );
    }
    return this.prisma.expenseRecord.update({
      where: { id },
      data: { status: to },
    });
  }
}
