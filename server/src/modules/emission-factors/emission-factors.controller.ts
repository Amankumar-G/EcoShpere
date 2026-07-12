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
import { CreateEmissionFactorDto } from './dto/create-emission-factor.dto';
import { CreateGasLineDto } from './dto/create-gas-line.dto';
import {
  EmissionFactorResponseDto,
  GasLineResponseDto,
} from './dto/emission-factor-response.dto';
import { ListEmissionFactorsQueryDto } from './dto/list-emission-factors-query.dto';
import { UpdateEmissionFactorDto } from './dto/update-emission-factor.dto';
import { UpdateGasLineDto } from './dto/update-gas-line.dto';
import { EmissionFactorsService } from './emission-factors.service';

@Controller('emission-factors')
export class EmissionFactorsController {
  constructor(
    private readonly emissionFactorsService: EmissionFactorsService,
  ) {}

  @Get()
  @Auth(Role.admin)
  list(
    @Query() query: ListEmissionFactorsQueryDto,
  ): Promise<EmissionFactorResponseDto[]> {
    return this.emissionFactorsService.list(
      query.scopeId,
      query.sourceDatabaseId,
    );
  }

  @Get(':id')
  @Auth(Role.admin)
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EmissionFactorResponseDto> {
    return this.emissionFactorsService.findOne(id);
  }

  @Post()
  @Auth(Role.admin)
  create(
    @Body() dto: CreateEmissionFactorDto,
  ): Promise<EmissionFactorResponseDto> {
    return this.emissionFactorsService.create(dto);
  }

  @Patch(':id')
  @Auth(Role.admin)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmissionFactorDto,
  ): Promise<EmissionFactorResponseDto> {
    return this.emissionFactorsService.update(id, dto);
  }

  @Delete(':id')
  @Auth(Role.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.emissionFactorsService.remove(id);
  }

  @Post(':id/gas-lines')
  @Auth(Role.admin)
  addGasLine(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateGasLineDto,
  ): Promise<GasLineResponseDto> {
    return this.emissionFactorsService.addGasLine(id, dto);
  }

  @Patch(':id/gas-lines/:lineId')
  @Auth(Role.admin)
  updateGasLine(
    @Param('id', ParseIntPipe) id: number,
    @Param('lineId', ParseIntPipe) lineId: number,
    @Body() dto: UpdateGasLineDto,
  ): Promise<GasLineResponseDto> {
    return this.emissionFactorsService.updateGasLine(id, lineId, dto);
  }

  @Delete(':id/gas-lines/:lineId')
  @Auth(Role.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeGasLine(
    @Param('id', ParseIntPipe) id: number,
    @Param('lineId', ParseIntPipe) lineId: number,
  ): Promise<void> {
    return this.emissionFactorsService.removeGasLine(id, lineId);
  }
}
