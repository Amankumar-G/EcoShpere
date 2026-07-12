import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import {
  InvoicePostedEvent,
  PostingEvents,
} from '../../common/events/posting.events';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateInvoiceDto,
  InvoiceLineDto,
  UpdateInvoiceDto,
} from './dto/invoice.dto';

@Injectable()
export class InvoiceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /** Derive each line's amount (quantity × unitPrice) so totals are never client-trusted. */
  private buildLines(lines: InvoiceLineDto[]) {
    return lines.map((line) => {
      const quantity = new Prisma.Decimal(line.quantity);
      const unitPrice = new Prisma.Decimal(line.unitPrice);
      return {
        productId: line.productId ?? null,
        accountId: line.accountId,
        description: line.description ?? null,
        quantity,
        uom: line.uom,
        unitPrice,
        amount: quantity.mul(unitPrice),
      };
    });
  }

  private totalOf(lines: { amount: Prisma.Decimal }[]) {
    return lines.reduce(
      (sum, line) => sum.add(line.amount),
      new Prisma.Decimal(0),
    );
  }

  create(dto: CreateInvoiceDto) {
    const lines = this.buildLines(dto.lines);
    return this.prisma.invoice.create({
      data: {
        partnerId: dto.partnerId,
        date: new Date(dto.date),
        currency: dto.currency ?? 'EUR',
        totalAmount: this.totalOf(lines),
        lines: { create: lines },
      },
      include: { lines: true },
    });
  }

  findAll() {
    return this.prisma.invoice.findMany({
      orderBy: { date: 'desc' },
      include: { lines: true },
    });
  }

  async findOne(id: number) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { lines: true },
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice ${id} not found`);
    }
    return invoice;
  }

  async update(id: number, dto: UpdateInvoiceDto) {
    const invoice = await this.findOne(id);
    if (invoice.status === 'posted') {
      throw new ConflictException('A posted invoice can no longer be edited');
    }

    const lines = dto.lines ? this.buildLines(dto.lines) : undefined;
    return this.prisma.invoice.update({
      where: { id },
      data: {
        partnerId: dto.partnerId,
        date: dto.date ? new Date(dto.date) : undefined,
        currency: dto.currency,
        ...(lines
          ? {
              totalAmount: this.totalOf(lines),
              lines: { deleteMany: {}, create: lines },
            }
          : {}),
      },
      include: { lines: true },
    });
  }

  async remove(id: number) {
    const invoice = await this.findOne(id);
    if (invoice.status === 'posted') {
      throw new ConflictException('A posted invoice can no longer be deleted');
    }
    return this.prisma.invoice.delete({ where: { id } });
  }

  /**
   * Post an invoice: mark it final and emit the domain event the Phase 2
   * accounting capture path subscribes to. Posting is idempotent-guarded — a
   * posted invoice cannot be posted again.
   */
  async post(id: number) {
    const invoice = await this.findOne(id);
    if (invoice.status === 'posted') {
      throw new ConflictException('Invoice is already posted');
    }

    const postedAt = new Date();
    const posted = await this.prisma.invoice.update({
      where: { id },
      data: { status: 'posted', postedAt },
      include: { lines: true },
    });

    const event: InvoicePostedEvent = {
      invoiceId: id,
      partnerId: invoice.partnerId,
      postedAt,
    };
    this.eventEmitter.emit(PostingEvents.InvoicePosted, event);

    return posted;
  }
}
