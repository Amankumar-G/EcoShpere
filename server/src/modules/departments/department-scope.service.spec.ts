import { Test, TestingModule } from '@nestjs/testing';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { PrismaService } from '../../prisma/prisma.service';
import { DepartmentScopeService } from './department-scope.service';

describe('DepartmentScopeService', () => {
  let service: DepartmentScopeService;
  let prisma: { $queryRaw: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    prisma = { $queryRaw: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentScopeService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DepartmentScopeService>(DepartmentScopeService);
  });

  it('returns only the department itself when it has no children', async () => {
    prisma.$queryRaw.mockResolvedValue([{ id: 1 }]);

    const result = await service.resolveSubtreeIds(1);

    expect(result).toEqual([1]);
  });

  it('returns the department and all its descendants', async () => {
    prisma.$queryRaw.mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }]);

    const result = await service.resolveSubtreeIds(1);

    expect(result).toEqual([1, 2, 3]);
  });
});
