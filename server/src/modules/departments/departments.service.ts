import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../auth/interfaces/jwt-payload.interface';
import { DepartmentScopeService } from './department-scope.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { DepartmentResponseDto } from './dto/department-response.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

const DEPARTMENT_WITH_COUNT = {
  include: { _count: { select: { employees: true, children: true } } },
} satisfies Prisma.DepartmentDefaultArgs;

type DepartmentWithCount = Prisma.DepartmentGetPayload<
  typeof DEPARTMENT_WITH_COUNT
>;

@Injectable()
export class DepartmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scope: DepartmentScopeService,
  ) {}

  async list(actor: AuthUser): Promise<DepartmentResponseDto[]> {
    const where = await this.buildScopeWhere(actor);
    const departments = await this.prisma.department.findMany({
      where,
      ...DEPARTMENT_WITH_COUNT,
    });
    return departments.map(toDepartmentResponse);
  }

  async findOne(actor: AuthUser, id: number): Promise<DepartmentResponseDto> {
    const department = await this.getScopedOrThrow(actor, id);
    return toDepartmentResponse(department);
  }

  async create(dto: CreateDepartmentDto): Promise<DepartmentResponseDto> {
    if (dto.parentId !== undefined) {
      await this.assertParentExists(dto.parentId);
    }

    const created = await this.createDepartment(dto);
    return this.findByIdOrThrow(created.id);
  }

  async update(
    actor: AuthUser,
    id: number,
    dto: UpdateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    await this.getScopedOrThrow(actor, id);

    if (dto.parentId !== undefined && dto.parentId !== null) {
      await this.assertParentExists(dto.parentId);
      await this.assertNoCycle(id, dto.parentId);
    }

    const updated = await this.updateDepartment(id, dto);
    return toDepartmentResponse(updated);
  }

  async remove(actor: AuthUser, id: number): Promise<void> {
    const department = await this.getScopedOrThrow(actor, id);

    if (department._count.children > 0) {
      throw new BadRequestException(
        'Cannot delete a department that has child departments',
      );
    }
    if (department._count.employees > 0) {
      throw new BadRequestException(
        'Cannot delete a department that has assigned employees',
      );
    }

    await this.prisma.department.delete({ where: { id } });
  }

  private async buildScopeWhere(
    actor: AuthUser,
  ): Promise<Prisma.DepartmentWhereInput> {
    if (actor.role === Role.admin) {
      return {};
    }
    const subtreeIds = await this.scope.resolveSubtreeIds(
      actor.departmentId ?? -1,
    );
    return { id: { in: subtreeIds } };
  }

  private async getScopedOrThrow(
    actor: AuthUser,
    id: number,
  ): Promise<DepartmentWithCount> {
    const department = await this.findByIdOrThrow(id);

    if (actor.role !== Role.admin) {
      const subtreeIds = await this.scope.resolveSubtreeIds(
        actor.departmentId ?? -1,
      );
      if (!subtreeIds.includes(id)) {
        throw new ForbiddenException(
          'Department is outside your managed subtree',
        );
      }
    }

    return department;
  }

  private async findByIdOrThrow(id: number): Promise<DepartmentWithCount> {
    const department = await this.prisma.department.findUnique({
      where: { id },
      ...DEPARTMENT_WITH_COUNT,
    });
    if (!department) {
      throw new NotFoundException(`Department ${id} not found`);
    }
    return department;
  }

  private async assertParentExists(parentId: number): Promise<void> {
    const parent = await this.prisma.department.findUnique({
      where: { id: parentId },
    });
    if (!parent) {
      throw new BadRequestException(`Parent department ${parentId} not found`);
    }
  }

  private async assertNoCycle(id: number, parentId: number): Promise<void> {
    if (parentId === id) {
      throw new BadRequestException(
        'A department cannot be set as its own parent',
      );
    }

    const descendantIds = await this.scope.resolveSubtreeIds(id);
    if (descendantIds.includes(parentId)) {
      throw new BadRequestException(
        'A department cannot be made a child of one of its own descendants',
      );
    }
  }

  private async createDepartment(dto: CreateDepartmentDto) {
    try {
      return await this.prisma.department.create({
        data: {
          name: dto.name,
          code: dto.code,
          parentId: dto.parentId,
          headEmployeeId: dto.headEmployeeId,
        },
      });
    } catch (error) {
      throw toDuplicateCodeError(error, dto.code);
    }
  }

  private async updateDepartment(id: number, dto: UpdateDepartmentDto) {
    try {
      return await this.prisma.department.update({
        where: { id },
        data: {
          name: dto.name,
          code: dto.code,
          parentId: dto.parentId,
          headEmployeeId: dto.headEmployeeId,
          status: dto.status,
        },
        ...DEPARTMENT_WITH_COUNT,
      });
    } catch (error) {
      throw toDuplicateCodeError(error, dto.code);
    }
  }
}

function toDepartmentResponse(
  department: DepartmentWithCount,
): DepartmentResponseDto {
  return {
    id: department.id,
    name: department.name,
    code: department.code,
    parentId: department.parentId,
    headEmployeeId: department.headEmployeeId,
    employeeCount: department._count.employees,
    status: department.status,
  };
}

function isUniqueCodeViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

function toDuplicateCodeError(error: unknown, code?: string): Error {
  if (isUniqueCodeViolation(error)) {
    return new ConflictException(`Department code "${code}" is already in use`);
  }
  return error as Error;
}
