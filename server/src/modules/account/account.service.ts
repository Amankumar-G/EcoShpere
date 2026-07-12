import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CsvImportResult,
  importRows,
  parseCsv,
} from '../../common/csv/csv-import';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ACCOUNT_TYPES,
  CreateAccountDto,
  UpdateAccountDto,
} from './dto/account.dto';

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateAccountDto) {
    return this.prisma.account.create({ data: dto });
  }

  findAll() {
    return this.prisma.account.findMany({ orderBy: { code: 'asc' } });
  }

  async findOne(id: number) {
    const account = await this.prisma.account.findUnique({ where: { id } });
    if (!account) {
      throw new NotFoundException(`Account ${id} not found`);
    }
    return account;
  }

  async update(id: number, dto: UpdateAccountDto) {
    await this.findOne(id);
    return this.prisma.account.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.account.delete({ where: { id } });
  }

  /** Bulk-create accounts from CSV columns: code, name, type, status?. */
  importCsv(csv: string): Promise<CsvImportResult> {
    const rows = parseCsv(csv);
    return importRows(rows, async (row) => {
      if (!row.code || !row.name) {
        throw new Error('code and name are required');
      }
      if (!ACCOUNT_TYPES.includes(row.type as (typeof ACCOUNT_TYPES)[number])) {
        throw new Error(`type must be one of ${ACCOUNT_TYPES.join(', ')}`);
      }
      await this.prisma.account.create({
        data: {
          code: row.code,
          name: row.name,
          type: row.type,
          status: row.status || 'active',
        },
      });
    });
  }
}
