import { Injectable, NotFoundException } from '@nestjs/common';
import { Initiative } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateInitiativeDto,
  InitiativeResponseDto,
  UpdateInitiativeDto,
} from './dto/initiative.dto';

@Injectable()
export class InitiativesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(departmentId?: number): Promise<InitiativeResponseDto[]> {
    const initiatives = await this.prisma.initiative.findMany({
      where: departmentId ? { departmentId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return initiatives.map(toResponse);
  }

  async findOne(id: number): Promise<InitiativeResponseDto> {
    return toResponse(await this.findByIdOrThrow(id));
  }

  async create(dto: CreateInitiativeDto): Promise<InitiativeResponseDto> {
    const created = await this.prisma.initiative.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        departmentId: dto.departmentId ?? null,
        assigneeEmployeeId: dto.assigneeEmployeeId ?? null,
        estimatedCo2Reduction: dto.estimatedCo2Reduction ?? null,
        actualCo2Reduction: dto.actualCo2Reduction ?? null,
        progress: dto.progress ?? 0,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        status: dto.status ?? 'open',
      },
    });
    return toResponse(created);
  }

  async update(
    id: number,
    dto: UpdateInitiativeDto,
  ): Promise<InitiativeResponseDto> {
    await this.findByIdOrThrow(id);
    const updated = await this.prisma.initiative.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        departmentId: dto.departmentId,
        assigneeEmployeeId: dto.assigneeEmployeeId,
        estimatedCo2Reduction: dto.estimatedCo2Reduction,
        actualCo2Reduction: dto.actualCo2Reduction,
        progress: dto.progress,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        status: dto.status,
      },
    });
    return toResponse(updated);
  }

  async remove(id: number): Promise<void> {
    await this.findByIdOrThrow(id);
    await this.prisma.initiative.delete({ where: { id } });
  }

  private async findByIdOrThrow(id: number): Promise<Initiative> {
    const initiative = await this.prisma.initiative.findUnique({
      where: { id },
    });
    if (!initiative) {
      throw new NotFoundException(`Initiative ${id} not found`);
    }
    return initiative;
  }
}

function toResponse(initiative: Initiative): InitiativeResponseDto {
  return {
    id: initiative.id,
    title: initiative.title,
    description: initiative.description,
    departmentId: initiative.departmentId,
    assigneeEmployeeId: initiative.assigneeEmployeeId,
    estimatedCo2Reduction:
      initiative.estimatedCo2Reduction === null
        ? null
        : Number(initiative.estimatedCo2Reduction),
    actualCo2Reduction:
      initiative.actualCo2Reduction === null
        ? null
        : Number(initiative.actualCo2Reduction),
    progress: Number(initiative.progress),
    deadline: initiative.deadline,
    status: initiative.status,
    createdAt: initiative.createdAt,
  };
}
