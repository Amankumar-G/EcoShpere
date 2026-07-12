-- CreateTable
CREATE TABLE "environmental_goals" (
    "id" SERIAL NOT NULL,
    "departmentId" INTEGER,
    "metric" TEXT NOT NULL,
    "targetValue" DECIMAL(12,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "environmental_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "initiatives" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "departmentId" INTEGER,
    "assigneeEmployeeId" INTEGER,
    "estimatedCo2Reduction" DECIMAL(12,2),
    "actualCo2Reduction" DECIMAL(12,2),
    "progress" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "deadline" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "initiatives_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "environmental_goals" ADD CONSTRAINT "environmental_goals_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "initiatives" ADD CONSTRAINT "initiatives_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "initiatives" ADD CONSTRAINT "initiatives_assigneeEmployeeId_fkey" FOREIGN KEY ("assigneeEmployeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
