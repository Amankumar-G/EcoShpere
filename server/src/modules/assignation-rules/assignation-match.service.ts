import { Injectable } from '@nestjs/common';
import { AssignationRule } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface AssignationMatchCriteria {
  productId?: number | null;
  partnerId?: number | null;
  accountId?: number | null;
  date: Date;
}

@Injectable()
export class AssignationMatchService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Finds the best AssignationRule for a Path A accounting line.
   *
   * A rule matches when every non-null rule attribute (product/partner/account)
   * equals the corresponding criteria value, and the date falls inside the
   * rule's application period (if set). Among matches: rules with
   * `replaceExisting` are considered first (they're meant to override), then
   * ranked by specificity — product > partner > account, then by how many
   * attributes matched, then by newest `createdAt` as the final tie-break.
   */
  async findBestMatch(
    criteria: AssignationMatchCriteria,
  ): Promise<AssignationRule | null> {
    const candidates = await this.prisma.assignationRule.findMany({
      where: {
        OR: [
          { productId: null },
          { productId: criteria.productId ?? undefined },
        ],
        AND: [
          {
            OR: [
              { partnerId: null },
              { partnerId: criteria.partnerId ?? undefined },
            ],
          },
          {
            OR: [
              { accountId: null },
              { accountId: criteria.accountId ?? undefined },
            ],
          },
        ],
      },
    });

    const active = candidates.filter((rule) =>
      isWithinApplicationPeriod(rule, criteria.date),
    );
    const matching = active.filter((rule) => hasAnyAttribute(rule));
    if (matching.length === 0) {
      return null;
    }

    const overrides = matching.filter((rule) => rule.replaceExisting);
    const pool = overrides.length > 0 ? overrides : matching;

    return pool.sort(compareRulesBySpecificity)[0];
  }
}

function hasAnyAttribute(rule: AssignationRule): boolean {
  return (
    rule.productId !== null ||
    rule.partnerId !== null ||
    rule.accountId !== null
  );
}

function isWithinApplicationPeriod(rule: AssignationRule, date: Date): boolean {
  if (rule.applicationPeriodStart && date < rule.applicationPeriodStart) {
    return false;
  }
  if (rule.applicationPeriodEnd && date > rule.applicationPeriodEnd) {
    return false;
  }
  return true;
}

function specificityRank(rule: AssignationRule): number {
  if (rule.productId !== null) return 2;
  if (rule.partnerId !== null) return 1;
  return 0;
}

function attributeCount(rule: AssignationRule): number {
  return [rule.productId, rule.partnerId, rule.accountId].filter(
    (value) => value !== null,
  ).length;
}

function compareRulesBySpecificity(
  a: AssignationRule,
  b: AssignationRule,
): number {
  const rankDiff = specificityRank(b) - specificityRank(a);
  if (rankDiff !== 0) return rankDiff;

  const countDiff = attributeCount(b) - attributeCount(a);
  if (countDiff !== 0) return countDiff;

  return b.createdAt.getTime() - a.createdAt.getTime();
}
