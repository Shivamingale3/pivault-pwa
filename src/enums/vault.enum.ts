/** What an entry is. Only known inside the encrypted payload, never in plain database fields. */
export const EntryKind = {
  Note: "note",
  Password: "password",
} as const;

export type EntryKind = (typeof EntryKind)[keyof typeof EntryKind];
