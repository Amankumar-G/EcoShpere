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
import { CreateEmissionScopeDto } from './dto/create-emission-scope.dto';
import { EmissionScopeResponseDto } from './dto/emission-scope-response.dto';
import { ListEmissionScopesQueryDto } from './dto/list-emission-scopes-query.dto';
import { UpdateEmissionScopeDto } from './dto/update-emission-scope.dto';
import { EmissionScopesService } from './emission-scopes.service';

@Controller('emission-scopes')
export class EmissionScopesController {
  constructor(private readonly emissionScopesService: EmissionScopesService) {}

  @Get()
  @Auth(Role.admin)
  list(
    @Query() query: ListEmissionScopesQueryDto,
  ): Promise<EmissionScopeResponseDto[]> {
    return this.emissionScopesService.list(query.parentId);
  }

  @Get(':id')
  @Auth(Role.admin)
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EmissionScopeResponseDto> {
    return this.emissionScopesService.findOne(id);
  }

  @Post()
  @Auth(Role.admin)
  create(
    @Body() dto: CreateEmissionScopeDto,
  ): Promise<EmissionScopeResponseDto> {
    return this.emissionScopesService.create(dto);
  }

  @Patch(':id')
  @Auth(Role.admin)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmissionScopeDto,
  ): Promise<EmissionScopeResponseDto> {
    return this.emissionScopesService.update(id, dto);
  }

  @Delete(':id')
  @Auth(Role.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.emissionScopesService.remove(id);
  }
}
