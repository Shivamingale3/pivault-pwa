/**
 * Recent searches, kept in memory only: what someone searched for can reveal what is in the vault,
 * so it is never written to the device and is dropped when the app locks.
 */
const MAX_TERMS = 6;
let terms: string[] = [];

export const recentSearches = (): readonly string[] => terms;

/** Remembers a term (newest first, no repeats). Ignores blanks. */
export function rememberSearch(term: string): readonly string[] {
  const clean = term.trim();
  if (clean === "") return terms;
  terms = [
    clean,
    ...terms.filter((existing) => existing.toLowerCase() !== clean.toLowerCase()),
  ].slice(0, MAX_TERMS);
  return terms;
}

export function clearSearchHistory(): void {
  terms = [];
}
