-- DropForeignKey
ALTER TABLE "EmittedEmission" DROP CONSTRAINT "EmittedEmission_departmentId_fkey";

-- AlterTable
ALTER TABLE "EmittedEmission" ALTER COLUMN "departmentId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "AssignationRule" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER,
    "partnerId" INTEGER,
    "accountId" INTEGER,
    "applicationPeriodStart" TIMESTAMP(3),
    "applicationPeriodEnd" TIMESTAMP(3),
    "replaceExisting" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emissionFactorId" INTEGER NOT NULL,

    CONSTRAINT "AssignationRule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EmittedEmission" ADD CONSTRAINT "EmittedEmission_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignationRule" ADD CONSTRAINT "AssignationRule_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignationRule" ADD CONSTRAINT "AssignationRule_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignationRule" ADD CONSTRAINT "AssignationRule_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignationRule" ADD CONSTRAINT "AssignationRule_emissionFactorId_fkey" FOREIGN KEY ("emissionFactorId") REFERENCES "EmissionFactor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
