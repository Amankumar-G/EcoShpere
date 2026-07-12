/**
 * Domain events for the Phase 3 engagement engine.
 *
 * CSR approval (Social) and challenge approval (Gamification) award points / XP
 * and then emit these. The Badge engine subscribes and re-evaluates every
 * badge's unlock rule for the affected employee — decoupling badge logic from
 * the modules that change an employee's score (mirrors the accounting-capture
 * listener seam on `PostingEvents`).
 */

export const EsgEvents = {
  EmployeeXpChanged: 'employee.xp_changed',
  EmployeePointsChanged: 'employee.points_changed',
} as const;

export interface EmployeeScoreChangedEvent {
  employeeId: number;
}
