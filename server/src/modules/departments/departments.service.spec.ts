import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../auth/interfaces/jwt-payload.interface';
import { DepartmentScopeService } from './department-scope.service';
import { DepartmentsService } from './departments.service';

const admin: AuthUser = {
  id: 1,
  email: 'admin@example.com',
  name: 'Admin',
  role: 'admin',
  departmentId: null,
};

const manager: AuthUser = {
  id: 2,
  email: 'manager@example.com',
  name: 'Manager',
  role: 'manager',
  departmentId: 10,
};

function departmentRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 10,
    name: 'Engineering',
    code: 'ENG',
    status: 'active',
    parentId: null,
    headEmployeeId: null,
    _count: { employees: 0, children: 0 },
    ...overrides,
  };
}

describe('DepartmentsService', () => {
  let service: DepartmentsService;
  let prisma: {
    department: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };
  let scope: { resolveSubtreeIds: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    prisma = {
      department: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    scope = { resolveSubtreeIds: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentsService,
        { provide: PrismaService, useValue: prisma },
        { provide: DepartmentScopeService, useValue: scope },
      ],
    }).compile();

    service = module.get<DepartmentsService>(DepartmentsService);
  });

  describe('subtree scoping', () => {
    it('lets an admin list all departments unscoped', async () => {
      prisma.department.findMany.mockResolvedValue([departmentRow()]);

      await service.list(admin);

      expect(prisma.department.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
      expect(scope.resolveSubtreeIds).not.toHaveBeenCalled();
    });

    it('filters a manager to their resolved subtree', async () => {
      scope.resolveSubtreeIds.mockResolvedValue([10, 11]);
      prisma.department.findMany.mockResolvedValue([departmentRow()]);

      await service.list(manager);

      expect(scope.resolveSubtreeIds).toHaveBeenCalledWith(10);
      expect(prisma.department.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: { in: [10, 11] } } }),
      );
    });

    it('rejects a manager reading a department outside their subtree', async () => {
      prisma.department.findUnique.mockResolvedValue(departmentRow({ id: 99 }));
      scope.resolveSubtreeIds.mockResolvedValue([10, 11]);

      await expect(service.findOne(manager, 99)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('lets a manager read a department inside their subtree', async () => {
      prisma.department.findUnique.mockResolvedValue(departmentRow());
      scope.resolveSubtreeIds.mockResolvedValue([10, 11]);

      const result = await service.findOne(manager, 10);

      expect(result.id).toBe(10);
    });
  });

  describe('hierarchy cycle prevention', () => {
    it('rejects setting a department as its own parent', async () => {
      prisma.department.findUnique.mockResolvedValue(departmentRow());

      await expect(
        service.update(admin, 10, { parentId: 10 }),
      ).rejects.toMatchObject({ status: 400 });
    });

    it('rejects setting a parent that is a descendant of the department', async () => {
      prisma.department.findUnique
        .mockResolvedValueOnce(departmentRow())
        .mockResolvedValueOnce(departmentRow({ id: 20 }));
      scope.resolveSubtreeIds.mockResolvedValue([10, 20, 21]);

      await expect(
        service.update(admin, 10, { parentId: 20 }),
      ).rejects.toMatchObject({ status: 400 });
    });

    it('allows setting a parent that is not a descendant', async () => {
      prisma.department.findUnique
        .mockResolvedValueOnce(departmentRow())
        .mockResolvedValueOnce(departmentRow({ id: 30 }));
      scope.resolveSubtreeIds.mockResolvedValue([10, 11]);
      prisma.department.update.mockResolvedValue(
        departmentRow({ parentId: 30 }),
      );

      const result = await service.update(admin, 10, { parentId: 30 });

      expect(result.parentId).toBe(30);
    });
  });

  describe('deletion guards', () => {
    it('rejects deleting a department that still has child departments', async () => {
      prisma.department.findUnique.mockResolvedValue(
        departmentRow({ _count: { employees: 0, children: 1 } }),
      );

      await expect(service.remove(admin, 10)).rejects.toMatchObject({
        status: 400,
      });
      expect(prisma.department.delete).not.toHaveBeenCalled();
    });

    it('rejects deleting a department that still has assigned employees', async () => {
      prisma.department.findUnique.mockResolvedValue(
        departmentRow({ _count: { employees: 3, children: 0 } }),
      );

      await expect(service.remove(admin, 10)).rejects.toMatchObject({
        status: 400,
      });
      expect(prisma.department.delete).not.toHaveBeenCalled();
    });

    it('deletes a department with no children and no employees', async () => {
      prisma.department.findUnique.mockResolvedValue(departmentRow());
      prisma.department.delete.mockResolvedValue(departmentRow());

      await service.remove(admin, 10);

      expect(prisma.department.delete).toHaveBeenCalledWith({
        where: { id: 10 },
      });
    });
  });
});
