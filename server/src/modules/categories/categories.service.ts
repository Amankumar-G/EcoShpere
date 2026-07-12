import { Injectable, NotFoundException } from '@nestjs/common';
import { Category } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(type?: string): Promise<CategoryResponseDto[]> {
    const categories = await this.prisma.category.findMany({
      where: type ? { type } : undefined,
    });
    return categories.map(toCategoryResponse);
  }

  async create(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const created = await this.prisma.category.create({
      data: { name: dto.name, type: dto.type },
    });
    return toCategoryResponse(created);
  }

  async update(
    id: number,
    dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    await this.findByIdOrThrow(id);

    const updated = await this.prisma.category.update({
      where: { id },
      data: { name: dto.name, type: dto.type, status: dto.status },
    });
    return toCategoryResponse(updated);
  }

  async remove(id: number): Promise<void> {
    await this.findByIdOrThrow(id);
    // Phase 0 uses hard delete: nothing else references Category yet,
    // so there is no orphaned-data risk. Revisit if a FK is added later.
    await this.prisma.category.delete({ where: { id } });
  }

  private async findByIdOrThrow(id: number): Promise<Category> {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category ${id} not found`);
    }
    return category;
  }
}

function toCategoryResponse(category: Category): CategoryResponseDto {
  return {
    id: category.id,
    name: category.name,
    type: category.type,
    status: category.status,
  };
}
