import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Gas, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGasDto } from './dto/create-gas.dto';
import { GasResponseDto } from './dto/gas-response.dto';
import { UpdateGasDto } from './dto/update-gas.dto';

@Injectable()
export class GasesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<GasResponseDto[]> {
    const gases = await this.prisma.gas.findMany();
    return gases.map(toGasResponse);
  }

  async findOne(id: number): Promise<GasResponseDto> {
    const gas = await this.findByIdOrThrow(id);
    return toGasResponse(gas);
  }

  async create(dto: CreateGasDto): Promise<GasResponseDto> {
    const created = await this.createGas(dto);
    return toGasResponse(created);
  }

  async update(id: number, dto: UpdateGasDto): Promise<GasResponseDto> {
    await this.findByIdOrThrow(id);
    const updated = await this.updateGas(id, dto);
    return toGasResponse(updated);
  }

  async remove(id: number): Promise<void> {
    await this.findByIdOrThrow(id);
    await this.prisma.gas.delete({ where: { id } });
  }

  private async findByIdOrThrow(id: number): Promise<Gas> {
    const gas = await this.prisma.gas.findUnique({ where: { id } });
    if (!gas) {
      throw new NotFoundException(`Gas ${id} not found`);
    }
    return gas;
  }

  private async createGas(dto: CreateGasDto): Promise<Gas> {
    try {
      return await this.prisma.gas.create({
        data: { name: dto.name, symbol: dto.symbol, gwp: dto.gwp },
      });
    } catch (error) {
      throw toDuplicateSymbolError(error, dto.symbol);
    }
  }

  private async updateGas(id: number, dto: UpdateGasDto): Promise<Gas> {
    try {
      return await this.prisma.gas.update({
        where: { id },
        data: { name: dto.name, symbol: dto.symbol, gwp: dto.gwp },
      });
    } catch (error) {
      throw toDuplicateSymbolError(error, dto.symbol);
    }
  }
}

function toGasResponse(gas: Gas): GasResponseDto {
  return {
    id: gas.id,
    name: gas.name,
    symbol: gas.symbol,
    gwp: Number(gas.gwp),
    gwpMetric: gas.gwpMetric,
  };
}

function isUniqueSymbolViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

function toDuplicateSymbolError(error: unknown, symbol?: string): Error {
  if (isUniqueSymbolViolation(error)) {
    return new ConflictException(`Gas symbol "${symbol}" is already in use`);
  }
  return error as Error;
}
