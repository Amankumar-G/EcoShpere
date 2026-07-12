  
/// \==============================  
/// MASTER DATA  
/// \==============================

model Department {  
  id              Int        @id @default(autoincrement())  
  name            String  
  code            String     @unique  
  headEmployeeId  Int?  
  headEmployee    Employee?  @relation("DepartmentHead", fields: \[headEmployeeId\], references: \[id\])  
  parentId        Int?  
  parent          Department? @relation("DeptHierarchy", fields: \[parentId\], references: \[id\])  
  children        Department\[\] @relation("DeptHierarchy")  
  employeeCount   Int        @default(0)  
  status          String     @default("active")

  employees         Employee\[\]            @relation("DeptEmployees")  
  environmentalGoals EnvironmentalGoal\[\]  
  emittedEmissions   EmittedEmission\[\]  
  csrActivities      CsrActivity\[\]  
  diversityMetrics   DiversityMetric\[\]  
  audits             Audit\[\]  
  departmentScores   DepartmentScore\[\]  
  initiatives        Initiative\[\]  
}

model Employee {  
  id                Int       @id @default(autoincrement())  
  name              String  
  email             String    @unique  
  departmentId      Int?  
  department        Department? @relation("DeptEmployees", fields: \[departmentId\], references: \[id\])  
  xp                Int       @default(0)  
  points            Int       @default(0)  
  status            String    @default("active")

  // ESG / carbon footprint — commuting  
  gender            String?   // male | female | other, drives Sex Parity measures  
  homeWorkDistance  Decimal?  @db.Decimal(8, 2\) // km, one-way

  headOfDepartments      Department\[\]           @relation("DepartmentHead")  
  employeeParticipations EmployeeParticipation\[\]  
  trainingCompletions    TrainingCompletion\[\]  
  policyAcknowledgements PolicyAcknowledgement\[\]  
  ownedComplianceIssues  ComplianceIssue\[\]  
  challengeParticipations ChallengeParticipation\[\]  
  employeeBadges         EmployeeBadge\[\]  
  rewardRedemptions      RewardRedemption\[\]  
  notifications          Notification\[\]  
  fleetVehicles          FleetVehicle\[\]  
  emittedEmissions       EmittedEmission\[\]  
  payrollContracts       PayrollContract\[\]  
  assignedInitiatives    Initiative\[\]  
}

model Category {  
  id     Int    @id @default(autoincrement())  
  name   String  
  type   String // "csr\_activity" | "challenge"  
  status String @default("active")

  csrActivities CsrActivity\[\]  
  challenges    Challenge\[\]  
}

// GHG Protocol scope, hierarchical (e.g. "Scope 3 \> Purchased Goods \> Electronics")  
model EmissionScope {  
  id       Int            @id @default(autoincrement())  
  name     String  
  code     String         @unique // e.g. "scope\_1", "scope\_3\_purchased\_goods"  
  parentId Int?  
  parent   EmissionScope? @relation("ScopeHierarchy", fields: \[parentId\], references: \[id\])  
  children EmissionScope\[\] @relation("ScopeHierarchy")

  emissionFactors EmissionFactor\[\]  
}

// Certified database an emission factor can be imported from (e.g. ADEME)  
model SourceDatabase {  
  id             Int       @id @default(autoincrement())  
  name           String  
  provider       String?  
  url            String?  
  lastImportedAt DateTime?

  emissionFactors EmissionFactor\[\]  
}

// The 6 Kyoto Protocol gases \+ custom additions, each with a Global Warming Potential  
model Gas {  
  id     Int     @id @default(autoincrement())  
  name   String  // CO2, CH4, N2O, HFCs, PFCs, SF6, ...  
  symbol String  @unique  
  gwp    Decimal @db.Decimal(10, 2\) // multiplier to convert to CO2-equivalent

  gasLines EmissionFactorGasLine\[\]  
}

