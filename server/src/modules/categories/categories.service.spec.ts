import { Test, TestingModule } from '@nestjs/testing';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { PrismaService } from '../../prisma/prisma.service';
import { CategoriesService } from './categories.service';

function categoryRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 1,
    name: 'Beach Cleanup',
    type: 'csr_activity',
    status: 'active',
    ...overrides,
  };
}

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prisma: {
    category: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(async () => {
    prisma = {
      category: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('lists all categories when no type filter is given', async () => {
    prisma.category.findMany.mockResolvedValue([categoryRow()]);

    const result = await service.list();

    expect(prisma.category.findMany).toHaveBeenCalledWith({
      where: undefined,
    });
    expect(result).toEqual([categoryRow()]);
  });

  it('filters categories by type when provided', async () => {
    prisma.category.findMany.mockResolvedValue([categoryRow()]);

    await service.list('csr_activity');

    expect(prisma.category.findMany).toHaveBeenCalledWith({
      where: { type: 'csr_activity' },
    });
  });

  it('creates a category with the given name and type', async () => {
    prisma.category.create.mockResolvedValue(categoryRow());

    const result = await service.create({
      name: 'Beach Cleanup',
      type: 'csr_activity',
    });

    expect(prisma.category.create).toHaveBeenCalledWith({
      data: { name: 'Beach Cleanup', type: 'csr_activity' },
    });
    expect(result).toEqual(categoryRow());
  });
});
