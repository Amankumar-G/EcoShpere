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
import { EnvironmentalGoalsService } from './environmental-goals.service';
import {
  CreateEnvironmentalGoalDto,
  UpdateEnvironmentalGoalDto,
} from './dto/environmental-goal.dto';

@Controller('environmental-goals')
@Auth()
export class EnvironmentalGoalsController {
  constructor(private readonly goalsService: EnvironmentalGoalsService) {}

  @Get()
  list(@Query('departmentId') departmentId?: string) {
    return this.goalsService.list(
      departmentId ? Number(departmentId) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.goalsService.findOne(id);
  }

  @Post()
  @Auth(Role.admin, Role.manager)
  create(@Body() dto: CreateEnvironmentalGoalDto) {
    return this.goalsService.create(dto);
  }

  @Patch(':id')
  @Auth(Role.admin, Role.manager)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEnvironmentalGoalDto,
  ) {
    return this.goalsService.update(id, dto);
  }

  @Delete(':id')
  @Auth(Role.admin, Role.manager)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.goalsService.remove(id);
  }
}
