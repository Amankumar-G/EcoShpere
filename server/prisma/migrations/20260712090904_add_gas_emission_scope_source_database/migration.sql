-- CreateTable
CREATE TABLE "Gas" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "gwp" DECIMAL(10,2) NOT NULL,
    "gwpMetric" TEXT NOT NULL DEFAULT 'AR5',

    CONSTRAINT "Gas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmissionScope" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "parentId" INTEGER,

    CONSTRAINT "EmissionScope_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceDatabase" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT,
    "url" TEXT,
    "lastImportedAt" TIMESTAMP(3),

    CONSTRAINT "SourceDatabase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Gas_symbol_key" ON "Gas"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "EmissionScope_code_key" ON "EmissionScope"("code");

-- AddForeignKey
ALTER TABLE "EmissionScope" ADD CONSTRAINT "EmissionScope_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "EmissionScope"("id") ON DELETE SET NULL ON UPDATE CASCADE;
