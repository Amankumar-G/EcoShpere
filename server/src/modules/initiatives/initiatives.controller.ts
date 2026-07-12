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
import { InitiativesService } from './initiatives.service';
import { CreateInitiativeDto, UpdateInitiativeDto } from './dto/initiative.dto';

@Controller('initiatives')
@Auth()
export class InitiativesController {
  constructor(private readonly initiativesService: InitiativesService) {}

  @Get()
  list(@Query('departmentId') departmentId?: string) {
    return this.initiativesService.list(
      departmentId ? Number(departmentId) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.initiativesService.findOne(id);
  }

  @Post()
  @Auth(Role.admin, Role.manager)
  create(@Body() dto: CreateInitiativeDto) {
    return this.initiativesService.create(dto);
  }

  @Patch(':id')
  @Auth(Role.admin, Role.manager)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInitiativeDto,
  ) {
    return this.initiativesService.update(id, dto);
  }

  @Delete(':id')
  @Auth(Role.admin, Role.manager)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.initiativesService.remove(id);
  }
}
