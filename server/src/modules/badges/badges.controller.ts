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
import { BadgesService } from './badges.service';
import {
  CreateBadgeDto,
  ManualAwardDto,
  UpdateBadgeDto,
} from './dto/badge.dto';

@Controller('badges')
@Auth()
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Get()
  list() {
    return this.badgesService.list();
  }

  @Get('mine')
  listMine(@CurrentUser() actor: AuthUser) {
    return this.badgesService.listMine(actor.id);
  }

  @Post()
  @Auth(Role.admin)
  create(@Body() dto: CreateBadgeDto) {
    return this.badgesService.create(dto);
  }

  @Patch(':id')
  @Auth(Role.admin)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBadgeDto) {
    return this.badgesService.update(id, dto);
  }

  @Delete(':id')
  @Auth(Role.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.badgesService.remove(id);
  }

  @Post(':id/award')
  @Auth(Role.admin, Role.manager)
  @HttpCode(HttpStatus.OK)
  award(@Param('id', ParseIntPipe) id: number, @Body() dto: ManualAwardDto) {
    return this.badgesService.manualAward(id, dto.employeeId);
  }
}