model EmissionFactor {  
  id               Int             @id @default(autoincrement())  
  name             String  
  scopeId          Int?  
  scope            EmissionScope?  @relation(fields: \[scopeId\], references: \[id\])  
  sourceDatabaseId Int?  
  sourceDatabase   SourceDatabase? @relation(fields: \[sourceDatabaseId\], references: \[id\])  
  uncertainty      Decimal?        @db.Decimal(5, 2\) // % margin of error  
  computeMethod    Enum (Phycial, Monetary)         @default("physical") // physical | monetary  
  unitOfMeasure    String          // must match the linked product's cost UoM  
  status           String          @default("active")

  gasLines          EmissionFactorGasLine\[\]  
  assignationRules  AssignationRule\[\]  
  emittedEmissions  EmittedEmission\[\]  
}

// One line per greenhouse gas contributing to a factor; summed (in CO2e) \= the factor's total value  
model EmissionFactorGasLine {  
  id               Int            @id @default(autoincrement())  
  emissionFactorId Int  
  emissionFactor   EmissionFactor @relation(fields: \[emissionFactorId\], references: \[id\])  
  gasId            Int  
  gas              Gas            @relation(fields: \[gasId\], references: \[id\])  
  activityType     String?        // production | transport | use | other  
  value            Decimal        @db.Decimal(14, 6\) // quantity of this gas per unit of activity  
  unit             String  
}

// Auto-applies an emission factor to accounting activity matching product/partner/account  
model AssignationRule {  
  id                   Int             @id @default(autoincrement())  
  emissionFactorId     Int  
  emissionFactor       EmissionFactor  @relation(fields: \[emissionFactorId\], references: \[id\])  
  productId            Int?            // loose FK to external ERP product  
  partnerId            Int?            // loose FK to external ERP partner  
  accountId            Int?            // loose FK to external ERP account  
  applicationPeriodStart DateTime?  
  applicationPeriodEnd   DateTime?  
  replaceExisting      Boolean         @default(false)  
  createdAt            DateTime        @default(now())

  // priority is derived at query time from attribute specificity (product \> partner \> account)  
  // then attribute count — not stored, since it depends on the full rule set at match time.  
}

model EnvironmentalGoal {  
  id           Int        @id @default(autoincrement())  
  departmentId Int?  
  department   Department? @relation(fields: \[departmentId\], references: \[id\])  
  metric       String  
  targetValue  Decimal    @db.Decimal(12, 2\)  
  unit         String  
  startDate    DateTime  
  endDate      DateTime  
  status       String     @default("active")  
}

model EsgPolicy {  
  id             Int      @id @default(autoincrement())  
  title          String  
  description    String?  
  version        String?  
  effectiveDate  DateTime?  
  status         String   @default("active")  
  file : pdf  
  acknowledgements PolicyAcknowledgement\[\]  
}

model Badge {  
  id          Int      @id @default(autoincrement())  
  name        String  
  description String?  
  unlockRule  Json  
  icon        String?  
  status      String   @default("active")

  employeeBadges EmployeeBadge\[\]  
}

model Reward {  
  id             Int      @id @default(autoincrement())  
  name           String  
  description    String?  
  pointsRequired Int  
  stock          Int      @default(0)  
  status         String   @default("active")

  redemptions RewardRedemption\[\]  
}

/// \==============================  
/// TRANSACTIONAL DATA  
/// \==============================

// Unifies the 3 activity data sources into one ledger: accounting (auto), fleet  
// commuting (batch, via "Add Emissions"), and manual input — all feed the same  
// carbon footprint report. Emissions (kgCO2e) \= quantity \* emission factor.  
model EmittedEmission {  
  id               Int             @id @default(autoincrement())  
  name             String          // activity label, required for manual entries  
  departmentId     Int?  
  department       Department?     @relation(fields: \[departmentId\], references: \[id\])  
  sourceType       String          // accounting | fleet\_commuting | manual  
  sourceRefId      Int?            // loose FK: journal entry line, or FleetVehicle for commuting  
  emissionFactorId Int?  
  emissionFactor   EmissionFactor? @relation(fields: \[emissionFactorId\], references: \[id\])  
  employeeId       Int?            // set for fleet\_commuting rows  
  employee         Employee?       @relation(fields: \[employeeId\], references: \[id\])  
  quantity         Decimal         @db.Decimal(12, 4\)  
  co2eValue        Decimal         @db.Decimal(14, 4\)  
  periodStart      DateTime?       // commuting rows are added per Emissions Period  
  periodEnd        DateTime?  
  date             DateTime  
  createdAt        DateTime        @default(now())  
}

