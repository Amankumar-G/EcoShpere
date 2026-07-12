import { Test, TestingModule } from '@nestjs/testing';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { PrismaService } from '../../prisma/prisma.service';
import { EmissionScopeTreeService } from './emission-scope-tree.service';

describe('EmissionScopeTreeService', () => {
  let service: EmissionScopeTreeService;
  let prisma: { $queryRaw: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    prisma = { $queryRaw: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmissionScopeTreeService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<EmissionScopeTreeService>(EmissionScopeTreeService);
  });

  it('returns only the scope itself when it has no children', async () => {
    prisma.$queryRaw.mockResolvedValue([{ id: 1 }]);

    const result = await service.resolveSubtreeIds(1);

    expect(result).toEqual([1]);
  });

  it('returns the scope and all its nested descendants', async () => {
    prisma.$queryRaw.mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }]);

    const result = await service.resolveSubtreeIds(1);

    expect(result).toEqual([1, 2, 3]);
  });
});
