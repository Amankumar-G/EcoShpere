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
import { CreateSourceDatabaseDto } from './dto/create-source-database.dto';
import { SourceDatabaseResponseDto } from './dto/source-database-response.dto';
import { UpdateSourceDatabaseDto } from './dto/update-source-database.dto';
import { SourceDatabasesService } from './source-databases.service';

@Controller('source-databases')
export class SourceDatabasesController {
  constructor(
    private readonly sourceDatabasesService: SourceDatabasesService,
  ) {}

  @Get()
  @Auth(Role.admin)
  list(): Promise<SourceDatabaseResponseDto[]> {
    return this.sourceDatabasesService.list();
  }

  @Get(':id')
  @Auth(Role.admin)
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SourceDatabaseResponseDto> {
    return this.sourceDatabasesService.findOne(id);
  }

  @Post()
  @Auth(Role.admin)
  create(
    @Body() dto: CreateSourceDatabaseDto,
  ): Promise<SourceDatabaseResponseDto> {
    return this.sourceDatabasesService.create(dto);
  }

  @Patch(':id')
  @Auth(Role.admin)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSourceDatabaseDto,
  ): Promise<SourceDatabaseResponseDto> {
    return this.sourceDatabasesService.update(id, dto);
  }

  @Delete(':id')
  @Auth(Role.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.sourceDatabasesService.remove(id);
  }
}
