import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { hashPassword } from '../../common/utils/password.util';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../auth/interfaces/jwt-payload.interface';
import { DepartmentScopeService } from '../departments/department-scope.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeeQueryDto } from './dto/employee-query.dto';
import {
  EmployeeListResponseDto,
  EmployeeResponseDto,
} from './dto/employee-response.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

const SORTABLE_FIELDS = new Set(['name', 'email', 'role', 'status', 'id']);

type EmployeeRecord = Prisma.EmployeeGetPayload<Record<string, never>>;

@Injectable()
export class EmployeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scope: DepartmentScopeService,
  ) {}

  async list(
    actor: AuthUser,
    query: EmployeeQueryDto,
  ): Promise<EmployeeListResponseDto> {
    const where = await this.buildScopeWhere(actor, query.filter);
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const orderBy = buildOrderBy(query.sort, query.order);

    const [employees, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.employee.count({ where }),
    ]);

    return { items: employees.map(toEmployeeResponse), total };
  }

  async findOne(actor: AuthUser, id: number): Promise<EmployeeResponseDto> {
    const employee = await this.getScopedOrThrow(actor, id);
    return toEmployeeResponse(employee);
  }

  async create(
    actor: AuthUser,
    dto: CreateEmployeeDto,
  ): Promise<EmployeeResponseDto> {
    this.assertRoleAssignmentAllowed(actor, dto.role);
    const passwordHash = await hashPassword(dto.password);

    try {
      const created = await this.prisma.employee.create({
        data: {
          name: dto.name,
          email: dto.email,
          passwordHash,
          role: dto.role ?? Role.employee,
          departmentId: dto.departmentId ?? null,
          gender: dto.gender,
          homeWorkDistance: dto.homeWorkDistance,
        },
      });
      return toEmployeeResponse(created);
    } catch (error) {
      throw toDuplicateEmailError(error, dto.email);
    }
  }

  async update(
    actor: AuthUser,
    id: number,
    dto: UpdateEmployeeDto,
  ): Promise<EmployeeResponseDto> {
    await this.getScopedOrThrow(actor, id);
    this.assertRoleAssignmentAllowed(actor, dto.role);

    try {
      const updated = await this.prisma.employee.update({
        where: { id },
        data: {
          name: dto.name,
          email: dto.email,
          role: dto.role,
          departmentId: dto.departmentId,
          gender: dto.gender,
          homeWorkDistance: dto.homeWorkDistance,
          status: dto.status,
        },
      });
      return toEmployeeResponse(updated);
    } catch (error) {
      throw toDuplicateEmailError(error, dto.email);
    }
  }

  async remove(actor: AuthUser, id: number): Promise<void> {
    await this.getScopedOrThrow(actor, id);
    await this.assertNotDepartmentHead(id);
    await this.prisma.employee.delete({ where: { id } });
  }

  private assertRoleAssignmentAllowed(actor: AuthUser, role?: Role): void {
    if (role === Role.admin && actor.role !== Role.admin) {
      throw new ForbiddenException(
        'Only an admin can assign or change the admin role',
      );
    }
  }

  private async assertNotDepartmentHead(employeeId: number): Promise<void> {
    const headOf = await this.prisma.department.findFirst({
      where: { headEmployeeId: employeeId },
    });
    if (headOf) {
      throw new ConflictException(
        'Employee is the assigned head of a department; reassign or clear the head before deleting',
      );
    }
  }

  private async buildScopeWhere(
    actor: AuthUser,
    filter?: string,
  ): Promise<Prisma.EmployeeWhereInput> {
    const filterWhere = buildFilterWhere(filter);
    if (actor.role === Role.admin) {
      return filterWhere;
    }
    const subtreeIds = await this.scope.resolveSubtreeIds(
      actor.departmentId ?? -1,
    );
    return { ...filterWhere, departmentId: { in: subtreeIds } };
  }

  private async getScopedOrThrow(
    actor: AuthUser,
    id: number,
  ): Promise<EmployeeRecord> {
    const employee = await this.prisma.employee.findUnique({ where: { id } });
    if (!employee) {
      throw new NotFoundException(`Employee ${id} not found`);
    }

    if (actor.role !== Role.admin) {
      const subtreeIds = await this.scope.resolveSubtreeIds(
        actor.departmentId ?? -1,
      );
      if (
        employee.departmentId === null ||
        !subtreeIds.includes(employee.departmentId)
      ) {
        throw new ForbiddenException(
          'Employee is outside your managed department subtree',
        );
      }
    }

    return employee;
  }
}

function buildOrderBy(
  sort?: string,
  order: 'asc' | 'desc' = 'asc',
): Prisma.EmployeeOrderByWithRelationInput {
  const field = sort && SORTABLE_FIELDS.has(sort) ? sort : 'id';
  return { [field]: order };
}

function buildFilterWhere(filter?: string): Prisma.EmployeeWhereInput {
  if (!filter) {
    return {};
  }
  return {
    OR: [
      { name: { contains: filter, mode: 'insensitive' } },
      { email: { contains: filter, mode: 'insensitive' } },
    ],
  };
}

function toEmployeeResponse(employee: EmployeeRecord): EmployeeResponseDto {
  return {
    id: employee.id,
    name: employee.name,
    email: employee.email,
    role: employee.role,
    gender: employee.gender,
    homeWorkDistance: employee.homeWorkDistance
      ? Number(employee.homeWorkDistance)
      : null,
    xp: employee.xp,
    points: employee.points,
    status: employee.status,
    departmentId: employee.departmentId,
  };
}

function isUniqueEmailViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

function toDuplicateEmailError(error: unknown, email?: string): Error {
  if (isUniqueEmailViolation(error)) {
    return new ConflictException(`Email "${email}" is already in use`);
  }
  return error as Error;
}
