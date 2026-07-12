import { ConflictException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../auth/interfaces/jwt-payload.interface';
import { DepartmentScopeService } from '../departments/department-scope.service';
import { EmployeesService } from './employees.service';

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

function employeeRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 5,
    name: 'Jane Doe',
    email: 'jane@example.com',
    passwordHash: 'hashed-secret',
    role: 'employee',
    gender: null,
    homeWorkDistance: null,
    xp: 0,
    points: 0,
    status: 'active',
    departmentId: 10,
    ...overrides,
  };
}

describe('EmployeesService', () => {
  let service: EmployeesService;
  let prisma: {
    employee: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
    department: {
      findFirst: ReturnType<typeof vi.fn>;
    };
  };
  let scope: { resolveSubtreeIds: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    prisma = {
      employee: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      department: {
        findFirst: vi.fn(),
      },
    };
    scope = { resolveSubtreeIds: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        { provide: PrismaService, useValue: prisma },
        { provide: DepartmentScopeService, useValue: scope },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
  });

  describe('subtree scoping', () => {
    it('lets an admin list employees unscoped', async () => {
      prisma.employee.findMany.mockResolvedValue([employeeRow()]);
      prisma.employee.count.mockResolvedValue(1);

      await service.list(admin, {});

      expect(prisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
      expect(scope.resolveSubtreeIds).not.toHaveBeenCalled();
    });

    it('filters a manager to their resolved department subtree', async () => {
      scope.resolveSubtreeIds.mockResolvedValue([10, 11]);
      prisma.employee.findMany.mockResolvedValue([employeeRow()]);
      prisma.employee.count.mockResolvedValue(1);

      await service.list(manager, {});

      expect(scope.resolveSubtreeIds).toHaveBeenCalledWith(10);
      expect(prisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { departmentId: { in: [10, 11] } },
        }),
      );
    });

    it('rejects a manager reading an employee outside their subtree', async () => {
      prisma.employee.findUnique.mockResolvedValue(
        employeeRow({ id: 99, departmentId: 99 }),
      );
      scope.resolveSubtreeIds.mockResolvedValue([10, 11]);

      await expect(service.findOne(manager, 99)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('lets a manager read an employee inside their subtree', async () => {
      prisma.employee.findUnique.mockResolvedValue(employeeRow());
      scope.resolveSubtreeIds.mockResolvedValue([10, 11]);

      const result = await service.findOne(manager, 5);

      expect(result.id).toBe(5);
    });
  });

  describe('privilege escalation', () => {
    it('rejects a manager assigning the admin role on create', async () => {
      await expect(
        service.create(manager, {
          name: 'X',
          email: 'x@example.com',
          password: 'password123',
          role: 'admin' as never,
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.employee.create).not.toHaveBeenCalled();
    });

    it('rejects a manager changing an employee to the admin role on update', async () => {
      prisma.employee.findUnique.mockResolvedValue(employeeRow());
      scope.resolveSubtreeIds.mockResolvedValue([10, 11]);

      await expect(
        service.update(manager, 5, { role: 'admin' as never }),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.employee.update).not.toHaveBeenCalled();
    });

    it('allows an admin to assign the admin role', async () => {
      prisma.employee.create.mockResolvedValue(employeeRow({ role: 'admin' }));

      const result = await service.create(admin, {
        name: 'X',
        email: 'x@example.com',
        password: 'password123',
        role: 'admin' as never,
      });

      expect(result.role).toBe('admin');
    });
  });

  describe('deletion guards', () => {
    it('rejects deleting an employee who is a department head', async () => {
      prisma.employee.findUnique.mockResolvedValue(employeeRow());
      prisma.department.findFirst.mockResolvedValue({
        id: 10,
        headEmployeeId: 5,
      });

      await expect(service.remove(admin, 5)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(prisma.employee.delete).not.toHaveBeenCalled();
    });

    it('deletes an employee who is not a department head', async () => {
      prisma.employee.findUnique.mockResolvedValue(employeeRow());
      prisma.department.findFirst.mockResolvedValue(null);
      prisma.employee.delete.mockResolvedValue(employeeRow());

      await service.remove(admin, 5);

      expect(prisma.employee.delete).toHaveBeenCalledWith({
        where: { id: 5 },
      });
    });
  });

  describe('response shape', () => {
    it('never returns passwordHash on create', async () => {
      prisma.employee.create.mockResolvedValue(employeeRow());

      const result = await service.create(admin, {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
      });

      expect(result).not.toHaveProperty('passwordHash');
    });

    it('never returns passwordHash in a list', async () => {
      prisma.employee.findMany.mockResolvedValue([employeeRow()]);
      prisma.employee.count.mockResolvedValue(1);

      const result = await service.list(admin, {});

      expect(result.items[0]).not.toHaveProperty('passwordHash');
    });
  });
});
