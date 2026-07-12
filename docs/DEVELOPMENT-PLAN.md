# EcoSphere ESG Platform — Phase-Wise Development Plan

**Status:** v1.0 · **Audience:** Development team (3 full-stack developers) · **Date:** 2026-07-12

This plan breaks the EcoSphere build into **7 phases (0–6)**, ordered by dependency so each phase
produces a working, testable increment on top of the previous one. There is no fixed calendar
deadline; effort is expressed in relative sizes (S / M / L / XL per developer-track). Phases should
not be started until the previous phase's **exit criteria** are met — that is the "regular testing"
discipline built into the plan.

---

## 1. Guiding principles

1. **Vertical-slice ownership.** Each developer owns a pillar end-to-end (schema → NestJS module →
   Next.js UI → tests). Fewer handoffs, clear accountability, natural parallelism.
2. **Incremental migrations, not big-bang schema.** Each phase adds only its own Prisma models via
   `prisma migrate dev`. The Database Design doc is the *target*; we reach it stepwise. This keeps
   every migration reviewable and every phase's data model exercised by real features immediately.
3. **The emission engine consumes our own records.** EcoSphere is **not an Odoo module** — the
   schema's "loose FKs" (`productId`, `partnerId`, `accountId`, `sourceRefId`) must point at
   first-class EcoSphere models. Phase 1 builds that operational-records layer (products, partners,
   accounts, invoices, expenses, fleet, travel) so Phase 2's automation has real inputs. Loose `Int?`
   FKs from the design doc become **real foreign keys** with relations.
4. **Every phase ends demoable.** Each phase has a scripted demo (seed data + a click-through path)
   and a test gate. Nothing merges to `main` without unit tests; no phase closes without its
   integration tests green in CI.
5. **Worked examples are test fixtures.** The scope doc contains numeric worked examples (natural-gas
   factor ≈ 0.18326 kgCO₂e/kWh, paper-purchase rule resolution, 57.6 kgCO₂e commuting batch, 70.5
   governance score). Every one becomes an automated test. If the engine can't reproduce the doc,
   the engine is wrong.
6. **Config over code.** All toggles and weights (`auto_emission_calculation`,
   `evidence_required_for_approval`, `badge_auto_award`, `esg_weights`, `weekly_office_attendance`,
   scoring sub-weights, penalty constants) live in `EsgConfig` from Phase 0 so behavior is tunable
   without deploys.

---

## 2. Team model

Three full-stack developers, each owning a vertical track. Assignments repeat across phases so
domain knowledge compounds:

| Dev | Primary ownership | Secondary |
|---|---|---|
| **Nirat** | Environmental pillar: operational records, emission engine, factors, footprint | Scoring (E component) |
| **Aman** | Social + Gamification: CSR, challenges, XP/points, badges, rewards | Scoring (S component), notifications UX |
| **Avani** | Governance + Platform: auth/RBAC, settings, notifications infra, policies, audits, compliance, reports/exports | Scoring (G component + roll-up), CI/CD |

**Shared conventions (locked in Phase 0, enforced in review):**
- **Server:** one NestJS module per domain (`src/modules/<domain>` with `controller / service / dto /
  entities`), `class-validator` DTOs on every endpoint, Prisma access only through services,
  vitest unit tests colocated, e2e specs in `server/test`.
- **Client:** feature folders under `src/components/<feature>`, server state via TanStack Query
  (one `src/hooks/use<Domain>.ts` per domain wrapping an axios API client), forms with
  react-hook-form + zod resolvers, shadcn/base-ui components, shared `DataTable`, `FormDialog`,
  `ConfirmDialog`, `PageHeader` primitives built once in Phase 0.
- **Workflow:** short-lived branches → PR → 1 review + green CI (`lint`, `test`, build for both
  apps) → squash-merge. Phase exit = demo + integration suite green + retro.

---

## 3. Phase overview & dependency graph

