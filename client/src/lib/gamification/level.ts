const XP_PER_LEVEL = 100;

export interface LevelProgress {
  level: number;
  xp: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
}

/**
 * Level formula: level = floor(xp / 100) + 1. Placeholder until Phase 1
 * gamification defines the real progression curve — /auth/me does not yet
 * expose xp, so callers should pass `undefined` and get a safe Level 1 / 0 XP
 * default rather than a silently hardcoded number.
 */
export const deriveLevelProgress = (xp: number | undefined): LevelProgress => {
  const safeXp = xp ?? 0;
  return {
    level: Math.floor(safeXp / XP_PER_LEVEL) + 1,
    xp: safeXp,
    xpIntoLevel: safeXp % XP_PER_LEVEL,
    xpForNextLevel: XP_PER_LEVEL,
  };
};
