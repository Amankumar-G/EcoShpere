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
import { CsrActivitiesService } from './csr-activities.service';
import {
  CreateCsrActivityDto,
  JoinCsrActivityDto,
  UpdateCsrActivityDto,
} from './dto/csr-activity.dto';

@Controller('csr-activities')
@Auth()
export class CsrActivitiesController {
  constructor(private readonly csrService: CsrActivitiesService) {}

  @Get()
  list() {
    return this.csrService.list();
  }

  @Get('participations/mine')
  myParticipations(@CurrentUser() actor: AuthUser) {
    return this.csrService.myParticipations(actor);
  }

  @Get('participations')
  @Auth(Role.admin, Role.manager)
  listParticipations(@Query('activityId') activityId?: string) {
    return this.csrService.listParticipations(
      activityId ? Number(activityId) : undefined,
    );
  }

  @Post('participations/:id/approve')
  @Auth(Role.admin, Role.manager)
  @HttpCode(HttpStatus.OK)
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.csrService.approve(id);
  }

  @Post('participations/:id/reject')
  @Auth(Role.admin, Role.manager)
  @HttpCode(HttpStatus.OK)
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.csrService.reject(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.csrService.findOne(id);
  }

  @Post(':id/join')
  @HttpCode(HttpStatus.OK)
  join(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() actor: AuthUser,
    @Body() dto: JoinCsrActivityDto,
  ) {
    return this.csrService.join(id, actor, dto);
  }

  @Post()
  @Auth(Role.admin, Role.manager)
  create(@Body() dto: CreateCsrActivityDto) {
    return this.csrService.create(dto);
  }

  @Patch(':id')
  @Auth(Role.admin, Role.manager)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCsrActivityDto,
  ) {
    return this.csrService.update(id, dto);
  }

  @Delete(':id')
  @Auth(Role.admin, Role.manager)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.csrService.remove(id);
  }
}