// Fleet ‣ Configuration ‣ Models — CO2 emissions per vehicle model  
model FleetVehicleModel {  
  id            Int      @id @default(autoincrement())  
  name          String  
  co2Emissions  Decimal  @db.Decimal(10, 4\)

  vehicles FleetVehicle\[\]  
}

// An employee's car, used for the commuting emissions formula  
model FleetVehicle {  
  id        Int               @id @default(autoincrement())  
  employeeId Int  
  employee   Employee         @relation(fields: \[employeeId\], references: \[id\])  
  modelId    Int  
  model      FleetVehicleModel @relation(fields: \[modelId\], references: \[id\])  
  startDate  DateTime  
  endDate    DateTime?  
}

// Payroll contract data needed for the pay gap formula (same job, by gender)  
model PayrollContract {  
  id               Int      @id @default(autoincrement())  
  employeeId       Int  
  employee         Employee @relation(fields: \[employeeId\], references: \[id\])  
  jobPosition      String  
  contractType     String   // permanent | temporary  
  leadershipLevel  String?  // management | non\_management  
  country          String?  
  wage             Decimal  @db.Decimal(12, 2\)  
  startDate        DateTime  
  endDate          DateTime?  
}

// ESG ‣ Act ‣ Initiatives — lightweight project-style CO2 reduction actions  
model Initiative {  
  id                     Int         @id @default(autoincrement())  
  title                  String  
  description            String?  
  departmentId           Int?  
  department             Department? @relation(fields: \[departmentId\], references: \[id\])  
  assigneeEmployeeId     Int?  
  assigneeEmployee       Employee?   @relation(fields: \[assigneeEmployeeId\], references: \[id\])  
  estimatedCo2Reduction  Decimal?    @db.Decimal(12, 2\) // kgCO2e, does not affect footprint until realized  
  actualCo2Reduction     Decimal?    @db.Decimal(12, 2\)  
  progress               Decimal     @default(0) @db.Decimal(5, 2\)  
  deadline               DateTime?  
  status                 String      @default("open")  
}

model CsrActivity {  
  id           Int        @id @default(autoincrement())  
  title        String  
  categoryId   Int?  
  category     Category?  @relation(fields: \[categoryId\], references: \[id\])  
  departmentId Int?  
  department   Department? @relation(fields: \[departmentId\], references: \[id\])  
  description  String?  
  startDate    DateTime?  
  endDate      DateTime?  
  status       String     @default("draft")

  participations EmployeeParticipation\[\]  
}

model EmployeeParticipation {  
  id               Int         @id @default(autoincrement())  
  employeeId       Int  
  employee         Employee    @relation(fields: \[employeeId\], references: \[id\])  
  csrActivityId    Int  
  csrActivity      CsrActivity @relation(fields: \[csrActivityId\], references: \[id\])  
  proofUrl         String?  
  approvalStatus   String      @default("pending")  
  pointsEarned     Int         @default(0)  
  completionDate   DateTime?

  @@unique(\[employeeId, csrActivityId\])  
}

model DiversityMetric {  
  id           Int        @id @default(autoincrement())  
  departmentId Int?  
  department   Department? @relation(fields: \[departmentId\], references: \[id\])  
  metricName   String  
  metricValue  Decimal    @db.Decimal(10, 2\)  
  periodStart  DateTime?  
  periodEnd    DateTime?  
}

model TrainingCompletion {  
  id            Int       @id @default(autoincrement())  
  employeeId    Int  
  employee      Employee  @relation(fields: \[employeeId\], references: \[id\])  
  trainingName  String  
  completedOn   DateTime?  
  status        String    @default("pending")  
}

model PolicyAcknowledgement {  
  id              Int       @id @default(autoincrement())  
  employeeId      Int  
  employee        Employee  @relation(fields: \[employeeId\], references: \[id\])  
  esgPolicyId     Int  
  esgPolicy       EsgPolicy @relation(fields: \[esgPolicyId\], references: \[id\])  
  acknowledgedAt  DateTime?  
  status          String    @default("pending")

  @@unique(\[employeeId, esgPolicyId\])  
}

