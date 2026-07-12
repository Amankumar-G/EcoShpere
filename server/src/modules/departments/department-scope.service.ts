import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DepartmentScopeService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveSubtreeIds(rootDepartmentId: number): Promise<number[]> {
    const rows = await this.prisma.$queryRaw<Array<{ id: number }>>`
      WITH RECURSIVE subtree AS (
        SELECT id FROM "Department" WHERE id = ${rootDepartmentId}
        UNION ALL
        SELECT d.id FROM "Department" d
        INNER JOIN subtree s ON d."parentId" = s.id
      )
      SELECT id FROM subtree
    `;
    return rows.map((row) => row.id);
  }
}
