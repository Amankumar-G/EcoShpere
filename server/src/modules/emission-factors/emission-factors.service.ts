import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmissionFactorDto } from './dto/create-emission-factor.dto';
import { CreateGasLineDto } from './dto/create-gas-line.dto';
import {
  EmissionFactorResponseDto,
  GasLineResponseDto,
} from './dto/emission-factor-response.dto';
import { UpdateEmissionFactorDto } from './dto/update-emission-factor.dto';
import { UpdateGasLineDto } from './dto/update-gas-line.dto';

const EMISSION_FACTOR_WITH_RELATIONS = {
  include: {
    scope: true,
    sourceDatabase: true,
    gasLines: { include: { gas: true } },
  },
} satisfies Prisma.EmissionFactorDefaultArgs;

type EmissionFactorWithRelations = Prisma.EmissionFactorGetPayload<
  typeof EMISSION_FACTOR_WITH_RELATIONS
>;

@Injectable()
export class EmissionFactorsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    scopeId?: number,
    sourceDatabaseId?: number,
  ): Promise<EmissionFactorResponseDto[]> {
    const factors = await this.prisma.emissionFactor.findMany({
      where: { scopeId, sourceDatabaseId },
      ...EMISSION_FACTOR_WITH_RELATIONS,
    });
    return factors.map(toEmissionFactorResponse);
  }

  async findOne(id: number): Promise<EmissionFactorResponseDto> {
    const factor = await this.findByIdOrThrow(id);
    return toEmissionFactorResponse(factor);
  }

  async create(
    dto: CreateEmissionFactorDto,
  ): Promise<EmissionFactorResponseDto> {
    const created = await this.prisma.emissionFactor.create({
      data: {
        name: dto.name,
        scopeId: dto.scopeId,
        sourceDatabaseId: dto.sourceDatabaseId,
        computeMethod: dto.computeMethod,
        unitOfMeasure: dto.unitOfMeasure,
        uncertainty: dto.uncertainty,
        status: dto.status,
      },
      ...EMISSION_FACTOR_WITH_RELATIONS,
    });
    return toEmissionFactorResponse(created);
  }

  async update(
    id: number,
    dto: UpdateEmissionFactorDto,
  ): Promise<EmissionFactorResponseDto> {
    await this.findByIdOrThrow(id);
    const updated = await this.prisma.emissionFactor.update({
      where: { id },
      data: {
        name: dto.name,
        scopeId: dto.scopeId,
        sourceDatabaseId: dto.sourceDatabaseId,
        computeMethod: dto.computeMethod,
        unitOfMeasure: dto.unitOfMeasure,
        uncertainty: dto.uncertainty,
        status: dto.status,
      },
      ...EMISSION_FACTOR_WITH_RELATIONS,
    });
    return toEmissionFactorResponse(updated);
  }

  async remove(id: number): Promise<void> {
    await this.findByIdOrThrow(id);
    await this.prisma.emissionFactor.delete({ where: { id } });
  }

  async addGasLine(
    factorId: number,
    dto: CreateGasLineDto,
  ): Promise<GasLineResponseDto> {
    await this.findByIdOrThrow(factorId);
    this.assertPositiveValue(dto.value);

    const line = await this.prisma.emissionFactorGasLine.create({
      data: {
        emissionFactorId: factorId,
        gasId: dto.gasId,
        activityType: dto.activityType,
        value: dto.value,
        unit: dto.unit,
      },
      include: { gas: true },
    });
    await this.recomputeValue(factorId);
    return toGasLineResponse(line);
  }

  async updateGasLine(
    factorId: number,
    lineId: number,
    dto: UpdateGasLineDto,
  ): Promise<GasLineResponseDto> {
    await this.findGasLineOrThrow(factorId, lineId);
    if (dto.value !== undefined) {
      this.assertPositiveValue(dto.value);
    }

    const line = await this.prisma.emissionFactorGasLine.update({
      where: { id: lineId },
      data: {
        gasId: dto.gasId,
        activityType: dto.activityType,
        value: dto.value,
        unit: dto.unit,
      },
      include: { gas: true },
    });
    await this.recomputeValue(factorId);
    return toGasLineResponse(line);
  }

  async removeGasLine(factorId: number, lineId: number): Promise<void> {
    await this.findGasLineOrThrow(factorId, lineId);
    await this.prisma.emissionFactorGasLine.delete({ where: { id: lineId } });
    await this.recomputeValue(factorId);
  }

  async recomputeFactorsForGas(gasId: number): Promise<void> {
    const factors = await this.prisma.emissionFactor.findMany({
      where: { gasLines: { some: { gasId } } },
      select: { id: true },
    });
    for (const factor of factors) {
      await this.recomputeValue(factor.id);
    }
  }

  private assertPositiveValue(value: number): void {
    if (value <= 0) {
      throw new BadRequestException('Gas line value must be positive');
    }
  }

  private async recomputeValue(factorId: number): Promise<void> {
    const lines = await this.prisma.emissionFactorGasLine.findMany({
      where: { emissionFactorId: factorId },
      include: { gas: true },
    });

    const total = lines.reduce(
      (sum, line) => sum + Number(line.value) * Number(line.gas.gwp),
      0,
    );

    await this.prisma.emissionFactor.update({
      where: { id: factorId },
      data: { value: roundToFourDecimals(total) },
    });
  }

  private async findByIdOrThrow(
    id: number,
  ): Promise<EmissionFactorWithRelations> {
    const factor = await this.prisma.emissionFactor.findUnique({
      where: { id },
      ...EMISSION_FACTOR_WITH_RELATIONS,
    });
    if (!factor) {
      throw new NotFoundException(`Emission factor ${id} not found`);
    }
    return factor;
  }

  private async findGasLineOrThrow(factorId: number, lineId: number) {
    const line = await this.prisma.emissionFactorGasLine.findUnique({
      where: { id: lineId },
    });
    if (!line || line.emissionFactorId !== factorId) {
      throw new NotFoundException(
        `Gas line ${lineId} not found on emission factor ${factorId}`,
      );
    }
    return line;
  }
}

function roundToFourDecimals(value: number): number {
  return Math.round(value * 10000) / 10000;
}

function toEmissionFactorResponse(
  factor: EmissionFactorWithRelations,
): EmissionFactorResponseDto {
  return {
    id: factor.id,
    name: factor.name,
    scopeId: factor.scopeId,
    scope: {
      id: factor.scope.id,
      name: factor.scope.name,
      code: factor.scope.code,
    },
    sourceDatabaseId: factor.sourceDatabaseId,
    sourceDatabase: {
      id: factor.sourceDatabase.id,
      name: factor.sourceDatabase.name,
    },
    uncertainty:
      factor.uncertainty === null ? null : Number(factor.uncertainty),
    computeMethod: factor.computeMethod,
    unitOfMeasure: factor.unitOfMeasure,
    status: factor.status,
    value: Number(factor.value),
    gasLines: factor.gasLines.map(toGasLineResponse),
  };
}

function toGasLineResponse(
  line: Prisma.EmissionFactorGasLineGetPayload<{ include: { gas: true } }>,
): GasLineResponseDto {
  return {
    id: line.id,
    emissionFactorId: line.emissionFactorId,
    gasId: line.gasId,
    gas: {
      id: line.gas.id,
      name: line.gas.name,
      symbol: line.gas.symbol,
      gwp: Number(line.gas.gwp),
    },
    activityType: line.activityType,
    value: Number(line.value),
    unit: line.unit,
  };
}
