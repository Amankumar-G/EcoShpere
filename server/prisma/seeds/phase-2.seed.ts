import { PrismaClient } from '@prisma/client';

const GWP_METRIC = 'AR5';

const GASES = [
  { symbol: 'CO2', name: 'Carbon dioxide', gwp: 1 },
  { symbol: 'CH4', name: 'Methane', gwp: 28 },
  { symbol: 'N2O', name: 'Nitrous oxide', gwp: 265 },
  { symbol: 'HFC-134a', name: 'Hydrofluorocarbon-134a', gwp: 1300 },
  { symbol: 'CF4', name: 'Perfluoromethane (PFC)', gwp: 6630 },
  { symbol: 'SF6', name: 'Sulfur hexafluoride', gwp: 23500 },
  { symbol: 'NF3', name: 'Nitrogen trifluoride', gwp: 16100 },
] as const;

interface EmissionScopeSeed {
  code: string;
  name: string;
  parentCode: string | null;
}

const SCOPE_1: EmissionScopeSeed = {
  code: 'scope_1',
  name: 'Scope 1 — Direct emissions',
  parentCode: null,
};

const SCOPE_2: EmissionScopeSeed = {
  code: 'scope_2',
  name: 'Scope 2 — Indirect emissions from purchased energy',
  parentCode: null,
};

const SCOPE_3: EmissionScopeSeed = {
  code: 'scope_3',
  name: 'Scope 3 — Value chain emissions',
  parentCode: null,
};

const SCOPE_3_CATEGORIES: Array<{ code: string; name: string }> = [
  { code: 'scope_3_1_purchased_goods', name: 'Purchased goods & services' },
  { code: 'scope_3_2_capital_goods', name: 'Capital goods' },
  {
    code: 'scope_3_3_fuel_energy_activities',
    name: 'Fuel- & energy-related activities',
  },
  {
    code: 'scope_3_4_upstream_transportation',
    name: 'Upstream transportation & distribution',
  },
  {
    code: 'scope_3_5_waste_generated',
    name: 'Waste generated in operations',
  },
  { code: 'scope_3_6_business_travel', name: 'Business travel' },
  { code: 'scope_3_7_employee_commuting', name: 'Employee commuting' },
  { code: 'scope_3_8_upstream_leased_assets', name: 'Upstream leased assets' },
  {
    code: 'scope_3_9_downstream_transportation',
    name: 'Downstream transportation & distribution',
  },
  {
    code: 'scope_3_10_processing_of_sold_products',
    name: 'Processing of sold products',
  },
  { code: 'scope_3_11_use_of_sold_products', name: 'Use of sold products' },
  {
    code: 'scope_3_12_end_of_life_treatment',
    name: 'End-of-life treatment of sold products',
  },
  {
    code: 'scope_3_13_downstream_leased_assets',
    name: 'Downstream leased assets',
  },
  { code: 'scope_3_14_franchises', name: 'Franchises' },
  { code: 'scope_3_15_investments', name: 'Investments' },
];

const SOURCE_DATABASES = [
  { name: 'ADEME', provider: 'ADEME' },
  { name: 'DEFRA', provider: 'DEFRA' },
  { name: 'EPA', provider: 'EPA' },
  { name: 'IEA', provider: 'IEA' },
] as const;

export async function seedPhase2(prisma: PrismaClient): Promise<void> {
  await seedGases(prisma);
  await seedEmissionScopeTree(prisma);
  await seedSourceDatabases(prisma);
}

async function seedGases(prisma: PrismaClient): Promise<void> {
  for (const gas of GASES) {
    await prisma.gas.upsert({
      where: { symbol: gas.symbol },
      create: {
        name: gas.name,
        symbol: gas.symbol,
        gwp: gas.gwp,
        gwpMetric: GWP_METRIC,
      },
      update: { name: gas.name, gwp: gas.gwp, gwpMetric: GWP_METRIC },
    });
  }
}

async function seedEmissionScopeTree(prisma: PrismaClient): Promise<void> {
  await upsertEmissionScope(prisma, SCOPE_1);
  await upsertEmissionScope(prisma, SCOPE_2);
  await upsertEmissionScope(prisma, SCOPE_3);

  for (const category of SCOPE_3_CATEGORIES) {
    await upsertEmissionScope(prisma, {
      ...category,
      parentCode: SCOPE_3.code,
    });
  }
}

async function upsertEmissionScope(
  prisma: PrismaClient,
  scope: EmissionScopeSeed,
): Promise<void> {
  const parentId = scope.parentCode
    ? await findEmissionScopeIdByCode(prisma, scope.parentCode)
    : null;

  await prisma.emissionScope.upsert({
    where: { code: scope.code },
    create: { code: scope.code, name: scope.name, parentId },
    update: { name: scope.name, parentId },
  });
}

async function findEmissionScopeIdByCode(
  prisma: PrismaClient,
  code: string,
): Promise<number> {
  const scope = await prisma.emissionScope.findUniqueOrThrow({
    where: { code },
  });
  return scope.id;
}

async function seedSourceDatabases(prisma: PrismaClient): Promise<void> {
  for (const sourceDatabase of SOURCE_DATABASES) {
    const existing = await prisma.sourceDatabase.findFirst({
      where: { name: sourceDatabase.name },
    });

    if (existing) {
      await prisma.sourceDatabase.update({
        where: { id: existing.id },
        data: { provider: sourceDatabase.provider },
      });
    } else {
      await prisma.sourceDatabase.create({ data: sourceDatabase });
    }
  }
}
