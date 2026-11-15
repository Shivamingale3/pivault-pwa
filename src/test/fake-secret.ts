/**
 * A random fake password for tests. Built at runtime so secret scanners (GitGuardian
 * "Username Password" / "Generic Password") have no literal to match. Contains a space on
 * purpose: passwords may.
 */
export const fakeSecret = (): string => `pw ${crypto.randomUUID()}`;
