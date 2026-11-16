export interface GeneratorOptions {
  length: number;
  uppercase: boolean;
  numbers: boolean;
  symbols: boolean;
  /** Allow characters that look alike (l 1 I O 0). Off by default. */
  lookAlikes: boolean;
}

export const GENERATOR_LENGTH = { min: 8, max: 40 } as const;

export const DEFAULT_GENERATOR: GeneratorOptions = {
  length: 16,
  uppercase: true,
  numbers: true,
  symbols: true,
  lookAlikes: false,
};

const SETS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*-_=+?",
} as const;

/** An unbiased random index below `limit`, from the browser's secure generator (never Math.random). */
function randomBelow(limit: number): number {
  const ceiling = Math.floor(0x1_0000_0000 / limit) * limit;
  const buffer = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(buffer);
    const value = buffer[0] ?? 0;
    if (value < ceiling) return value % limit;
  }
}

const pick = (alphabet: string): string => alphabet.charAt(randomBelow(alphabet.length));

/** A random password with at least one character from every chosen group. */
export function generatePassword(options: GeneratorOptions): string {
  const length = Math.min(
    GENERATOR_LENGTH.max,
    Math.max(GENERATOR_LENGTH.min, Math.round(options.length)),
  );
  const groups = [
    SETS.lowercase,
    ...(options.uppercase ? [SETS.uppercase] : []),
    ...(options.numbers ? [SETS.numbers] : []),
    ...(options.symbols ? [SETS.symbols] : []),
  ].map((set) => (options.lookAlikes ? set : set.replace(/[l1IO0]/g, "")));

  const all = groups.join("");
  const chars = [
    ...groups.map(pick),
    ...Array.from({ length: length - groups.length }, () => pick(all)),
  ];
  // Fisher-Yates, so the guaranteed characters don't always come first.
  for (let index = chars.length - 1; index > 0; index -= 1) {
    const other = randomBelow(index + 1);
    [chars[index], chars[other]] = [chars[other] ?? "", chars[index] ?? ""];
  }
  return chars.join("");
}
