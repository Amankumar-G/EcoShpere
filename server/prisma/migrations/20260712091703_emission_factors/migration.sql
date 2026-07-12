-- CreateEnum
CREATE TYPE "ComputeMethod" AS ENUM ('physical', 'monetary');

-- CreateTable
CREATE TABLE "EmissionFactor" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "uncertainty" DECIMAL(5,2),
    "computeMethod" "ComputeMethod" NOT NULL,
    "unitOfMeasure" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "value" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "scopeId" INTEGER NOT NULL,
    "sourceDatabaseId" INTEGER NOT NULL,

    CONSTRAINT "EmissionFactor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmissionFactorGasLine" (
    "id" SERIAL NOT NULL,
    "activityType" TEXT,
    "value" DECIMAL(18,4) NOT NULL,
    "unit" TEXT NOT NULL,
    "emissionFactorId" INTEGER NOT NULL,
    "gasId" INTEGER NOT NULL,

    CONSTRAINT "EmissionFactorGasLine_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EmissionFactor" ADD CONSTRAINT "EmissionFactor_scopeId_fkey" FOREIGN KEY ("scopeId") REFERENCES "EmissionScope"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmissionFactor" ADD CONSTRAINT "EmissionFactor_sourceDatabaseId_fkey" FOREIGN KEY ("sourceDatabaseId") REFERENCES "SourceDatabase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmissionFactorGasLine" ADD CONSTRAINT "EmissionFactorGasLine_emissionFactorId_fkey" FOREIGN KEY ("emissionFactorId") REFERENCES "EmissionFactor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmissionFactorGasLine" ADD CONSTRAINT "EmissionFactorGasLine_gasId_fkey" FOREIGN KEY ("gasId") REFERENCES "Gas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
