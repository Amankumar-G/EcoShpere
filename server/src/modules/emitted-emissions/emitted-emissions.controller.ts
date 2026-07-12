import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/jwt-payload.interface';
import { CreateEmittedEmissionDto } from './dto/create-emitted-emission.dto';
import { EmittedEmissionResponseDto } from './dto/emitted-emission-response.dto';
import { FootprintQueryDto } from './dto/footprint-query.dto';
import { FootprintGroupResponseDto } from './dto/footprint-response.dto';
import { ListEmittedEmissionsQueryDto } from './dto/list-emitted-emissions-query.dto';
import { EmittedEmissionsService } from './emitted-emissions.service';

@Controller('emitted-emissions')
export class EmittedEmissionsController {
  constructor(
    private readonly emittedEmissionsService: EmittedEmissionsService,
  ) {}

  @Get()
  @Auth(Role.admin, Role.manager)
  list(
    @CurrentUser() actor: AuthUser,
    @Query() query: ListEmittedEmissionsQueryDto,
  ): Promise<EmittedEmissionResponseDto[]> {
    return this.emittedEmissionsService.list(actor, query);
  }

  @Get('footprint')
  @Auth(Role.admin, Role.manager)
  footprint(
    @CurrentUser() actor: AuthUser,
    @Query() query: FootprintQueryDto,
  ): Promise<FootprintGroupResponseDto[]> {
    return this.emittedEmissionsService.footprint(actor, query);
  }

  @Post()
  @Auth(Role.admin, Role.manager)
  create(
    @CurrentUser() actor: AuthUser,
    @Body() dto: CreateEmittedEmissionDto,
  ): Promise<EmittedEmissionResponseDto> {
    return this.emittedEmissionsService.create(actor, dto);
  }
}
