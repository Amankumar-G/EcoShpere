import { BadRequestException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { PrismaService } from '../../prisma/prisma.service';
import { EmissionScopeTreeService } from './emission-scope-tree.service';
import { EmissionScopesService } from './emission-scopes.service';

function uniqueCodeViolation(): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    clientVersion: '7.0.0',
  });
}

function scopeRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 1,
    name: 'Scope 1',
    code: 'SCOPE_1',
    parentId: null,
    _count: { children: 0 },
    ...overrides,
  };
}

describe('EmissionScopesService', () => {
  let service: EmissionScopesService;
  let prisma: {
    emissionScope: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };
  let tree: { resolveSubtreeIds: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    prisma = {
      emissionScope: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    tree = { resolveSubtreeIds: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmissionScopesService,
        { provide: PrismaService, useValue: prisma },
        { provide: EmissionScopeTreeService, useValue: tree },
      ],
    }).compile();

    service = module.get<EmissionScopesService>(EmissionScopesService);
  });

  describe('create', () => {
    it('raises a conflict when creating a scope with a duplicate code', async () => {
      prisma.emissionScope.create.mockRejectedValue(uniqueCodeViolation());

      await expect(
        service.create({ name: 'Scope 1', code: 'SCOPE_1' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('rejects creating a scope under a non-existent parent', async () => {
      prisma.emissionScope.findUnique.mockResolvedValue(null);

      await expect(
        service.create({ name: 'Scope 1a', code: 'SCOPE_1A', parentId: 99 }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.emissionScope.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('raises a conflict when updating a scope to a duplicate code', async () => {
      prisma.emissionScope.findUnique.mockResolvedValue(scopeRow());
      prisma.emissionScope.update.mockRejectedValue(uniqueCodeViolation());

      await expect(
        service.update(1, { code: 'SCOPE_2' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('rejects setting a scope as its own parent', async () => {
      prisma.emissionScope.findUnique.mockResolvedValue(scopeRow());

      await expect(service.update(1, { parentId: 1 })).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rejects setting a parent that is a descendant of the scope', async () => {
      prisma.emissionScope.findUnique
        .mockResolvedValueOnce(scopeRow({ id: 1 }))
        .mockResolvedValueOnce(scopeRow({ id: 2 }));
      tree.resolveSubtreeIds.mockResolvedValue([1, 2, 3]);

      await expect(service.update(1, { parentId: 2 })).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('allows setting a parent that is not a descendant', async () => {
      prisma.emissionScope.findUnique
        .mockResolvedValueOnce(scopeRow({ id: 1 }))
        .mockResolvedValueOnce(scopeRow({ id: 5 }));
      tree.resolveSubtreeIds.mockResolvedValue([1, 2, 3]);
      prisma.emissionScope.update.mockResolvedValue(
        scopeRow({ id: 1, parentId: 5 }),
      );

      const result = await service.update(1, { parentId: 5 });

      expect(result.parentId).toBe(5);
    });
  });

  describe('remove', () => {
    it('rejects deleting a scope that still has child scopes', async () => {
      prisma.emissionScope.findUnique.mockResolvedValue(
        scopeRow({ _count: { children: 2 } }),
      );

      await expect(service.remove(1)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(prisma.emissionScope.delete).not.toHaveBeenCalled();
    });

    it('deletes a scope with no child scopes', async () => {
      prisma.emissionScope.findUnique.mockResolvedValue(scopeRow());
      prisma.emissionScope.delete.mockResolvedValue(scopeRow());

      await service.remove(1);

      expect(prisma.emissionScope.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('list (tree build)', () => {
    it('nests child scopes under their parent when listing the full tree', async () => {
      prisma.emissionScope.findMany.mockResolvedValue([
        scopeRow({ id: 1, code: 'SCOPE_1', parentId: null }),
        scopeRow({ id: 2, code: 'SCOPE_1A', parentId: 1 }),
        scopeRow({ id: 3, code: 'SCOPE_2', parentId: null }),
        scopeRow({ id: 4, code: 'SCOPE_1A_I', parentId: 2 }),
      ]);

      const result = await service.list();

      expect(result).toHaveLength(2);
      const scope1 = result.find((scope) => scope.id === 1);
      expect(scope1?.children).toHaveLength(1);
      expect(scope1?.children?.[0].id).toBe(2);
      expect(scope1?.children?.[0].children).toHaveLength(1);
      expect(scope1?.children?.[0].children?.[0].id).toBe(4);
    });

    it('returns only direct children when a parentId filter is given', async () => {
      prisma.emissionScope.findMany.mockResolvedValue([
        scopeRow({ id: 2, code: 'SCOPE_1A', parentId: 1 }),
      ]);

      const result = await service.list(1);

      expect(prisma.emissionScope.findMany).toHaveBeenCalledWith({
        where: { parentId: 1 },
      });
      expect(result).toEqual([
        { id: 2, name: 'Scope 1', code: 'SCOPE_1A', parentId: 1 },
      ]);
    });
  });
});
