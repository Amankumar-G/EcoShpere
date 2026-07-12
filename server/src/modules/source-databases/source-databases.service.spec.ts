import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { PrismaService } from '../../prisma/prisma.service';
import { SourceDatabasesService } from './source-databases.service';

function sourceDatabaseRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 1,
    name: 'DEFRA',
    provider: 'UK Government',
    url: 'https://example.com/defra',
    lastImportedAt: null,
    ...overrides,
  };
}

describe('SourceDatabasesService', () => {
  let service: SourceDatabasesService;
  let prisma: {
    sourceDatabase: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(async () => {
    prisma = {
      sourceDatabase: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SourceDatabasesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SourceDatabasesService>(SourceDatabasesService);
  });

  it('creates a source database with the given fields', async () => {
    prisma.sourceDatabase.create.mockResolvedValue(sourceDatabaseRow());

    const result = await service.create({ name: 'DEFRA' });

    expect(result.name).toBe('DEFRA');
  });

  it('updates a source database after confirming it exists', async () => {
    prisma.sourceDatabase.findUnique.mockResolvedValue(sourceDatabaseRow());
    prisma.sourceDatabase.update.mockResolvedValue(
      sourceDatabaseRow({ name: 'DEFRA UK' }),
    );

    const result = await service.update(1, { name: 'DEFRA UK' });

    expect(result.name).toBe('DEFRA UK');
  });

  it('throws when updating a source database that does not exist', async () => {
    prisma.sourceDatabase.findUnique.mockResolvedValue(null);

    await expect(
      service.update(1, { name: 'DEFRA UK' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.sourceDatabase.update).not.toHaveBeenCalled();
  });

  it('deletes a source database after confirming it exists', async () => {
    prisma.sourceDatabase.findUnique.mockResolvedValue(sourceDatabaseRow());
    prisma.sourceDatabase.delete.mockResolvedValue(sourceDatabaseRow());

    await service.remove(1);

    expect(prisma.sourceDatabase.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('throws when deleting a source database that does not exist', async () => {
    prisma.sourceDatabase.findUnique.mockResolvedValue(null);

    await expect(service.remove(1)).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.sourceDatabase.delete).not.toHaveBeenCalled();
  });
});
