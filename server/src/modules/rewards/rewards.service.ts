import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reward, RewardRedemption } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthUser } from '../auth/interfaces/jwt-payload.interface';
import {
  CreateRewardDto,
  RewardRedemptionResponseDto,
  RewardResponseDto,
  UpdateRewardDto,
} from './dto/reward.dto';

type RedemptionWithReward = RewardRedemption & { reward: Reward };

@Injectable()
export class RewardsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<RewardResponseDto[]> {
    const rewards = await this.prisma.reward.findMany({
      orderBy: { pointsRequired: 'asc' },
    });
    return rewards.map(toRewardResponse);
  }

  async create(dto: CreateRewardDto): Promise<RewardResponseDto> {
    const created = await this.prisma.reward.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        pointsRequired: dto.pointsRequired,
        stock: dto.stock ?? 0,
        status: dto.status ?? 'active',
      },
    });
    return toRewardResponse(created);
  }

  async update(id: number, dto: UpdateRewardDto): Promise<RewardResponseDto> {
    await this.findRewardOrThrow(id);
    const updated = await this.prisma.reward.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        pointsRequired: dto.pointsRequired,
        stock: dto.stock,
        status: dto.status,
      },
    });
    return toRewardResponse(updated);
  }

  async remove(id: number): Promise<void> {
    await this.findRewardOrThrow(id);
    await this.prisma.reward.delete({ where: { id } });
  }

  async listRedemptions(
    employeeId?: number,
  ): Promise<RewardRedemptionResponseDto[]> {
    const redemptions = await this.prisma.rewardRedemption.findMany({
      where: employeeId ? { employeeId } : undefined,
      include: { reward: true },
      orderBy: { redeemedAt: 'desc' },
    });
    return redemptions.map(toRedemptionResponse);
  }

  /**
   * Redeem a reward atomically: validates points and stock, then decrements
   * both inside one transaction. Stock is decremented with a conditional
   * `updateMany (stock >= 1)` so two concurrent redemptions of the last item
   * cannot both succeed — exactly one wins, the other is rejected.
   */
  async redeem(
    rewardId: number,
    actor: AuthUser,
  ): Promise<RewardRedemptionResponseDto> {
    const redemption = await this.prisma.$transaction(async (tx) => {
      const reward = await tx.reward.findUnique({ where: { id: rewardId } });
      if (!reward) {
        throw new NotFoundException(`Reward ${rewardId} not found`);
      }
      if (reward.status !== 'active') {
        throw new BadRequestException('Reward is not available');
      }
      const employee = await tx.employee.findUnique({
        where: { id: actor.id },
      });
      if (!employee) {
        throw new NotFoundException('Employee not found');
      }
      if (employee.points < reward.pointsRequired) {
        throw new BadRequestException('Insufficient points to redeem');
      }

      const stockUpdate = await tx.reward.updateMany({
        where: { id: rewardId, stock: { gte: 1 } },
        data: { stock: { decrement: 1 } },
      });
      if (stockUpdate.count === 0) {
        throw new BadRequestException('Reward is out of stock');
      }

      await tx.employee.update({
        where: { id: actor.id },
        data: { points: { decrement: reward.pointsRequired } },
      });

      return tx.rewardRedemption.create({
        data: {
          employeeId: actor.id,
          rewardId,
          pointsDeducted: reward.pointsRequired,
        },
        include: { reward: true },
      });
    });
    return toRedemptionResponse(redemption);
  }

  private async findRewardOrThrow(id: number): Promise<Reward> {
    const reward = await this.prisma.reward.findUnique({ where: { id } });
    if (!reward) {
      throw new NotFoundException(`Reward ${id} not found`);
    }
    return reward;
  }
}

function toRewardResponse(reward: Reward): RewardResponseDto {
  return {
    id: reward.id,
    name: reward.name,
    description: reward.description,
    pointsRequired: reward.pointsRequired,
    stock: reward.stock,
    status: reward.status,
  };
}

function toRedemptionResponse(
  redemption: RedemptionWithReward,
): RewardRedemptionResponseDto {
  return {
    id: redemption.id,
    employeeId: redemption.employeeId,
    rewardId: redemption.rewardId,
    rewardName: redemption.reward.name,
    pointsDeducted: redemption.pointsDeducted,
    status: redemption.status,
    redeemedAt: redemption.redeemedAt,
  };
}
