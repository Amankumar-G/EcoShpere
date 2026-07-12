import { PrismaClient } from '@prisma/client';
import { createPrismaPgAdapter } from '../src/prisma/prisma-adapter.factory';
import { seedPhase0 } from './seeds/phase-0.seed';

/**
 * Seed registry.
 *
 * Each phase of the roadmap owns its own seed group and appends itself
 * here without touching the seed groups of earlier phases. To add a new
 * phase's seeds:
 *
 *   1. Create `prisma/seeds/phase-N.seed.ts` exporting `seedPhaseN(prisma)`.
 *   2. Import it below and push it onto `seedGroups`, in phase order.
 *
 * Every seed group must be idempotent: running the full list twice must
 * leave the database in the same state as running it once.
 */
const seedGroups: Array<(prisma: PrismaClient) => Promise<void>> = [seedPhase0];

async function main(): Promise<void> {
  const prisma = new PrismaClient({
    adapter: createPrismaPgAdapter(requireDatabaseUrl()),
  });

  try {
    for (const seedGroup of seedGroups) {
      await seedGroup(prisma);
    }
  } finally {
    await prisma.$disconnect();
  }
}

function requireDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL must be set to run the seed script');
  }
  return databaseUrl;
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
