import { describe, expect, it } from 'vitest';
import { BadgeMetrics, isUnlockRuleSatisfied } from './badge-unlock.evaluator';

const metrics: BadgeMetrics = {
  xp: 120,
  points: 40,
  challengesCompleted: 3,
  csrCompleted: 1,
};

describe('isUnlockRuleSatisfied', () => {
  it('grants an xp rule at or above the threshold', () => {
    expect(isUnlockRuleSatisfied({ type: 'xp', threshold: 100 }, metrics)).toBe(
      true,
    );
    expect(isUnlockRuleSatisfied({ type: 'xp', threshold: 120 }, metrics)).toBe(
      true,
    );
  });

  it('withholds an xp rule below the threshold', () => {
    expect(isUnlockRuleSatisfied({ type: 'xp', threshold: 200 }, metrics)).toBe(
      false,
    );
  });

  it('evaluates points, challenges and csr counts', () => {
    expect(
      isUnlockRuleSatisfied({ type: 'points', threshold: 40 }, metrics),
    ).toBe(true);
    expect(
      isUnlockRuleSatisfied(
        { type: 'challenges_completed', threshold: 3 },
        metrics,
      ),
    ).toBe(true);
    expect(
      isUnlockRuleSatisfied({ type: 'csr_completed', threshold: 2 }, metrics),
    ).toBe(false);
  });

  it('returns false for malformed or unknown rules', () => {
    expect(isUnlockRuleSatisfied(null, metrics)).toBe(false);
    expect(isUnlockRuleSatisfied({ type: 'xp' }, metrics)).toBe(false);
    expect(
      isUnlockRuleSatisfied({ type: 'mystery', threshold: 1 }, metrics),
    ).toBe(false);
  });
});