```
Phase 0 ── Platform foundation (auth/RBAC, departments, employees, settings, notifications, UI shell)
   │
Phase 1 ── Operational records (products, partners, accounts, invoices, expenses, fleet, travel, payroll)
   │
Phase 2 ── Emission engine (gases, scopes, factors, assignation rules, EmittedEmission, 3 capture paths)
   │
Phase 3 ── Pillar features, 3 parallel tracks
   │         A: goals, initiatives, footprint dashboards
   │         B: CSR, challenges, badges, rewards
   │         C: policies, audits, compliance, notification triggers
   │
Phase 4 ── Scoring engine (E/S/G formulas, DepartmentScore, overall ESG, org dashboard)
   │
Phase 5 ── Reports & exports (4 standard reports, custom builder, PDF/Excel/CSV)
   │
Phase 6 ── Hardening & stretch (e2e suite, performance, rankings, smart dashboards, mobile)
```

Phases 0–2 are sequential (each is the substrate of the next). Phase 3 is deliberately structured
as three independent tracks so all devs run in parallel. Phases 4–5 consume everything and are
mostly cross-cutting.

| Phase | Relative size (team) | Can overlap with |
|---|---|---|
| 0 | M | — |
| 1 | M–L | Aman/C can start Phase 3 model design |
| 2 | L (heaviest logic) | Aman/C start Phase 3 tracks B & C early |
| 3 | L (3 parallel tracks) | — |
| 4 | M | Phase 5 scaffolding |
| 5 | M–L | — |
| 6 | M (open-ended stretch) | — |

---

## 4. Phase 0 — Platform foundation

**Goal:** the skeleton every later phase stands on: identity, org structure, configuration,
notifications plumbing, and the client app shell. Ends with a logged-in admin managing departments
and employees and flipping settings.

### Prisma models added
`Role` (or enum on `User`), `Employee` (with `gender`, `homeWorkDistance`, `xp`, `points`, link to
`User`), `Department` (self-referential hierarchy, head employee), `Category`, `EsgConfig`
(key/value JSON), `Notification`.

### Backend (NestJS)
- Extend existing `auth`/`user` modules with **RBAC**: roles `admin | manager | employee`; roles
  guard + `@Roles()` decorator; managers scoped to their department subtree.
- `employees` module: CRUD, link/invite `User` ↔ `Employee`, department assignment.
- `departments` module: CRUD with hierarchy (parent/children), auto-maintained `employeeCount`.
- `esg-config` module: typed get/set over the key/value store; seed defaults for every documented
  key (`auto_emission_calculation: false`, `evidence_required_for_approval: true`,
  `badge_auto_award: true`, `esg_weights: {e:0.4, s:0.3, g:0.3}`, `weekly_office_attendance: 5`,
  scoring sub-weights and penalty constants as documented in the scope doc §6–7).
- `notifications` module: persistence + list/mark-read API + a **delivery abstraction**
  (`NotificationChannel` interface with `in_app` implemented now, `email` adapter stubbed behind the
  same interface so Phase 3 can plug in a provider without touching call sites).
- File upload service (local disk in dev, S3-compatible interface) — needed later for CSR proofs and
  policy PDFs; build the primitive now.
- Seed framework: idempotent `prisma/seed.ts` with per-phase seed groups.

### Frontend (Next.js)
- Authenticated app shell: sidebar navigation (Dashboard / Environmental / Social / Governance /
  Gamification / Records / Reports / Settings), topbar with notification bell, role-aware menu.
- Shared primitives: `DataTable` (sorting/pagination/filtering), `FormDialog`, `ConfirmDialog`,
  `PageHeader`, empty/loading/error states, toast wiring.
- Pages: Departments (tree + CRUD), Employees (list + CRUD + role assignment), Settings (toggles +
  weights editor bound to `EsgConfig`), Notifications drawer.

