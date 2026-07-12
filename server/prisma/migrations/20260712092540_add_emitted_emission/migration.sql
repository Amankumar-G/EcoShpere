-- CreateEnum
CREATE TYPE "EmissionSourceType" AS ENUM ('accounting', 'fleet_commuting', 'manual');

-- CreateTable
CREATE TABLE "EmittedEmission" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sourceType" "EmissionSourceType" NOT NULL DEFAULT 'manual',
    "sourceRefId" INTEGER,
    "employeeId" INTEGER,
    "quantity" DECIMAL(18,4) NOT NULL,
    "co2eValue" DECIMAL(18,4) NOT NULL,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "date" TIMESTAMP(3) NOT NULL,
    "evidenceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "departmentId" INTEGER NOT NULL,
    "emissionFactorId" INTEGER NOT NULL,

    CONSTRAINT "EmittedEmission_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EmittedEmission" ADD CONSTRAINT "EmittedEmission_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmittedEmission" ADD CONSTRAINT "EmittedEmission_emissionFactorId_fkey" FOREIGN KEY ("emissionFactorId") REFERENCES "EmissionFactor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
