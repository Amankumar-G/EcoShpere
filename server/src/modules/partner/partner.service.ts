import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CsvImportResult,
  importRows,
  parseCsv,
} from '../../common/csv/csv-import';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreatePartnerDto,
  PARTNER_TYPES,
  UpdatePartnerDto,
} from './dto/partner.dto';

@Injectable()
export class PartnerService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreatePartnerDto) {
    return this.prisma.partner.create({ data: dto });
  }

  findAll() {
    return this.prisma.partner.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: number) {
    const partner = await this.prisma.partner.findUnique({ where: { id } });
    if (!partner) {
      throw new NotFoundException(`Partner ${id} not found`);
    }
    return partner;
  }

  async update(id: number, dto: UpdatePartnerDto) {
    await this.findOne(id);
    return this.prisma.partner.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.partner.delete({ where: { id } });
  }

  /** Bulk-create partners from CSV columns: name, type, email?, phone?, address?, status?. */
  importCsv(csv: string): Promise<CsvImportResult> {
    const rows = parseCsv(csv);
    return importRows(rows, async (row) => {
      if (!row.name) {
        throw new Error('name is required');
      }
      if (!PARTNER_TYPES.includes(row.type as (typeof PARTNER_TYPES)[number])) {
        throw new Error(`type must be one of ${PARTNER_TYPES.join(', ')}`);
      }
      await this.prisma.partner.create({
        data: {
          name: row.name,
          type: row.type,
          email: row.email || null,
          phone: row.phone || null,
          address: row.address || null,
          status: row.status || 'active',
        },
      });
    });
  }
}
