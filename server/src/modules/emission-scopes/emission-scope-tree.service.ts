import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EmissionScopeTreeService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveSubtreeIds(rootScopeId: number): Promise<number[]> {
    const rows = await this.prisma.$queryRaw<Array<{ id: number }>>`
      WITH RECURSIVE subtree AS (
        SELECT id FROM "EmissionScope" WHERE id = ${rootScopeId}
        UNION ALL
        SELECT s.id FROM "EmissionScope" s
        INNER JOIN subtree t ON s."parentId" = t.id
      )
      SELECT id FROM subtree
    `;
    return rows.map((row) => row.id);
  }
}
