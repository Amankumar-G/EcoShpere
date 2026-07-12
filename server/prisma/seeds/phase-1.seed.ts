import { PrismaClient } from '@prisma/client';

/**
 * Phase 1 — operational-records master data.
 *
 * Seeds the exact records the Phase 1 (and Phase 2) demo consumes: a couple of
 * accounts and partners, a "Grid Electricity" product measured in kWh, a fleet
 * model, and a sample employee with a home-work distance for commuting. The
 * invoice/expense/travel records themselves are created live during the demo.
 *
 * Idempotent: models with a unique key are upserted; partners and fleet models
 * (no natural unique key) are found-or-created by name.
 */

const ACCOUNTS = [
  { code: 'UTIL', name: 'Utilities', type: 'expense' },
  { code: 'CONS', name: 'Consumables', type: 'expense' },
] as const;

const PRODUCTS = [
  { code: 'GRID-ELEC', name: 'Grid Electricity', uom: 'kWh' },
  { code: 'A4-PAPER', name: 'A4 Paper', uom: 'ream' },
] as const;

const PARTNERS = [
  { name: 'GridCo Energy', type: 'vendor' },
  { name: 'OfficeCorp', type: 'vendor' },
] as const;

const FLEET_MODELS = [{ name: 'Compact Petrol', co2Emissions: 0.12 }] as const;

const SAMPLE_EMPLOYEE = {
  name: 'Jordan Rivers',
  email: 'jordan.rivers@ecosphere.local',
  passwordHash: 'seed-placeholder',
  gender: 'female',
  homeWorkDistance: 15,
} as const;

export async function seedPhase1(prisma: PrismaClient): Promise<void> {
  await seedAccounts(prisma);
  await seedProducts(prisma);
  await seedPartners(prisma);
  await seedFleetModels(prisma);
  await seedSampleEmployee(prisma);
}

async function seedAccounts(prisma: PrismaClient): Promise<void> {
  for (const account of ACCOUNTS) {
    await prisma.account.upsert({
      where: { code: account.code },
      create: account,
      update: { name: account.name, type: account.type },
    });
  }
}

async function seedProducts(prisma: PrismaClient): Promise<void> {
  for (const product of PRODUCTS) {
    await prisma.product.upsert({
      where: { code: product.code },
      create: product,
      update: { name: product.name, uom: product.uom },
    });
  }
}

async function seedPartners(prisma: PrismaClient): Promise<void> {
  for (const partner of PARTNERS) {
    const existing = await prisma.partner.findFirst({
      where: { name: partner.name },
    });
    if (!existing) {
      await prisma.partner.create({ data: partner });
    }
  }
}

async function seedFleetModels(prisma: PrismaClient): Promise<void> {
  for (const model of FLEET_MODELS) {
    const existing = await prisma.fleetVehicleModel.findFirst({
      where: { name: model.name },
    });
    if (!existing) {
      await prisma.fleetVehicleModel.create({ data: model });
    }
  }
}

async function seedSampleEmployee(prisma: PrismaClient): Promise<void> {
  const department = await prisma.department.findUnique({
    where: { code: 'LOG' },
  });

  await prisma.employee.upsert({
    where: { email: SAMPLE_EMPLOYEE.email },
    create: {
      name: SAMPLE_EMPLOYEE.name,
      email: SAMPLE_EMPLOYEE.email,
      passwordHash: SAMPLE_EMPLOYEE.passwordHash,
      role: 'employee',
      gender: SAMPLE_EMPLOYEE.gender,
      homeWorkDistance: SAMPLE_EMPLOYEE.homeWorkDistance,
      departmentId: department?.id ?? null,
    },
    update: {},
  });
}
