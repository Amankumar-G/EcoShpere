import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmissionSourceType } from '@prisma/client';
import {
  PostingEvents,
  type ExpensePostedEvent,
  type InvoicePostedEvent,
} from '../../common/events/posting.events';
import { PrismaService } from '../../prisma/prisma.service';
import { AssignationMatchService } from '../assignation-rules/assignation-match.service';
import { EmissionFactorsService } from '../emission-factors/emission-factors.service';
import { EsgConfigService } from '../esg-config/esg-config.service';

const AUTO_EMISSION_CALCULATION_KEY = 'auto_emission_calculation';

/**
 * Path A — subscribes to Phase 1 posting events and auto-creates an
 * EmittedEmission when a posted invoice line or expense matches an
 * AssignationRule. Gated by the EsgConfig `auto_emission_calculation` flag.
 */
@Injectable()
export class AccountingCaptureService {
  private readonly logger = new Logger(AccountingCaptureService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly assignationMatch: AssignationMatchService,
    private readonly emissionFactorsService: EmissionFactorsService,
    private readonly esgConfig: EsgConfigService,
  ) {}

  @OnEvent(PostingEvents.InvoicePosted)
  async onInvoicePosted(event: InvoicePostedEvent): Promise<void> {
    if (!(await this.isAutoCalculationEnabled())) {
      return;
    }

    const invoice = await this.prisma.invoice.findUnique({
      where: { id: event.invoiceId },
      include: { lines: true },
    });
    if (!invoice) {
      return;
    }

    for (const line of invoice.lines) {
      const rule = await this.assignationMatch.findBestMatch({
        productId: line.productId,
        partnerId: event.partnerId,
        accountId: line.accountId,
        date: event.postedAt,
      });
      if (!rule) {
        continue;
      }

      const factor = await this.emissionFactorsService.findOne(
        rule.emissionFactorId,
      );
      const quantity =
        factor.computeMethod === 'monetary'
          ? Number(line.amount)
          : Number(line.quantity);
      if (!(quantity > 0)) {
        continue;
      }

      await this.prisma.emittedEmission.create({
        data: {
          name: `Invoice #${invoice.id} line #${line.id}`,
          sourceType: EmissionSourceType.accounting,
          sourceRefId: line.id,
          emissionFactorId: factor.id,
          departmentId: null,
          quantity,
          co2eValue: quantity * factor.value,
          date: event.postedAt,
        },
      });
    }
  }

  @OnEvent(PostingEvents.ExpensePosted)
  async onExpensePosted(event: ExpensePostedEvent): Promise<void> {
    if (!(await this.isAutoCalculationEnabled())) {
      return;
    }

    const expense = await this.prisma.expenseRecord.findUnique({
      where: { id: event.expenseId },
    });
    if (!expense) {
      return;
    }

    const rule = await this.assignationMatch.findBestMatch({
      productId: expense.productId,
      partnerId: null,
      accountId: expense.accountId,
      date: event.postedAt,
    });
    if (!rule) {
      return;
    }

    const factor = await this.emissionFactorsService.findOne(
      rule.emissionFactorId,
    );
    const quantity =
      factor.computeMethod === 'monetary'
        ? Number(expense.amount)
        : Number(expense.quantity ?? 0);
    if (!(quantity > 0)) {
      this.logger.warn(
        `Expense ${expense.id} matched an assignation rule but has no usable ${factor.computeMethod} quantity`,
      );
      return;
    }

    const employee = await this.prisma.employee.findUnique({
      where: { id: event.employeeId },
    });

    await this.prisma.emittedEmission.create({
      data: {
        name: `Expense #${expense.id}`,
        sourceType: EmissionSourceType.accounting,
        sourceRefId: expense.id,
        employeeId: event.employeeId,
        emissionFactorId: factor.id,
        departmentId: employee?.departmentId ?? null,
        quantity,
        co2eValue: quantity * factor.value,
        date: event.postedAt,
      },
    });
  }

  private async isAutoCalculationEnabled(): Promise<boolean> {
    return this.esgConfig.get<boolean>(AUTO_EMISSION_CALCULATION_KEY);
  }
}
