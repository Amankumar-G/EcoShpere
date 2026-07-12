import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Badge, EmployeeBadge, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { EsgConfigService } from '../esg-config/esg-config.service';
import { NotificationsService } from '../notifications/notifications.service';
import { isUnlockRuleSatisfied } from './badge-unlock.evaluator';
import {
  BadgeResponseDto,
  CreateBadgeDto,
  EmployeeBadgeResponseDto,
  UpdateBadgeDto,
} from './dto/badge.dto';

type EmployeeBadgeWithBadge = EmployeeBadge & { badge: Badge };

@Injectable()
export class BadgesService {
  private readonly logger = new Logger(BadgesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly esgConfig: EsgConfigService,
    private readonly notifications: NotificationsService,
  ) {}

  async list(): Promise<BadgeResponseDto[]> {
    const badges = await this.prisma.badge.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return badges.map(toBadgeResponse);
  }

  async create(dto: CreateBadgeDto): Promise<BadgeResponseDto> {
    const created = await this.prisma.badge.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        unlockRule: dto.unlockRule as unknown as Prisma.InputJsonValue,
        icon: dto.icon ?? null,
        status: dto.status ?? 'active',
      },
    });
    return toBadgeResponse(created);
  }

  async update(id: number, dto: UpdateBadgeDto): Promise<BadgeResponseDto> {
    await this.findBadgeOrThrow(id);
    const updated = await this.prisma.badge.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        unlockRule: dto.unlockRule
          ? (dto.unlockRule as unknown as Prisma.InputJsonValue)
          : undefined,
        icon: dto.icon,
        status: dto.status,
      },
    });
    return toBadgeResponse(updated);
  }

  async remove(id: number): Promise<void> {
    await this.findBadgeOrThrow(id);
    await this.prisma.badge.delete({ where: { id } });
  }

  async listMine(employeeId: number): Promise<EmployeeBadgeResponseDto[]> {
    const employeeBadges = await this.prisma.employeeBadge.findMany({
      where: { employeeId },
      include: { badge: true },
      orderBy: { awardedAt: 'desc' },
    });
    return employeeBadges.map(toEmployeeBadgeResponse);
  }

  /**
   * Re-evaluates every active badge for one employee and grants the ones whose
   * unlock rule is now satisfied. Auto-grants (and notifies) when
   * `badge_auto_award` is on; otherwise queues them as `pending` for manual
   * award. Idempotent via the `@@unique([employeeId, badgeId])` guard.
   */
  async evaluateForEmployee(employeeId: number): Promise<void> {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });
    if (!employee) {
      return;
    }

    const [challengesCompleted, csrCompleted, heldBadges, activeBadges] =
      await Promise.all([
        this.prisma.challengeParticipation.count({
          where: { employeeId, approvalStatus: 'approved' },
        }),
        this.prisma.employeeParticipation.count({
          where: { employeeId, approvalStatus: 'approved' },
        }),
        this.prisma.employeeBadge.findMany({ where: { employeeId } }),
        this.prisma.badge.findMany({ where: { status: 'active' } }),
      ]);

    const metrics = {
      xp: employee.xp,
      points: employee.points,
      challengesCompleted,
      csrCompleted,
    };
    const heldBadgeIds = new Set(heldBadges.map((held) => held.badgeId));
    const autoAward = await this.esgConfig.get<boolean>('badge_auto_award');

    for (const badge of activeBadges) {
      if (heldBadgeIds.has(badge.id)) {
        continue;
      }
      if (!isUnlockRuleSatisfied(badge.unlockRule, metrics)) {
        continue;
      }
      try {
        await this.prisma.employeeBadge.create({
          data: {
            employeeId,
            badgeId: badge.id,
            status: autoAward ? 'awarded' : 'pending',
          },
        });
        if (autoAward) {
          await this.notifications.create({
            employeeId,
            type: 'badge_unlock',
            payload: { badgeId: badge.id, badgeName: badge.name },
          });
        }
      } catch (error) {
        // Unique-violation: badge already granted by a concurrent evaluation.
        this.logger.debug(
          `Skipped duplicate badge ${badge.id} for employee ${employeeId}: ${String(error)}`,
        );
      }
    }
  }

  /** Admin grants (or confirms a pending) badge directly. */
  async manualAward(
    badgeId: number,
    employeeId: number,
  ): Promise<EmployeeBadgeResponseDto> {
    await this.findBadgeOrThrow(badgeId);
    const existing = await this.prisma.employeeBadge.findUnique({
      where: { employeeId_badgeId: { employeeId, badgeId } },
      include: { badge: true },
    });
    if (existing && existing.status === 'awarded') {
      throw new ConflictException('Employee already holds this badge');
    }

    const awarded = await this.prisma.employeeBadge.upsert({
      where: { employeeId_badgeId: { employeeId, badgeId } },
      create: { employeeId, badgeId, status: 'awarded' },
      update: { status: 'awarded', awardedAt: new Date() },
      include: { badge: true },
    });
    await this.notifications.create({
      employeeId,
      type: 'badge_unlock',
      payload: { badgeId, badgeName: awarded.badge.name },
    });
    return toEmployeeBadgeResponse(awarded);
  }

  private async findBadgeOrThrow(id: number): Promise<Badge> {
    const badge = await this.prisma.badge.findUnique({ where: { id } });
    if (!badge) {
      throw new NotFoundException(`Badge ${id} not found`);
    }
    return badge;
  }
}

function toBadgeResponse(badge: Badge): BadgeResponseDto {
  return {
    id: badge.id,
    name: badge.name,
    description: badge.description,
    unlockRule: badge.unlockRule,
    icon: badge.icon,
    status: badge.status,
  };
}

function toEmployeeBadgeResponse(
  employeeBadge: EmployeeBadgeWithBadge,
): EmployeeBadgeResponseDto {
  return {
    id: employeeBadge.id,
    employeeId: employeeBadge.employeeId,
    badgeId: employeeBadge.badgeId,
    badgeName: employeeBadge.badge.name,
    badgeIcon: employeeBadge.badge.icon,
    status: employeeBadge.status,
    awardedAt: employeeBadge.awardedAt,
  };
}
