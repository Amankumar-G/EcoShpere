import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CsrActivity, EmployeeParticipation } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { EsgConfigService } from '../esg-config/esg-config.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EsgEvents } from '../../common/events/esg.events';
import type { AuthUser } from '../auth/interfaces/jwt-payload.interface';
import {
  CreateCsrActivityDto,
  CsrActivityResponseDto,
  JoinCsrActivityDto,
  ParticipationResponseDto,
  UpdateCsrActivityDto,
} from './dto/csr-activity.dto';

type ParticipationWithRefs = EmployeeParticipation & {
  csrActivity: CsrActivity;
  employee: { id: number; name: string };
};

@Injectable()
export class CsrActivitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly esgConfig: EsgConfigService,
    private readonly notifications: NotificationsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async list(): Promise<CsrActivityResponseDto[]> {
    const activities = await this.prisma.csrActivity.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return activities.map(toActivityResponse);
  }

  async findOne(id: number): Promise<CsrActivityResponseDto> {
    return toActivityResponse(await this.findActivityOrThrow(id));
  }

  async create(dto: CreateCsrActivityDto): Promise<CsrActivityResponseDto> {
    const created = await this.prisma.csrActivity.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        categoryId: dto.categoryId ?? null,
        departmentId: dto.departmentId ?? null,
        points: dto.points ?? 0,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        status: dto.status ?? 'draft',
      },
    });
    return toActivityResponse(created);
  }

  async update(
    id: number,
    dto: UpdateCsrActivityDto,
  ): Promise<CsrActivityResponseDto> {
    await this.findActivityOrThrow(id);
    const updated = await this.prisma.csrActivity.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        categoryId: dto.categoryId,
        departmentId: dto.departmentId,
        points: dto.points,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        status: dto.status,
      },
    });
    return toActivityResponse(updated);
  }

  async remove(id: number): Promise<void> {
    await this.findActivityOrThrow(id);
    await this.prisma.csrActivity.delete({ where: { id } });
  }

  async join(
    activityId: number,
    actor: AuthUser,
    dto: JoinCsrActivityDto,
  ): Promise<ParticipationResponseDto> {
    await this.findActivityOrThrow(activityId);
    const participation = await this.prisma.employeeParticipation.upsert({
      where: {
        employeeId_csrActivityId: {
          employeeId: actor.id,
          csrActivityId: activityId,
        },
      },
      create: {
        employeeId: actor.id,
        csrActivityId: activityId,
        proofUrl: dto.proofUrl ?? null,
      },
      update: { proofUrl: dto.proofUrl ?? undefined },
      include: {
        csrActivity: true,
        employee: { select: { id: true, name: true } },
      },
    });
    return toParticipationResponse(participation);
  }

  async listParticipations(
    activityId?: number,
  ): Promise<ParticipationResponseDto[]> {
    const participations = await this.prisma.employeeParticipation.findMany({
      where: activityId ? { csrActivityId: activityId } : undefined,
      include: {
        csrActivity: true,
        employee: { select: { id: true, name: true } },
      },
      orderBy: { id: 'desc' },
    });
    return participations.map(toParticipationResponse);
  }

  async myParticipations(actor: AuthUser): Promise<ParticipationResponseDto[]> {
    const participations = await this.prisma.employeeParticipation.findMany({
      where: { employeeId: actor.id },
      include: {
        csrActivity: true,
        employee: { select: { id: true, name: true } },
      },
      orderBy: { id: 'desc' },
    });
    return participations.map(toParticipationResponse);
  }

  async approve(participationId: number): Promise<ParticipationResponseDto> {
    const participation = await this.findParticipationOrThrow(participationId);
    if (participation.approvalStatus === 'approved') {
      throw new ConflictException('Participation is already approved');
    }

    const evidenceRequired = await this.esgConfig.get<boolean>(
      'evidence_required_for_approval',
    );
    if (evidenceRequired && !participation.proofUrl) {
      throw new BadRequestException(
        'A proof file is required before this participation can be approved',
      );
    }

    const points = participation.csrActivity.points;
    const updated = await this.prisma.$transaction(async (tx) => {
      const next = await tx.employeeParticipation.update({
        where: { id: participationId },
        data: {
          approvalStatus: 'approved',
          pointsEarned: points,
          completionDate: new Date(),
        },
        include: {
          csrActivity: true,
          employee: { select: { id: true, name: true } },
        },
      });
      await tx.employee.update({
        where: { id: participation.employeeId },
        data: { points: { increment: points } },
      });
      return next;
    });

    this.eventEmitter.emit(EsgEvents.EmployeePointsChanged, {
      employeeId: participation.employeeId,
    });
    await this.notifications.create({
      employeeId: participation.employeeId,
      type: 'approval_decision',
      payload: {
        module: 'csr',
        decision: 'approved',
        csrActivityId: participation.csrActivityId,
        pointsEarned: points,
      },
    });
    return toParticipationResponse(updated);
  }

  async reject(participationId: number): Promise<ParticipationResponseDto> {
    const participation = await this.findParticipationOrThrow(participationId);
    if (participation.approvalStatus === 'approved') {
      throw new ConflictException('Cannot reject an approved participation');
    }
    const updated = await this.prisma.employeeParticipation.update({
      where: { id: participationId },
      data: { approvalStatus: 'rejected' },
      include: {
        csrActivity: true,
        employee: { select: { id: true, name: true } },
      },
    });
    await this.notifications.create({
      employeeId: participation.employeeId,
      type: 'approval_decision',
      payload: {
        module: 'csr',
        decision: 'rejected',
        csrActivityId: participation.csrActivityId,
      },
    });
    return toParticipationResponse(updated);
  }

  private async findActivityOrThrow(id: number): Promise<CsrActivity> {
    const activity = await this.prisma.csrActivity.findUnique({
      where: { id },
    });
    if (!activity) {
      throw new NotFoundException(`CSR activity ${id} not found`);
    }
    return activity;
  }

  private async findParticipationOrThrow(
    id: number,
  ): Promise<ParticipationWithRefs> {
    const participation = await this.prisma.employeeParticipation.findUnique({
      where: { id },
      include: {
        csrActivity: true,
        employee: { select: { id: true, name: true } },
      },
    });
    if (!participation) {
      throw new NotFoundException(`Participation ${id} not found`);
    }
    return participation;
  }
}

function toActivityResponse(activity: CsrActivity): CsrActivityResponseDto {
  return {
    id: activity.id,
    title: activity.title,
    description: activity.description,
    categoryId: activity.categoryId,
    departmentId: activity.departmentId,
    points: activity.points,
    startDate: activity.startDate,
    endDate: activity.endDate,
    status: activity.status,
    createdAt: activity.createdAt,
  };
}

function toParticipationResponse(
  participation: ParticipationWithRefs,
): ParticipationResponseDto {
  return {
    id: participation.id,
    employeeId: participation.employeeId,
    employeeName: participation.employee.name,
    csrActivityId: participation.csrActivityId,
    csrActivityTitle: participation.csrActivity.title,
    proofUrl: participation.proofUrl,
    approvalStatus: participation.approvalStatus,
    pointsEarned: participation.pointsEarned,
    completionDate: participation.completionDate,
  };
}