model Audit {  
  id            Int        @id @default(autoincrement())  
  title         String  
  departmentId  Int?  
  department    Department? @relation(fields: \[departmentId\], references: \[id\])  
  auditDate     DateTime  
  auditor       String?  
  status        String     @default("planned")  
  summary       String?

  complianceIssues ComplianceIssue\[\]  
}

model ComplianceIssue {  
  id               Int      @id @default(autoincrement())  
  auditId          Int?  
  audit            Audit?   @relation(fields: \[auditId\], references: \[id\])  
  severity         String   // low/medium/high/critical  
  description      String  
  ownerEmployeeId  Int  
  ownerEmployee    Employee @relation(fields: \[ownerEmployeeId\], references: \[id\])  
  dueDate          DateTime  
  status           String   @default("open")  
  createdAt        DateTime @default(now())  
}

model Challenge {  
  id                Int      @id @default(autoincrement())  
  title             String  
  categoryId        Int?  
  category          Category? @relation(fields: \[categoryId\], references: \[id\])  
  description       String?  
  xp                Int      @default(0)  
  difficulty        String?  
  evidenceRequired  Boolean  @default(false)  
  deadline          DateTime?  
  status            String   @default("draft") // draft/active/under\_review/completed/archived

  participations ChallengeParticipation\[\]  
}

model ChallengeParticipation {  
  id               Int       @id @default(autoincrement())  
  challengeId      Int  
  challenge        Challenge @relation(fields: \[challengeId\], references: \[id\])  
  employeeId       Int  
  employee         Employee  @relation(fields: \[employeeId\], references: \[id\])  
  progress         Decimal   @default(0) @db.Decimal(5, 2\)  
  proofUrl         String?  
  approvalStatus   String    @default("pending")  
  xpAwarded        Int       @default(0)

  @@unique(\[challengeId, employeeId\])  
}

model EmployeeBadge {  
  id          Int      @id @default(autoincrement())  
  employeeId  Int  
  employee    Employee @relation(fields: \[employeeId\], references: \[id\])  
  badgeId     Int  
  badge       Badge    @relation(fields: \[badgeId\], references: \[id\])  
  awardedAt   DateTime @default(now())

  @@unique(\[employeeId, badgeId\])  
}

model RewardRedemption {  
  id              Int      @id @default(autoincrement())  
  employeeId      Int  
  employee        Employee @relation(fields: \[employeeId\], references: \[id\])  
  rewardId        Int  
  reward          Reward   @relation(fields: \[rewardId\], references: \[id\])  
  pointsDeducted  Int  
  redeemedAt      DateTime @default(now())  
  status          String   @default("confirmed")  
}

model DepartmentScore {  
  id                  Int        @id @default(autoincrement())  
  departmentId        Int  
  department          Department @relation(fields: \[departmentId\], references: \[id\])  
  periodStart         DateTime  
  periodEnd           DateTime  
  environmentalScore  Decimal    @db.Decimal(5, 2\)  
  socialScore         Decimal    @db.Decimal(5, 2\)  
  governanceScore     Decimal    @db.Decimal(5, 2\)  
  totalScore          Decimal    @db.Decimal(5, 2\)

  @@unique(\[departmentId, periodStart, periodEnd\])  
}

model EsgConfig {  
  key   String @id  
  value Json  
}  
// rows include: auto\_emission\_calculation, evidence\_required\_for\_approval,  
// badge\_auto\_award, esg\_weights, weekly\_office\_attendance (days/week, used in  
// the commuting formula: days \* home\_work\_distance \* 2 \* (office\_days/7) \* vehicle\_co2)

model Notification {  
  id          Int      @id @default(autoincrement())  
  employeeId  Int?  
  employee    Employee? @relation(fields: \[employeeId\], references: \[id\])  
  type        String   // compliance\_issue/approval\_decision/policy\_reminder/badge\_unlock  
  channel     String   @default("in\_app")  
  payload     Json?  
  isRead      Boolean  @default(false)  
  createdAt   DateTime @default(now())  
}

