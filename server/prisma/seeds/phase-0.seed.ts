import { PrismaClient } from '@prisma/client';
import { ESG_CONFIG_DEFAULTS } from '../../src/modules/esg-config/esg-config.defaults';
import { hashPassword } from '../../src/common/utils/password.util';

const ADMIN_EMAIL = 'admin@ecosphere.local';
const ADMIN_PASSWORD = 'ChangeMe123!';
const ADMIN_NAME = 'EcoSphere Admin';

const DEPARTMENTS = [
  { code: 'CORP', name: 'Corporate', parentCode: null },
  { code: 'MFG', name: 'Manufacturing', parentCode: 'CORP' },
  { code: 'LOG', name: 'Logistics', parentCode: 'CORP' },
] as const;

export async function seedPhase0(prisma: PrismaClient): Promise<void> {
  await seedEsgConfigDefaults(prisma);
  await seedDepartmentHierarchy(prisma);
  await seedAdminEmployee(prisma);
}

async function seedEsgConfigDefaults(prisma: PrismaClient): Promise<void> {
  await prisma.esgConfig.createMany({
    data: Object.entries(ESG_CONFIG_DEFAULTS).map(([key, value]) => ({
      key,
      value: value as never,
    })),
    skipDuplicates: true,
  });
}

async function seedDepartmentHierarchy(prisma: PrismaClient): Promise<void> {
  for (const department of DEPARTMENTS) {
    const parentId = department.parentCode
      ? await findDepartmentIdByCode(prisma, department.parentCode)
      : null;

    await prisma.department.upsert({
      where: { code: department.code },
      create: {
        code: department.code,
        name: department.name,
        parentId,
      },
      update: {
        name: department.name,
        parentId,
      },
    });
  }
}

async function findDepartmentIdByCode(
  prisma: PrismaClient,
  code: string,
): Promise<number> {
  const department = await prisma.department.findUniqueOrThrow({
    where: { code },
  });
  return department.id;
}

async function seedAdminEmployee(prisma: PrismaClient): Promise<void> {
  const passwordHash = await hashPassword(ADMIN_PASSWORD);

  await prisma.employee.upsert({
    where: { email: ADMIN_EMAIL },
    create: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      passwordHash,
      role: 'admin',
    },
    update: {},
  });
}
