-- CreateTable
CREATE TABLE "csr_activities" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" INTEGER,
    "departmentId" INTEGER,
    "points" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "csr_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_participations" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "csrActivityId" INTEGER NOT NULL,
    "proofUrl" TEXT,
    "approvalStatus" TEXT NOT NULL DEFAULT 'pending',
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "completionDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_participations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenges" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" INTEGER,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "difficulty" TEXT,
    "evidenceRequired" BOOLEAN NOT NULL DEFAULT false,
    "deadline" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge_participations" (
    "id" SERIAL NOT NULL,
    "challengeId" INTEGER NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "progress" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "proofUrl" TEXT,
    "approvalStatus" TEXT NOT NULL DEFAULT 'pending',
    "xpAwarded" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "challenge_participations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unlockRule" JSONB NOT NULL,
    "icon" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_badges" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "badgeId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'awarded',
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rewards" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "pointsRequired" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_redemptions" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "rewardId" INTEGER NOT NULL,
    "pointsDeducted" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reward_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employee_participations_employeeId_csrActivityId_key" ON "employee_participations"("employeeId", "csrActivityId");

-- CreateIndex
CREATE UNIQUE INDEX "challenge_participations_challengeId_employeeId_key" ON "challenge_participations"("challengeId", "employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "employee_badges_employeeId_badgeId_key" ON "employee_badges"("employeeId", "badgeId");

-- AddForeignKey
ALTER TABLE "csr_activities" ADD CONSTRAINT "csr_activities_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "csr_activities" ADD CONSTRAINT "csr_activities_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_participations" ADD CONSTRAINT "employee_participations_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_participations" ADD CONSTRAINT "employee_participations_csrActivityId_fkey" FOREIGN KEY ("csrActivityId") REFERENCES "csr_activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_participations" ADD CONSTRAINT "challenge_participations_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_participations" ADD CONSTRAINT "challenge_participations_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_badges" ADD CONSTRAINT "employee_badges_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_badges" ADD CONSTRAINT "employee_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "rewards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
