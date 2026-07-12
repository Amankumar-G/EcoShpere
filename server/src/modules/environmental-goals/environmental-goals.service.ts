import { Injectable, NotFoundException } from '@nestjs/common';
import { EnvironmentalGoal } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateEnvironmentalGoalDto,
  EnvironmentalGoalResponseDto,
  UpdateEnvironmentalGoalDto,
} from './dto/environmental-goal.dto';

@Injectable()
export class EnvironmentalGoalsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(departmentId?: number): Promise<EnvironmentalGoalResponseDto[]> {
    const goals = await this.prisma.environmentalGoal.findMany({
      where: departmentId ? { departmentId } : undefined,
      orderBy: { endDate: 'asc' },
    });
    return goals.map(toResponse);
  }

  async findOne(id: number): Promise<EnvironmentalGoalResponseDto> {
    return toResponse(await this.findByIdOrThrow(id));
  }

  async create(
    dto: CreateEnvironmentalGoalDto,
  ): Promise<EnvironmentalGoalResponseDto> {
    const created = await this.prisma.environmentalGoal.create({
      data: {
        departmentId: dto.departmentId ?? null,
        metric: dto.metric,
        targetValue: dto.targetValue,
        unit: dto.unit,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: dto.status ?? 'active',
      },
    });
    return toResponse(created);
  }

  async update(
    id: number,
    dto: UpdateEnvironmentalGoalDto,
  ): Promise<EnvironmentalGoalResponseDto> {
    await this.findByIdOrThrow(id);
    const updated = await this.prisma.environmentalGoal.update({
      where: { id },
      data: {
        departmentId: dto.departmentId,
        metric: dto.metric,
        targetValue: dto.targetValue,
        unit: dto.unit,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        status: dto.status,
      },
    });
    return toResponse(updated);
  }

  async remove(id: number): Promise<void> {
    await this.findByIdOrThrow(id);
    await this.prisma.environmentalGoal.delete({ where: { id } });
  }

  private async findByIdOrThrow(id: number): Promise<EnvironmentalGoal> {
    const goal = await this.prisma.environmentalGoal.findUnique({
      where: { id },
    });
    if (!goal) {
      throw new NotFoundException(`Environmental goal ${id} not found`);
    }
    return goal;
  }
}

function toResponse(goal: EnvironmentalGoal): EnvironmentalGoalResponseDto {
  return {
    id: goal.id,
    departmentId: goal.departmentId,
    metric: goal.metric,
    targetValue: Number(goal.targetValue),
    unit: goal.unit,
    startDate: goal.startDate,
    endDate: goal.endDate,
    status: goal.status,
    createdAt: goal.createdAt,
  };
}
