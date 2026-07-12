import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/jwt-payload.interface';
import { RewardsService } from './rewards.service';
import { CreateRewardDto, UpdateRewardDto } from './dto/reward.dto';

@Controller('rewards')
@Auth()
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get()
  list() {
    return this.rewardsService.list();
  }

  @Get('redemptions/mine')
  myRedemptions(@CurrentUser() actor: AuthUser) {
    return this.rewardsService.listRedemptions(actor.id);
  }

  @Get('redemptions')
  @Auth(Role.admin, Role.manager)
  listRedemptions() {
    return this.rewardsService.listRedemptions();
  }

  @Post(':id/redeem')
  @HttpCode(HttpStatus.OK)
  redeem(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.rewardsService.redeem(id, actor);
  }

  @Post()
  @Auth(Role.admin)
  create(@Body() dto: CreateRewardDto) {
    return this.rewardsService.create(dto);
  }

  @Patch(':id')
  @Auth(Role.admin)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRewardDto) {
    return this.rewardsService.update(id, dto);
  }

  @Delete(':id')
  @Auth(Role.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rewardsService.remove(id);
  }
}