### Per-dev split
- **Nirat:** departments + employees modules and pages.
- **Aman:** app shell, shared UI primitives, notifications UI.
- **Avani:** RBAC, esg-config module + Settings page, notification/file-upload infrastructure, seed
  framework, CI updates.

### Testing gate (exit criteria)
- Unit: RBAC guard matrix (role × endpoint), config get/set typing, department hierarchy ops.
- Integration (supertest + test DB): auth flow, employee CRUD as each role, settings persistence.
- Demo: admin logs in → creates department tree → invites employee → employee logs in and sees
  role-limited nav → admin flips a setting and it persists.

---

## 5. Phase 1 — Operational records (the emission inputs)

**Goal:** the "mini-ERP" data-entry layer. Because EcoSphere is standalone, users must be able to
**add the records that emissions are calculated from**: invoices/purchases, expenses, accounts,
vendors, products, employee travel, fleet, and payroll. This phase turns every loose FK in the
design doc into a real relation and gives Phase 2's engine authentic inputs.

### Prisma models added
| Model | Purpose | Notes |
|---|---|---|
| `Product` | Purchasable good/service | `name`, `code`, `uom` (kWh, L, km, kg, unit, ream…), `defaultAccountId?`, status. UoM is critical — physical factors must match it. |
| `Partner` | Vendor/customer | `name`, `type (vendor/customer/both)`, contact fields. |
| `Account` | Chart-of-accounts entry | `code`, `name`, `type (expense/asset/…)`; what monetary assignation rules attach to. |
| `Invoice` + `InvoiceLine` | Purchase/vendor bills | Header: partner, date, currency, status (`draft/posted`), totals. Line: product?, account, description, `quantity`, `uom`, `unitPrice`, `amount`. **Posting an Invoice is the trigger event for Phase 2 Path A.** |
| `ExpenseRecord` | Employee-submitted expense | employee, date, account?, product?, amount, quantity?, uom?, description; same posting semantics as invoice lines. |
| `FleetVehicleModel` | Vehicle catalog | `name`, `co2Emissions` (kgCO₂e/km). |
| `FleetVehicle` | Employee ↔ vehicle assignment | employee, model, `startDate`/`endDate` (only one active per employee at a time — validate). |
| `BusinessTravel` | One-off employee travel | employee, mode (`flight/train/car/bus`), origin/destination or distance (km), date, purpose. Feeds Scope 3 Cat 6 via manual/auto factor pick in Phase 2. |
| `PayrollContract` | Pay-gap input | jobPosition, contractType, leadershipLevel, country, wage, dates. |

Design note: a lightweight `postedAt` / status field on `Invoice` and `ExpenseRecord` gives the
Phase 2 engine a clean "record became final" event to hook, and lets records be edited freely in
draft.

### Backend
- CRUD modules + DTO validation for all models above; posting endpoints (`POST /invoices/:id/post`)
  emitting a domain event (NestJS `EventEmitter2`) that Phase 2 will subscribe to — the event bus
  goes in now, the listener comes later.
- CSV import for `Product`, `Partner`, `Account`, `FleetVehicleModel` (master data arrives in bulk
  in real life; also makes seeding/demoing painless).
- Validation rules: invoice line amount = qty × unit price; one active fleet vehicle per employee;
  wage > 0; UoM from a controlled vocabulary list.

### Frontend
- **Records** section in nav: Invoices (list + line-item editor + post action), Expenses (submit +
  manager approval list), Products / Partners / Accounts (master-data tables + CSV import), Fleet
  (models catalog + "my vehicle" assignment), Business Travel (employee self-service entry),
  Payroll Contracts (admin-only).

### Per-dev split
- **Nirat:** Product/Partner/Account + Invoice/InvoiceLine (model, posting flow, UI).
- **Aman:** ExpenseRecord + BusinessTravel + Fleet (models + UI, incl. employee self-service).
- **Avani:** PayrollContract, CSV import framework, posting event bus, integration tests.

