import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { EmissionSourceType, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../auth/interfaces/jwt-payload.interface';
import { DepartmentScopeService } from '../departments/department-scope.service';
import { EmissionFactorResponseDto } from '../emission-factors/dto/emission-factor-response.dto';
import { EmissionFactorsService } from '../emission-factors/emission-factors.service';
import { EmissionScopeTreeService } from '../emission-scopes/emission-scope-tree.service';
import { CreateEmittedEmissionDto } from './dto/create-emitted-emission.dto';
import { EmittedEmissionResponseDto } from './dto/emitted-emission-response.dto';
import { FootprintGroupBy, FootprintQueryDto } from './dto/footprint-query.dto';
import { FootprintGroupResponseDto } from './dto/footprint-response.dto';
import { ListEmittedEmissionsQueryDto } from './dto/list-emitted-emissions-query.dto';

const EMITTED_EMISSION_WITH_RELATIONS = {
  include: {
    emissionFactor: { include: { scope: true } },
    department: true,
  },
} satisfies Prisma.EmittedEmissionDefaultArgs;

type EmittedEmissionWithRelations = Prisma.EmittedEmissionGetPayload<
  typeof EMITTED_EMISSION_WITH_RELATIONS
>;

interface ScopedFilters {
  scopeId?: number;
  departmentId?: number;
  from?: Date;
  to?: Date;
}

@Injectable()
export class EmittedEmissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emissionFactorsService: EmissionFactorsService,
    private readonly departmentScope: DepartmentScopeService,
    private readonly scopeTree: EmissionScopeTreeService,
  ) {}

  async create(
    actor: AuthUser,
    dto: CreateEmittedEmissionDto,
  ): Promise<EmittedEmissionResponseDto> {
    assertPositiveQuantity(dto.quantity);
    const factor = await this.emissionFactorsService.findOne(
      dto.emissionFactorId,
    );
    assertFactorHasGasLines(factor);
    await this.assertDepartmentInScope(actor, dto.departmentId);

    const created = await this.prisma.emittedEmission.create({
      data: {
        name: dto.name,
        departmentId: dto.departmentId,
        sourceType: EmissionSourceType.manual,
        emissionFactorId: dto.emissionFactorId,
        quantity: dto.quantity,
        co2eValue: dto.quantity * factor.value,
        date: dto.date,
        evidenceUrl: dto.evidenceUrl,
      },
    });
    return toEmittedEmissionResponse(created);
  }

  async list(
    actor: AuthUser,
    query: ListEmittedEmissionsQueryDto,
  ): Promise<EmittedEmissionResponseDto[]> {
    const where = await this.buildScopedWhere(actor, query);
    if (query.sourceType !== undefined) {
      where.sourceType = query.sourceType;
    }

    const emissions = await this.prisma.emittedEmission.findMany({ where });
    return emissions.map(toEmittedEmissionResponse);
  }

  async footprint(
    actor: AuthUser,
    query: FootprintQueryDto,
  ): Promise<FootprintGroupResponseDto[]> {
    const where = await this.buildScopedWhere(actor, query);
    const emissions = await this.prisma.emittedEmission.findMany({
      where,
      ...EMITTED_EMISSION_WITH_RELATIONS,
    });
    return groupEmissionsByDimension(emissions, query.groupBy);
  }

  private async buildScopedWhere(
    actor: AuthUser,
    filters: ScopedFilters,
  ): Promise<Prisma.EmittedEmissionWhereInput> {
    const where: Prisma.EmittedEmissionWhereInput = {};

    const dateRange = buildDateRange(filters.from, filters.to);
    if (dateRange) {
      where.date = dateRange;
    }

    if (filters.scopeId !== undefined) {
      const scopeIds = await this.scopeTree.resolveSubtreeIds(filters.scopeId);
      where.emissionFactor = { scopeId: { in: scopeIds } };
    }

    const departmentIds = await this.resolveDepartmentFilter(
      actor,
      filters.departmentId,
    );
    if (departmentIds !== null) {
      where.departmentId = { in: departmentIds };
    }

    return where;
  }

  private async resolveDepartmentFilter(
    actor: AuthUser,
    departmentId?: number,
  ): Promise<number[] | null> {
    if (actor.role === Role.admin) {
      return departmentId === undefined ? null : [departmentId];
    }

    const subtreeIds = await this.departmentScope.resolveSubtreeIds(
      actor.departmentId ?? -1,
    );
    if (departmentId === undefined) {
      return subtreeIds;
    }
    return subtreeIds.includes(departmentId) ? [departmentId] : [];
  }

  private async assertDepartmentInScope(
    actor: AuthUser,
    departmentId: number,
  ): Promise<void> {
    if (actor.role === Role.admin) {
      return;
    }

    const subtreeIds = await this.departmentScope.resolveSubtreeIds(
      actor.departmentId ?? -1,
    );
    if (!subtreeIds.includes(departmentId)) {
      throw new ForbiddenException(
        'Department is outside your managed subtree',
      );
    }
  }
}

function assertPositiveQuantity(quantity: number): void {
  if (quantity <= 0) {
    throw new BadRequestException('Quantity must be greater than zero');
  }
}

function assertFactorHasGasLines(factor: EmissionFactorResponseDto): void {
  if (factor.gasLines.length === 0) {
    throw new BadRequestException(
      'Emission factor has no gas lines and cannot be used for a manual entry',
    );
  }
}

function buildDateRange(
  from?: Date,
  to?: Date,
): Prisma.DateTimeFilter | undefined {
  if (!from && !to) {
    return undefined;
  }
  const range: Prisma.DateTimeFilter = {};
  if (from) {
    range.gte = from;
  }
  if (to) {
    range.lte = to;
  }
  return range;
}

function groupEmissionsByDimension(
  emissions: EmittedEmissionWithRelations[],
  groupBy: FootprintGroupBy,
): FootprintGroupResponseDto[] {
  const totals = new Map<string, FootprintGroupResponseDto>();

  for (const emission of emissions) {
    const { key, label } = resolveGroupKey(emission, groupBy);
    const co2eValue = Number(emission.co2eValue);
    const existing = totals.get(String(key));
    if (existing) {
      existing.co2eValue += co2eValue;
    } else {
      totals.set(String(key), { key, label, co2eValue });
    }
  }

  return Array.from(totals.values());
}

function resolveGroupKey(
  emission: EmittedEmissionWithRelations,
  groupBy: FootprintGroupBy,
): { key: number | string; label: string } {
  if (groupBy === 'scope') {
    return {
      key: emission.emissionFactor.scope.id,
      label: emission.emissionFactor.scope.name,
    };
  }
  if (groupBy === 'department') {
    return { key: emission.departmentId, label: emission.department.name };
  }
  const period = formatPeriod(emission.date);
  return { key: period, label: period };
}

function formatPeriod(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function toEmittedEmissionResponse(
  emission: Prisma.EmittedEmissionGetPayload<Record<string, never>>,
): EmittedEmissionResponseDto {
  return {
    id: emission.id,
    name: emission.name,
    departmentId: emission.departmentId,
    sourceType: emission.sourceType,
    sourceRefId: emission.sourceRefId,
    emissionFactorId: emission.emissionFactorId,
    employeeId: emission.employeeId,
    quantity: Number(emission.quantity),
    co2eValue: Number(emission.co2eValue),
    periodStart: emission.periodStart,
    periodEnd: emission.periodEnd,
    date: emission.date,
    evidenceUrl: emission.evidenceUrl,
    createdAt: emission.createdAt,
  };
}
