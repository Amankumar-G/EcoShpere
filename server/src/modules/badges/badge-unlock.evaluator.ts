/**
 * Pure predicate evaluation for a badge's `unlockRule` JSON. Kept side-effect
 * free so the whole matrix of rule types is trivially unit-testable.
 */

export const BADGE_RULE_TYPES = [
  'xp',
  'points',
  'challenges_completed',
  'csr_completed',
] as const;

export type BadgeRuleType = (typeof BADGE_RULE_TYPES)[number];

export interface BadgeMetrics {
  xp: number;
  points: number;
  challengesCompleted: number;
  csrCompleted: number;
}

export function isUnlockRuleSatisfied(
  rule: unknown,
  metrics: BadgeMetrics,
): boolean {
  if (!rule || typeof rule !== 'object') {
    return false;
  }
  const { type, threshold } = rule as { type?: unknown; threshold?: unknown };
  if (typeof threshold !== 'number') {
    return false;
  }
  switch (type) {
    case 'xp':
      return metrics.xp >= threshold;
    case 'points':
      return metrics.points >= threshold;
    case 'challenges_completed':
      return metrics.challengesCompleted >= threshold;
    case 'csr_completed':
      return metrics.csrCompleted >= threshold;
    default:
      return false;
  }
}
