import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Challenge, ChallengeParticipation } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { EsgConfigService } from '../esg-config/esg-config.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EsgEvents } from '../../common/events/esg.events';
import type { AuthUser } from '../auth/interfaces/jwt-payload.interface';
import {
  ChallengeParticipationResponseDto,
  ChallengeResponseDto,
  CreateChallengeDto,
  JoinChallengeDto,
  UpdateChallengeDto,
} from './dto/challenge.dto';

type ParticipationWithRefs = ChallengeParticipation & {
  challenge: Challenge;
  employee: { id: number; name: string };
};

@Injectable()
export class ChallengesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly esgConfig: EsgConfigService,
    private readonly notifications: NotificationsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async list(): Promise<ChallengeResponseDto[]> {
    const challenges = await this.prisma.challenge.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return challenges.map(toChallengeResponse);
  }

  async findOne(id: number): Promise<ChallengeResponseDto> {
    return toChallengeResponse(await this.findChallengeOrThrow(id));
  }

  async create(dto: CreateChallengeDto): Promise<ChallengeResponseDto> {
    const created = await this.prisma.challenge.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        categoryId: dto.categoryId ?? null,
        xp: dto.xp ?? 0,
        difficulty: dto.difficulty ?? null,
        evidenceRequired: dto.evidenceRequired ?? false,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        status: dto.status ?? 'draft',
      },
    });
    return toChallengeResponse(created);
  }

  async update(
    id: number,
    dto: UpdateChallengeDto,
  ): Promise<ChallengeResponseDto> {
    await this.findChallengeOrThrow(id);
    const updated = await this.prisma.challenge.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        categoryId: dto.categoryId,
        xp: dto.xp,
        difficulty: dto.difficulty,
        evidenceRequired: dto.evidenceRequired,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        status: dto.status,
      },
    });
    return toChallengeResponse(updated);
  }

  async remove(id: number): Promise<void> {
    await this.findChallengeOrThrow(id);
    await this.prisma.challenge.delete({ where: { id } });
  }

  async join(
    challengeId: number,
    actor: AuthUser,
    dto: JoinChallengeDto,
  ): Promise<ChallengeParticipationResponseDto> {
    await this.findChallengeOrThrow(challengeId);
    const participation = await this.prisma.challengeParticipation.upsert({
      where: {
        challengeId_employeeId: { challengeId, employeeId: actor.id },
      },
      create: {
        challengeId,
        employeeId: actor.id,
        progress: dto.progress ?? 0,
        proofUrl: dto.proofUrl ?? null,
      },
      update: {
        progress: dto.progress,
        proofUrl: dto.proofUrl ?? undefined,
      },
      include: {
        challenge: true,
        employee: { select: { id: true, name: true } },
      },
    });
    return toParticipationResponse(participation);
  }

  async listParticipations(
    challengeId?: number,
  ): Promise<ChallengeParticipationResponseDto[]> {
    const participations = await this.prisma.challengeParticipation.findMany({
      where: challengeId ? { challengeId } : undefined,
      include: {
        challenge: true,
        employee: { select: { id: true, name: true } },
      },
      orderBy: { id: 'desc' },
    });
    return participations.map(toParticipationResponse);
  }

  async myParticipations(
    actor: AuthUser,
  ): Promise<ChallengeParticipationResponseDto[]> {
    const participations = await this.prisma.challengeParticipation.findMany({
      where: { employeeId: actor.id },
      include: {
        challenge: true,
        employee: { select: { id: true, name: true } },
      },
      orderBy: { id: 'desc' },
    });
    return participations.map(toParticipationResponse);
  }

  async approve(
    participationId: number,
  ): Promise<ChallengeParticipationResponseDto> {
    const participation = await this.findParticipationOrThrow(participationId);
    if (participation.approvalStatus === 'approved') {
      throw new ConflictException('Participation is already approved');
    }

    const globalEvidence = await this.esgConfig.get<boolean>(
      'evidence_required_for_approval',
    );
    const requireProof =
      participation.challenge.evidenceRequired || globalEvidence;
    if (requireProof && !participation.proofUrl) {
      throw new BadRequestException(
        'A proof file is required before this challenge can be approved',
      );
    }

    const xp = participation.challenge.xp;
    const updated = await this.prisma.$transaction(async (tx) => {
      const next = await tx.challengeParticipation.update({
        where: { id: participationId },
        data: { approvalStatus: 'approved', xpAwarded: xp, progress: 100 },
        include: {
          challenge: true,
          employee: { select: { id: true, name: true } },
        },
      });
      await tx.employee.update({
        where: { id: participation.employeeId },
        data: { xp: { increment: xp } },
      });
      return next;
    });

    this.eventEmitter.emit(EsgEvents.EmployeeXpChanged, {
      employeeId: participation.employeeId,
    });
    await this.notifications.create({
      employeeId: participation.employeeId,
      type: 'approval_decision',
      payload: {
        module: 'challenge',
        decision: 'approved',
        challengeId: participation.challengeId,
        xpAwarded: xp,
      },
    });
    return toParticipationResponse(updated);
  }

  async reject(
    participationId: number,
  ): Promise<ChallengeParticipationResponseDto> {
    const participation = await this.findParticipationOrThrow(participationId);
    if (participation.approvalStatus === 'approved') {
      throw new ConflictException('Cannot reject an approved participation');
    }
    const updated = await this.prisma.challengeParticipation.update({
      where: { id: participationId },
      data: { approvalStatus: 'rejected' },
      include: {
        challenge: true,
        employee: { select: { id: true, name: true } },
      },
    });
    await this.notifications.create({
      employeeId: participation.employeeId,
      type: 'approval_decision',
      payload: {
        module: 'challenge',
        decision: 'rejected',
        challengeId: participation.challengeId,
      },
    });
    return toParticipationResponse(updated);
  }

  private async findChallengeOrThrow(id: number): Promise<Challenge> {
    const challenge = await this.prisma.challenge.findUnique({ where: { id } });
    if (!challenge) {
      throw new NotFoundException(`Challenge ${id} not found`);
    }
    return challenge;
  }

  private async findParticipationOrThrow(
    id: number,
  ): Promise<ParticipationWithRefs> {
    const participation = await this.prisma.challengeParticipation.findUnique({
      where: { id },
      include: {
        challenge: true,
        employee: { select: { id: true, name: true } },
      },
    });
    if (!participation) {
      throw new NotFoundException(`Challenge participation ${id} not found`);
    }
    return participation;
  }
}

function toChallengeResponse(challenge: Challenge): ChallengeResponseDto {
  return {
    id: challenge.id,
    title: challenge.title,
    description: challenge.description,
    categoryId: challenge.categoryId,
    xp: challenge.xp,
    difficulty: challenge.difficulty,
    evidenceRequired: challenge.evidenceRequired,
    deadline: challenge.deadline,
    status: challenge.status,
    createdAt: challenge.createdAt,
  };
}

function toParticipationResponse(
  participation: ParticipationWithRefs,
): ChallengeParticipationResponseDto {
  return {
    id: participation.id,
    challengeId: participation.challengeId,
    challengeTitle: participation.challenge.title,
    employeeId: participation.employeeId,
    employeeName: participation.employee.name,
    progress: Number(participation.progress),
    proofUrl: participation.proofUrl,
    approvalStatus: participation.approvalStatus,
    xpAwarded: participation.xpAwarded,
  };
}
