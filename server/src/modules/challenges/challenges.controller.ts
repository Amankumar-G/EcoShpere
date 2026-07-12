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
  Query,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/jwt-payload.interface';
import { ChallengesService } from './challenges.service';
import {
  CreateChallengeDto,
  JoinChallengeDto,
  UpdateChallengeDto,
} from './dto/challenge.dto';

@Controller('challenges')
@Auth()
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  @Get()
  list() {
    return this.challengesService.list();
  }

  @Get('participations/mine')
  myParticipations(@CurrentUser() actor: AuthUser) {
    return this.challengesService.myParticipations(actor);
  }

  @Get('participations')
  @Auth(Role.admin, Role.manager)
  listParticipations(@Query('challengeId') challengeId?: string) {
    return this.challengesService.listParticipations(
      challengeId ? Number(challengeId) : undefined,
    );
  }

  @Post('participations/:id/approve')
  @Auth(Role.admin, Role.manager)
  @HttpCode(HttpStatus.OK)
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.challengesService.approve(id);
  }

  @Post('participations/:id/reject')
  @Auth(Role.admin, Role.manager)
  @HttpCode(HttpStatus.OK)
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.challengesService.reject(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.challengesService.findOne(id);
  }

  @Post(':id/join')
  @HttpCode(HttpStatus.OK)
  join(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() actor: AuthUser,
    @Body() dto: JoinChallengeDto,
  ) {
    return this.challengesService.join(id, actor, dto);
  }

  @Post()
  @Auth(Role.admin, Role.manager)
  create(@Body() dto: CreateChallengeDto) {
    return this.challengesService.create(dto);
  }

  @Patch(':id')
  @Auth(Role.admin, Role.manager)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateChallengeDto,
  ) {
    return this.challengesService.update(id, dto);
  }

  @Delete(':id')
  @Auth(Role.admin, Role.manager)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.challengesService.remove(id);
  }
}
