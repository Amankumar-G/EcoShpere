-- DropForeignKey
ALTER TABLE "EmittedEmission" DROP CONSTRAINT "EmittedEmission_emissionFactorId_fkey";

-- AlterTable
ALTER TABLE "EmittedEmission" ALTER COLUMN "emissionFactorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "EmittedEmission" ADD CONSTRAINT "EmittedEmission_emissionFactorId_fkey" FOREIGN KEY ("emissionFactorId") REFERENCES "EmissionFactor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
