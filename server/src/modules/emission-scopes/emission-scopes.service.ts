import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EmissionScope, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmissionScopeDto } from './dto/create-emission-scope.dto';
import { EmissionScopeResponseDto } from './dto/emission-scope-response.dto';
import { UpdateEmissionScopeDto } from './dto/update-emission-scope.dto';
import { EmissionScopeTreeService } from './emission-scope-tree.service';

const EMISSION_SCOPE_WITH_COUNT = {
  include: { _count: { select: { children: true } } },
} satisfies Prisma.EmissionScopeDefaultArgs;

type EmissionScopeWithCount = Prisma.EmissionScopeGetPayload<
  typeof EMISSION_SCOPE_WITH_COUNT
>;

@Injectable()
export class EmissionScopesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tree: EmissionScopeTreeService,
  ) {}

  async list(parentId?: number): Promise<EmissionScopeResponseDto[]> {
    if (parentId !== undefined) {
      const children = await this.prisma.emissionScope.findMany({
        where: { parentId },
      });
      return children.map((scope) => toEmissionScopeResponse(scope));
    }

    const scopes = await this.prisma.emissionScope.findMany();
    return buildTree(scopes, null);
  }

  async findOne(id: number): Promise<EmissionScopeResponseDto> {
    const scope = await this.findByIdOrThrow(id);
    return toEmissionScopeResponse(scope);
  }

  async create(dto: CreateEmissionScopeDto): Promise<EmissionScopeResponseDto> {
    if (dto.parentId !== undefined) {
      await this.assertParentExists(dto.parentId);
    }

    const created = await this.createScope(dto);
    return toEmissionScopeResponse(created);
  }

  async update(
    id: number,
    dto: UpdateEmissionScopeDto,
  ): Promise<EmissionScopeResponseDto> {
    await this.findByIdOrThrow(id);

    if (dto.parentId !== undefined && dto.parentId !== null) {
      await this.assertParentExists(dto.parentId);
      await this.assertNoCycle(id, dto.parentId);
    }

    const updated = await this.updateScope(id, dto);
    return toEmissionScopeResponse(updated);
  }

  async remove(id: number): Promise<void> {
    const scope = await this.findByIdOrThrow(id);

    if (scope._count.children > 0) {
      throw new BadRequestException(
        'Cannot delete an emission scope that has child scopes',
      );
    }

    // TODO(Slice 2): also block deletion when EmissionFactor rows link to
    // this scope, once the EmissionFactor model and relation exist.

    await this.prisma.emissionScope.delete({ where: { id } });
  }

  private async findByIdOrThrow(id: number): Promise<EmissionScopeWithCount> {
    const scope = await this.prisma.emissionScope.findUnique({
      where: { id },
      ...EMISSION_SCOPE_WITH_COUNT,
    });
    if (!scope) {
      throw new NotFoundException(`Emission scope ${id} not found`);
    }
    return scope;
  }

  private async assertParentExists(parentId: number): Promise<void> {
    const parent = await this.prisma.emissionScope.findUnique({
      where: { id: parentId },
    });
    if (!parent) {
      throw new BadRequestException(
        `Parent emission scope ${parentId} not found`,
      );
    }
  }

  private async assertNoCycle(id: number, parentId: number): Promise<void> {
    if (parentId === id) {
      throw new BadRequestException(
        'An emission scope cannot be set as its own parent',
      );
    }

    const descendantIds = await this.tree.resolveSubtreeIds(id);
    if (descendantIds.includes(parentId)) {
      throw new BadRequestException(
        'An emission scope cannot be made a child of one of its own descendants',
      );
    }
  }

  private async createScope(
    dto: CreateEmissionScopeDto,
  ): Promise<EmissionScope> {
    try {
      return await this.prisma.emissionScope.create({
        data: { name: dto.name, code: dto.code, parentId: dto.parentId },
      });
    } catch (error) {
      throw toDuplicateCodeError(error, dto.code);
    }
  }

  private async updateScope(
    id: number,
    dto: UpdateEmissionScopeDto,
  ): Promise<EmissionScope> {
    try {
      return await this.prisma.emissionScope.update({
        where: { id },
        data: { name: dto.name, code: dto.code, parentId: dto.parentId },
      });
    } catch (error) {
      throw toDuplicateCodeError(error, dto.code);
    }
  }
}

function buildTree(
  scopes: EmissionScope[],
  parentId: number | null,
): EmissionScopeResponseDto[] {
  return scopes
    .filter((scope) => scope.parentId === parentId)
    .map((scope) => ({
      ...toEmissionScopeResponse(scope),
      children: buildTree(scopes, scope.id),
    }));
}

function toEmissionScopeResponse(
  scope: EmissionScope,
): EmissionScopeResponseDto {
  return {
    id: scope.id,
    name: scope.name,
    code: scope.code,
    parentId: scope.parentId,
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
    return new ConflictException(
      `Emission scope code "${code}" is already in use`,
    );
  }
  return error as Error;
}
