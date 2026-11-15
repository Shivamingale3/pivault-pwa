import type { WithDeleted } from "rxdb/plugins/core";
import { describe, expect, it } from "vitest";
import { lastWriteWins } from "@/db/vault.conflict";
import type { VaultDocument } from "@/types/vault.types";

type Doc = WithDeleted<VaultDocument>;
const doc = (updatedAt: number, ciphertext: string, _deleted = false): Doc => ({
  id: "01JABC00000000000000000000",
  updatedAt,
  _deleted,
  envelope: { version: 1, algorithm: "AES-GCM-256", iv: "AAAAAAAAAAAAAAAA", ciphertext },
});

const resolve = (local: Doc, master: Doc) =>
  lastWriteWins.resolve(
    { newDocumentState: local, realMasterState: master, assumedMasterState: master },
    "test",
  );

describe("lastWriteWins", () => {
  it("treats the same content as equal, and any difference as a conflict", () => {
    expect(lastWriteWins.isEqual(doc(1, "AAAA"), doc(1, "AAAA"), "t")).toBe(true);
    expect(lastWriteWins.isEqual(doc(1, "AAAA"), doc(2, "AAAA"), "t")).toBe(false);
    expect(lastWriteWins.isEqual(doc(1, "AAAA"), doc(1, "BBBB"), "t")).toBe(false);
    expect(lastWriteWins.isEqual(doc(1, "AAAA"), doc(1, "AAAA", true), "t")).toBe(false);
  });

  it("keeps the later change", async () => {
    const [older, newer] = [doc(1, "OLD1"), doc(2, "NEW2")];
    expect(await resolve(newer, older)).toBe(newer);
    expect(await resolve(older, newer)).toBe(newer);
  });

  it("lets a later delete beat an earlier edit, and a later edit beat an earlier delete", async () => {
    const edit = doc(1, "EDIT");
    const del = doc(2, "EDIT", true);
    expect(await resolve(edit, del)).toBe(del);
    expect(await resolve(doc(3, "BACK"), del)).toMatchObject({ _deleted: false });
  });

  it("gives a tie to the server's version, so every device ends the same", async () => {
    const [local, master] = [doc(5, "LOCL"), doc(5, "MAST")];
    expect(await resolve(local, master)).toBe(master);
  });
});
