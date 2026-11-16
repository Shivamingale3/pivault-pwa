export type Strength = 0 | 1 | 2 | 3 | 4;

/** A password this weak or weaker shows up under "Weak". */
export const WEAK_AT_MOST: Strength = 1;

const classes = (password: string): number =>
  [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((pattern) => pattern.test(password)).length;

/**
 * A rough 0 to 4 score from length and variety. It's a nudge, not a guarantee: one repeated
 * character, or something short, scores 0; long and mixed scores 4.
 */
export function passwordStrength(password: string): Strength {
  if (password.length === 0 || new Set(password).size <= 2) return 0;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (classes(password) >= 3) score += 1;
  if (password.length < 8) score = Math.min(score, 1);
  return Math.min(4, score) as Strength;
}

export const isWeak = (password: string): boolean => passwordStrength(password) <= WEAK_AT_MOST;