### Testing gate
- Unit: line-total math, posting state machine (draft→posted, no edit after post), fleet-assignment
  overlap validation, CSV import parsing (happy + malformed rows).
- Integration: create → post invoice emits event (assert with test listener); expense approval flow;
  role checks (employee can't see payroll).
- Demo: seed master data via CSV → enter a utility invoice for 12,000 kWh of "Grid Electricity" →
  post it → employee logs an expense and a business trip → admin assigns a fleet vehicle. (These
  exact records get consumed live in the Phase 2 demo.)

---

## 6. Phase 2 — Emission engine (the heart of the platform)

**Goal:** GHG-Protocol-correct carbon accounting: configurable emission factors with gas-level
breakdown, assignation rules, and the unified `EmittedEmission` ledger fed by **three capture
paths** — automatic from accounting records, batch fleet commuting, and manual entry. This is the
highest-risk, most logic-dense phase; it gets the deepest test coverage.

### Prisma models added
`Gas` (seed the Kyoto basket with **AR5 100-yr GWPs** — CO₂ 1, CH₄ 28, N₂O 265, HFC-134a 1300,
SF₆ 23500 — and record "AR5" in seed metadata), `EmissionScope` (hierarchical; seed Scope 1, Scope 2,
Scope 3 + all **15 Scope-3 categories**), `SourceDatabase` (ADEME, DEFRA, EPA, IEA seeds),
`EmissionFactor` (with `computeMethod` as a proper enum `physical | monetary` — fixing the design
doc's `Phycial` typo — plus `unitOfMeasure`, `uncertainty`, scope, source DB),
`EmissionFactorGasLine`, `AssignationRule` (real FKs to `Product`/`Partner`/`Account`, application
period, `replaceExisting`), `EmittedEmission` (real FKs; `sourceType = accounting | fleet_commuting |
manual`; `sourceRefId` → invoice line / expense / travel / vehicle).

### Backend — the engine, built as three testable services

**a. `FactorService` — factor value derivation.**
`factorValue = Σ(gasLine.value × gas.gwp)`. Gas lines are the source of truth; the derived value is
cached on the factor row and recomputed on any gas-line or GWP write (preserves the audit trail and
allows AR5→AR6 re-runs). Full CRUD UI for factors incl. gas-line editor.

**b. `AssignationResolver` — which factor applies to a record.**
Pure, deterministic function over (product, partner, account, date) → best `AssignationRule`:
1. all attributes set on a rule must match;
2. specificity priority **product > partner > account**;
3. tie-break: more matched attributes wins;
4. final tie-break: newest rule (documented, deterministic);
5. respect application period and `replaceExisting`.
Implemented standalone with an exhaustive table-driven test suite — this resolver is the #1
correctness risk in the project.

**c. `EmissionCalculationService` — the three capture paths writing one ledger.**
- **Path A — accounting (auto).** Subscribes to the Phase 1 posting events. If
  `EsgConfig.auto_emission_calculation` is on: for each posted invoice line / expense, resolve the
  rule; branch on `computeMethod` — *physical* uses line quantity (hard-fail with a surfaced
  warning if line UoM ≠ factor UoM; never multiply mismatched units), *monetary* uses line amount.
  Write `EmittedEmission { co2eValue = quantity × factorValue, sourceType: "accounting",
  sourceRefId, departmentId (from the employee/record), date, scope via factor }`. Also provide a
  **backfill endpoint** ("recompute period") for records posted while the toggle was off or when
  factors/rules change — with `replaceExisting` semantics.
- **Path B — fleet commuting (batch).** "Add Emissions" action for a chosen period (default
  **monthly** — see §11 open questions): for every employee with `homeWorkDistance` and an active
  `FleetVehicle`, `co2e = officeDaysPerWeek × (homeWorkDistance × 2) × weeksInPeriod ×
  model.co2Emissions`, writing rows with `employeeId`, `periodStart/End`, scope =
  `scope_3_7_employee_commuting`. Idempotent per (employee, period) — re-running replaces, never
  duplicates.
- **Path C — manual entry.** Form: required `name`, factor picker (searchable, grouped by scope),
  quantity in the factor's UoM, date, department, optional link to a `BusinessTravel` record.
  System computes `co2eValue`. This is the catch-all for flights, refrigerant leaks, and anything
  without an operational record.

**d. Footprint query API.** `GROUP BY scope (any tree level), department, period` over the ledger —
powers the Phase 3 dashboard and Phase 5 Environmental Report.

### Frontend
- **Configuration:** Emission Factors (list + detail with gas-line editor showing live derived
  CO₂e value), Scopes tree viewer, Gases table, Source Databases, Assignation Rules (list + "test a
  record" simulator that shows which rule wins and why — invaluable for debugging and demos).
- **Emissions:** ledger table (filter by scope/department/source/period), manual-entry form,
  fleet-commuting batch runner with preview-before-commit, per-record drill-down showing the math
  (factor, quantity, gas lines).

### Per-dev split
- **Nirat:** FactorService + factor/gas/scope/source CRUD + config UI.
- **Aman:** AssignationResolver + rules UI + simulator; Path B commuting batch.
- **Avani:** Path A event listener + backfill, Path C manual entry, ledger UI + footprint query API.

### Testing gate — the strictest of the project
- Unit (every worked example from the scope doc as a fixture):
  - natural-gas factor derives to **≈ 0.18326 kgCO₂e/kWh** from its three gas lines;
  - 10,000 kWh × 0.1833 → 1,833 kgCO₂e; 500 L diesel × 2.69 → 1,345; €5,000 × 0.45 → 2,250;
  - A4-paper rule resolution: product rule beats account rule → 180 kgCO₂e; falls back to
    monetary 320 kgCO₂e when the product rule is removed;
  - commuting: 15 km one-way, 4 days/wk, 0.12 kgCO₂e/km, 4 weeks → **57.6 kgCO₂e**;
  - refrigerant: 2 kg × GWP 1300 → 2,600 kgCO₂e;
  - resolver table tests: ~20 combinations of rule sets × records incl. period edges and ties;
  - UoM mismatch → rejected with warning, no ledger row.
- Integration: post the Phase 1 demo invoice with toggle **on** → ledger row 2,796 kgCO₂e scope_2
  appears; toggle **off** → nothing; backfill then creates it. Commuting batch idempotency.
- Demo: configure the grid-electricity factor + rule → post invoice → emission appears
  automatically with drill-down math → run commuting batch → add a manual flight → footprint report
  shows all three source types grouped by scope and department.

---

## 7. Phase 3 — Pillar features (three parallel tracks)

**Goal:** the user-facing substance of each pillar. Tracks are independent by design — each dev
runs their own track end-to-end. Notification triggers (a Section-8 mandatory) are wired here
against the Phase 0 infrastructure, including turning on the real email adapter.

### Track A (Nirat) — Environmental features
- **Models:** `EnvironmentalGoal`, `Initiative`.
- Goals: target metric + unit + period per department; progress computed against the ledger
  (e.g. "reduce Scope 2 kgCO₂e 10% vs prior period").
- Initiatives: reduction actions with `estimatedCo2Reduction` / `actualCo2Reduction` / `progress` /
  assignee / deadline; explicitly **do not** touch the footprint until realized.
- **Environmental dashboard:** footprint by scope (donut/tree), by department, trend vs prior
  period, goals progress bars, initiatives kanban-ish list.

### Track B (Aman) — Social + Gamification
- **Models:** `CsrActivity`, `EmployeeParticipation`, `Challenge`, `ChallengeParticipation`,
  `Badge`, `EmployeeBadge`, `Reward`, `RewardRedemption`.
- CSR: activity CRUD + lifecycle; employee joins; proof upload; manager approval —
  **approval is blocked without a proof file when `evidence_required_for_approval` is on**;
  approval awards points atomically.
- Challenges: lifecycle `draft → active → under_review → completed / archived`; participation with
  progress + proof; approval awards XP.
- **Badge engine:** `unlockRule` JSON predicate (XP threshold, completed-challenge count, CSR
  count) evaluated on every XP/points-changing event; **auto-award when `badge_auto_award` is on**,
  else queue for manual award; fires `badge_unlock` notification.
- Rewards: catalog with `pointsRequired` + `stock`; redemption **transactionally** deducts points
  and decrements stock, rejecting insufficient points/stock (row-level locking or optimistic
  retry — this is the one place concurrency genuinely bites).
- UI: CSR board, challenge cards + my-progress, approvals queue (manager), badge gallery, rewards
  store + redemption history, XP/points header widget.

### Track C (Avani) — Governance + notification triggers
- **Models:** `EsgPolicy` (file as upload reference via the Phase 0 file service — fixing the
  design doc's invalid `file : pdf`), `PolicyAcknowledgement`, `Audit`, `ComplianceIssue`.
- Policies: versioned CRUD with PDF attachment; publishing fans out pending acknowledgements to all
  active employees; employee "read & acknowledge" flow; reminder scheduling.
- Audits: `planned → in_progress → completed` with summary; findings logged as compliance issues
  from within the audit view.
- Compliance issues: required **owner + due date**; `open → in_progress → resolved/closed`;
  a scheduled job (`@nestjs/schedule` cron) flags **open-past-due** issues and notifies owner +
  managers.
- **Notification triggers wired (all four mandatory types):** new compliance issue →
  owner; CSR/challenge approval decision → participant; policy acknowledgement reminder → laggards;
  badge unlock → employee. Email adapter goes live (provider-agnostic; e.g. SMTP/Resend) with
  per-type channel defaults in `EsgConfig`.

### Testing gate
- Unit per track: evidence-toggle blocks approval; badge predicate evaluation matrix; redemption
  race (parallel redemptions of last stock item → exactly one succeeds); overdue-flag job picks
  precisely open-past-due; policy fan-out targets active employees only.
- Integration: each track's happy path + its notification appearing in the bell and (mock) email
  outbox.
- Demo: one sitting, three storylines — employee completes a challenge and unlocks a badge and
  redeems a reward; manager approves CSR with evidence; auditor completes an audit whose finding
  goes overdue and pings its owner.

---

## 8. Phase 4 — Scoring engine

**Goal:** turn all accumulated data into per-department E/S/G scores and the configurable Overall
ESG Score. Formulas follow scope-doc §6–7 exactly; every weight/constant lives in `EsgConfig`.

### Prisma models added
`DiversityMetric`, `TrainingCompletion`, `DepartmentScore` (`@@unique([departmentId, periodStart,
periodEnd])`, plus a `componentInputs Json` column so every score is **explainable** — scope doc §8
fix #7).

### Backend
- Small data modules first: diversity metrics entry, training completions (Aman).
- **Pay-gap computation** over `PayrollContract`: group by `jobPosition`, mean wage by gender,
  `payGap% = (maleMean − femaleMean)/maleMean × 100`, mapped to a 0–100 score (Aman).
- `ScoringService` with one pure calculator per pillar (all 0–100, all divide-by-zero-safe with the
  documented default: departments with no activity in a period are marked **N/A and excluded** from
  the org roll-up):
  - **E** (Nirat): goal attainment (inverted for reduction goals) + emissions trend vs prior period
    + initiative delivery, weights `0.5/0.3/0.2` from config.
  - **S** (Aman): CSR participation rate + challenge engagement (normalized vs top department) +
    diversity/pay-equity + training completion rate.
  - **G** (Avani): policy ack rate + audit score (on-time completion minus unresolved-finding
    penalty) + compliance health (severity-weighted open/overdue burden, weights low=1 medium=3
    high=7 critical=15, constants `k1`,`k2` in config).
  - **Roll-up** (Avani): `departmentTotal = 0.40·E + 0.30·S + 0.30·G` (config), overall ESG =
    headcount-weighted average across departments (mode configurable: headcount vs equal).
- Trigger: on-demand "compute period" endpoint + scheduled monthly close; results upserted into
  `DepartmentScore` with `componentInputs` captured.

### Frontend
- **Organization dashboard:** Overall ESG gauge, E/S/G breakdown, per-department score table with
  drill-down into component inputs ("why is this 70.5?"), period selector, weight display.
- Diversity metrics + training entry screens.

### Testing gate
- Unit: the scope doc's governance worked example reproduces **70.5** exactly; pay-gap math;
  N/A handling; weight-change reactivity (change config → recompute → new numbers).
- Integration: full compute over seeded fixture org → persisted `DepartmentScore` rows match
  hand-calculated expectations; recompute idempotency (upsert, not duplicate).
- Demo: run a period close live; open a department; explain its score from stored component inputs.

---

## 9. Phase 5 — Reports & exports

**Goal:** the five report deliverables (Section-8 mandatory): Environmental, Social, Governance,
ESG Summary, and the Custom Report Builder — each filterable by **Department, Date Range, Module,
Employee, Challenge, ESG Category** and exportable to **PDF / Excel / CSV**.

### Backend
- `reports` module with one composer per report type over the existing query services (footprint
  API, participation queries, governance aggregates, DepartmentScore). No new domain logic — reports
  *read*; if a number is wrong here, the bug is upstream.
- Shared `ReportFilter` DTO implementing the six mandated filter dimensions once, reused by all
  report endpoints.
- **Export service:** CSV (native), Excel (`exceljs`), PDF (server-rendered via `puppeteer`
  print-to-PDF of a print-styled report page — one layout maintained for both screen and PDF;
  decision recorded in §11). Exports run async for large ranges with a notification on completion.
- Custom Report Builder API: user picks module(s) → available fields/metrics → filters → grouping →
  saved report definitions (`ReportDefinition` model) → execute + export.
- Surface `EmissionFactor.uncertainty` in the Environmental report per the methodology.

### Frontend
- Reports hub: the four standard reports as tabbed pages sharing a `ReportFilterBar`; export
  buttons; saved-reports list; builder wizard (module → fields → filters → preview → save/export).

### Per-dev split
Nirat: Environmental report + export service. Aman: Social report + builder UI. Avani: Governance
+ ESG Summary reports + builder API + saved definitions.

### Testing gate
- Unit: filter combinations produce correct WHERE composition; CSV/Excel cell-level snapshots on a
  fixed fixture; builder definition round-trip.
- Integration: each report over the seeded org matches dashboard numbers exactly (single source of
  truth check); PDF export produces a non-empty, text-searchable file.
- Demo: filter the ESG Summary to one department + quarter; export all three formats; build and
  save a custom report ("challenge participation by department, Q2").

---

## 10. Phase 6 — Hardening & stretch goals

**Goal:** production readiness, then (and only then) the explicitly-optional Section-9 items.

### Hardening (required)
- **E2E suite** (Playwright on client + vitest e2e on server) over the golden path: login → master
  data → invoice → auto emission → challenge/CSR → governance flow → period close → scores →
  reports → exports. Runs in CI against dockerized Postgres.
- Performance pass: indexes on `EmittedEmission(date, departmentId, emissionFactorId)` and other
  hot filters; ledger pagination; report query plans; load test the footprint group-by with ~1M
  ledger rows.
- Security pass: RBAC audit of every endpoint, file-upload validation (type/size), rate limiting on
  auth, dependency audit.
- Ops: prod docker-compose review, backup/restore runbook, seed-to-demo script for stakeholder
  environments.

### Stretch (optional, in priority order — pull only after hardening is green)
1. **Department ESG rankings** (cheap: DepartmentScore already exists — leaderboard UI + movement
   vs prior period).
2. **Smart dashboard visualizations** (richer charts: scope waterfall, YoY trend, initiative impact
   projection).
3. **Mobile-responsive interface** (audit + fix the app shell and the employee-facing flows first:
   challenges, CSR, rewards, acknowledgements — the screens employees actually open on phones).

### Exit criteria
E2E green in CI, load test within agreed budgets, security checklist signed off. Stretch items each
ship behind their own demo.

---

## 11. Open questions & recommended defaults

Decisions the team should confirm with stakeholders; the plan proceeds on the recommended default
so nothing blocks.

| # | Question | Recommended default (build this) |
|---|---|---|
| 1 | Scoring formula weights & normalization (scope doc §6–7 are proposals) | Implement as documented, all weights in `EsgConfig`; revisit after first real period close |
| 2 | Overall ESG roll-up across departments | Headcount-weighted, with equal-weight as a config option |
| 3 | Fleet commuting period granularity | **Monthly**, aligned to calendar months |
| 4 | GWP assessment report for `Gas.gwp` seeds | **AR5**, recorded in seed metadata; engine supports recompute if switched to AR6 |
| 5 | Scope 2 dual reporting (market- vs location-based) | Location-based only for v1; model market-based as a second factor variant later (scope tree already allows `scope_2_market_based`) |
| 6 | Source of operational records | EcoSphere's own Phase 1 models (no ERP sync in v1); posting event bus is the future integration seam if an ERP connector is ever needed |
| 7 | PDF export mechanism | Server-side print-to-PDF of the report page (one layout to maintain) |

## 12. Risk register

| Risk | Phase | Mitigation |
|---|---|---|
| AssignationResolver correctness (silently wrong emissions) | 2 | Pure function, table-driven tests, UI "test a record" simulator, drill-down math on every ledger row |
| Unit-of-measure mismatches producing garbage numbers | 2 | Controlled UoM vocabulary from Phase 1; hard-fail + surfaced warning on mismatch, never silent multiply |
| Scoring formulas contested after build | 4 | Everything weighted via `EsgConfig`; `componentInputs` stored so any score is explainable and recomputable |
| Reward redemption race conditions | 3 | Transactional deduction with locking; explicit concurrency test |
| Factor/GWP updates invalidating history | 2 | Gas lines authoritative, cached factor value, backfill/recompute endpoint with `replaceExisting` semantics |
| Report numbers diverging from dashboards | 5 | Reports reuse the same query services as dashboards; integration test asserts equality |
| Export library weight/flakiness (PDF) | 5 | Print-to-PDF approach isolated behind an export service interface; CSV/Excel unaffected |

## 13. Requirements traceability (Section-8 mandatory items → phase)

| Mandatory requirement | Phase |
|---|---|
| Configurable emission factors (gas lines, source DBs, assignation rules) | 2 |
| Auto emission calculation toggle over Purchase/Manufacturing/Expense/Fleet | 2 (inputs from 1) |
| Models for adding records: invoices, accounts, expenses, employee travel, fleet, manual entries | **1** (+ 2 Path C for manual) |
| Reward redemption (points balance, stock) | 3 (Track B) |
| Notification system (4 types, in-app/email) | 0 (infra) + 3 (triggers) |
| Evidence-requirement toggle blocking CSR approval | 3 (Track B) |
| Badge auto-award toggle on unlock rules | 3 (Track B) |
| Compliance issue owner + due date + overdue flagging | 3 (Track C) |
| E/S/G + Summary reports, 6 filters, PDF/Excel/CSV export | 5 |
| Custom Report Builder | 5 |
| Department scores + configurable Overall ESG Score | 4 |
| *(Optional §9)* rankings, smart dashboards, mobile responsive | 6 (stretch) |
