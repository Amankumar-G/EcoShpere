import { Injectable, NotFoundException } from '@nestjs/common';
import { UNITS_OF_MEASURE } from '../../common/constants/uom.constant';
import {
  CsvImportResult,
  importRows,
  parseCsv,
} from '../../common/csv/csv-import';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateProductDto) {
    return this.prisma.product.create({ data: dto });
  }

  findAll() {
    return this.prisma.product.findMany({ orderBy: { code: 'asc' } });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return product;
  }

  async update(id: number, dto: UpdateProductDto) {
    await this.findOne(id);
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.product.delete({ where: { id } });
  }

  /** Bulk-create products from CSV columns: name, code, uom, status?. */
  importCsv(csv: string): Promise<CsvImportResult> {
    const rows = parseCsv(csv);
    return importRows(rows, async (row) => {
      if (!row.name || !row.code) {
        throw new Error('name and code are required');
      }
      if (
        !UNITS_OF_MEASURE.includes(row.uom as (typeof UNITS_OF_MEASURE)[number])
      ) {
        throw new Error(`uom must be one of ${UNITS_OF_MEASURE.join(', ')}`);
      }
      await this.prisma.product.create({
        data: {
          name: row.name,
          code: row.code,
          uom: row.uom,
          status: row.status || 'active',
        },
      });
    });
  }
}
