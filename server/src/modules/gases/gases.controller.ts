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
import { CreateGasDto } from './dto/create-gas.dto';
import { GasResponseDto } from './dto/gas-response.dto';
import { UpdateGasDto } from './dto/update-gas.dto';
import { GasesService } from './gases.service';

@Controller('gases')
export class GasesController {
  constructor(private readonly gasesService: GasesService) {}

  @Get()
  @Auth(Role.admin)
  list(): Promise<GasResponseDto[]> {
    return this.gasesService.list();
  }

  @Get(':id')
  @Auth(Role.admin)
  findOne(@Param('id', ParseIntPipe) id: number): Promise<GasResponseDto> {
    return this.gasesService.findOne(id);
  }

  @Post()
  @Auth(Role.admin)
  create(@Body() dto: CreateGasDto): Promise<GasResponseDto> {
    return this.gasesService.create(dto);
  }

  @Patch(':id')
  @Auth(Role.admin)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGasDto,
  ): Promise<GasResponseDto> {
    return this.gasesService.update(id, dto);
  }

  @Delete(':id')
  @Auth(Role.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.gasesService.remove(id);
  }
}
