import { Injectable, NotFoundException } from '@nestjs/common';
import { SourceDatabase } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSourceDatabaseDto } from './dto/create-source-database.dto';
import { SourceDatabaseResponseDto } from './dto/source-database-response.dto';
import { UpdateSourceDatabaseDto } from './dto/update-source-database.dto';

@Injectable()
export class SourceDatabasesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<SourceDatabaseResponseDto[]> {
    const sourceDatabases = await this.prisma.sourceDatabase.findMany();
    return sourceDatabases.map(toSourceDatabaseResponse);
  }

  async findOne(id: number): Promise<SourceDatabaseResponseDto> {
    const sourceDatabase = await this.findByIdOrThrow(id);
    return toSourceDatabaseResponse(sourceDatabase);
  }

  async create(
    dto: CreateSourceDatabaseDto,
  ): Promise<SourceDatabaseResponseDto> {
    const created = await this.prisma.sourceDatabase.create({
      data: {
        name: dto.name,
        provider: dto.provider,
        url: dto.url,
        lastImportedAt: dto.lastImportedAt,
      },
    });
    return toSourceDatabaseResponse(created);
  }

  async update(
    id: number,
    dto: UpdateSourceDatabaseDto,
  ): Promise<SourceDatabaseResponseDto> {
    await this.findByIdOrThrow(id);

    const updated = await this.prisma.sourceDatabase.update({
      where: { id },
      data: {
        name: dto.name,
        provider: dto.provider,
        url: dto.url,
        lastImportedAt: dto.lastImportedAt,
      },
    });
    return toSourceDatabaseResponse(updated);
  }

  async remove(id: number): Promise<void> {
    await this.findByIdOrThrow(id);
    await this.prisma.sourceDatabase.delete({ where: { id } });
  }

  private async findByIdOrThrow(id: number): Promise<SourceDatabase> {
    const sourceDatabase = await this.prisma.sourceDatabase.findUnique({
      where: { id },
    });
    if (!sourceDatabase) {
      throw new NotFoundException(`Source database ${id} not found`);
    }
    return sourceDatabase;
  }
}

function toSourceDatabaseResponse(
  sourceDatabase: SourceDatabase,
): SourceDatabaseResponseDto {
  return {
    id: sourceDatabase.id,
    name: sourceDatabase.name,
    provider: sourceDatabase.provider,
    url: sourceDatabase.url,
    lastImportedAt: sourceDatabase.lastImportedAt,
  };
}
