import { Injectable, NotFoundException } from '@nestjs/common';
import { AssignationRule } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AssignationRuleResponseDto } from './dto/assignation-rule-response.dto';
import { CreateAssignationRuleDto } from './dto/create-assignation-rule.dto';
import { UpdateAssignationRuleDto } from './dto/update-assignation-rule.dto';

@Injectable()
export class AssignationRulesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<AssignationRuleResponseDto[]> {
    const rules = await this.prisma.assignationRule.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return rules.map(toResponse);
  }

  async findOne(id: number): Promise<AssignationRuleResponseDto> {
    return toResponse(await this.findByIdOrThrow(id));
  }

  async create(
    dto: CreateAssignationRuleDto,
  ): Promise<AssignationRuleResponseDto> {
    const created = await this.prisma.assignationRule.create({
      data: {
        emissionFactorId: dto.emissionFactorId,
        productId: dto.productId ?? null,
        partnerId: dto.partnerId ?? null,
        accountId: dto.accountId ?? null,
        applicationPeriodStart: dto.applicationPeriodStart ?? null,
        applicationPeriodEnd: dto.applicationPeriodEnd ?? null,
        replaceExisting: dto.replaceExisting ?? false,
      },
    });
    return toResponse(created);
  }

  async update(
    id: number,
    dto: UpdateAssignationRuleDto,
  ): Promise<AssignationRuleResponseDto> {
    await this.findByIdOrThrow(id);
    const updated = await this.prisma.assignationRule.update({
      where: { id },
      data: {
        emissionFactorId: dto.emissionFactorId,
        productId: dto.productId,
        partnerId: dto.partnerId,
        accountId: dto.accountId,
        applicationPeriodStart: dto.applicationPeriodStart,
        applicationPeriodEnd: dto.applicationPeriodEnd,
        replaceExisting: dto.replaceExisting,
      },
    });
    return toResponse(updated);
  }

  async remove(id: number): Promise<void> {
    await this.findByIdOrThrow(id);
    await this.prisma.assignationRule.delete({ where: { id } });
  }

  private async findByIdOrThrow(id: number): Promise<AssignationRule> {
    const rule = await this.prisma.assignationRule.findUnique({
      where: { id },
    });
    if (!rule) {
      throw new NotFoundException(`Assignation rule ${id} not found`);
    }
    return rule;
  }
}

function toResponse(rule: AssignationRule): AssignationRuleResponseDto {
  return {
    id: rule.id,
    emissionFactorId: rule.emissionFactorId,
    productId: rule.productId,
    partnerId: rule.partnerId,
    accountId: rule.accountId,
    applicationPeriodStart: rule.applicationPeriodStart,
    applicationPeriodEnd: rule.applicationPeriodEnd,
    replaceExisting: rule.replaceExisting,
    createdAt: rule.createdAt,
  };
}
