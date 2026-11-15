import { firstValueFrom } from "rxjs";
import { decodeTime } from "ulid";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getVaultDb, removeVaultDb } from "@/db/vault.db";
import { CryptoErrorKind } from "@/enums/crypto.enum";
import { EntryKind } from "@/enums/vault.enum";
import type { EntryInput } from "@/schemas/vault.schema";
import { generateRecoveryKey, importRecoveryKey } from "@/services/crypto.service";
import { clearUnlockedKey, setUnlockedKey } from "@/services/secure-memory.service";
import { addEntry, editEntry, removeEntry, watchEntries } from "@/services/vault.service";
import { fakeSecret } from "@/test/fake-secret";
import { freshIndexedDbPerTest } from "@/test/indexed-db";
import type { VaultDocument } from "@/types/vault.types";

freshIndexedDbPerTest();

const SECRET = fakeSecret();

const NOTE: EntryInput = { kind: EntryKind.Note, title: "Wifi codes", body: "router: hunter2-ish" };
const LOGIN: EntryInput = {
  kind: EntryKind.Password,
  title: "Bank",
  username: "jane",
  password: SECRET,
  url: "https://bank.example",
  notes: "pin is in the drawer",
};

const unlock = async () => {
  setUnlockedKey(await importRecoveryKey(generateRecoveryKey()));
};
const list = () => firstValueFrom(watchEntries());
const rawDocuments = async (): Promise<VaultDocument[]> =>
  (await (await getVaultDb()).entries.find().exec()).map((d) => d.toMutableJSON());

beforeEach(unlock);
afterEach(clearUnlockedKey);

describe("adding entries", () => {
  it("stores only an id, a timestamp and an encrypted blob, nothing readable", async () => {
    await addEntry(NOTE);
    await addEntry(LOGIN);

    const documents = await rawDocuments();
    expect(documents).toHaveLength(2);
    for (const document of documents) {
      expect(Object.keys(document).sort()).toEqual(["envelope", "id", "updatedAt"]);
      expect(document.id).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
    }
    const stored = JSON.stringify(documents);
    for (const secret of [
      "Wifi codes",
      "hunter2",
      "Bank",
      "jane",
      SECRET,
      "bank.example",
      "drawer",
    ]) {
      expect(stored).not.toContain(secret);
    }
    expect(stored).not.toMatch(/"kind"|note|password/);
  });

  it("returns the decrypted entry with the creation time taken from its ULID", async () => {
    const entry = await addEntry(LOGIN);
    expect(entry).toMatchObject({ ...LOGIN, kind: EntryKind.Password });
    expect(entry.createdAt).toBe(decodeTime(entry.id));
    expect(entry.updatedAt).toBeGreaterThanOrEqual(entry.createdAt);
  });

  it("lists entries decrypted, newest change first", async () => {
    const first = await addEntry(NOTE);
    const second = await addEntry(LOGIN);
    const { entries, unreadable } = await list();
    expect(unreadable).toBe(0);
    expect(entries.map((entry) => entry.id)).toEqual([second.id, first.id]);
    expect(entries[1]).toMatchObject(NOTE);
  });

  it("uses a different IV for every entry", async () => {
    await addEntry(NOTE);
    await addEntry(NOTE);
    const [a, b] = await rawDocuments();
    expect(a?.envelope.iv).not.toBe(b?.envelope.iv);
    expect(a?.envelope.ciphertext).not.toBe(b?.envelope.ciphertext);
  });

  it("keeps the entries across closing and reopening the database", async () => {
    await addEntry(NOTE);
    const { closeVaultDb } = await import("@/db/vault.db");
    await closeVaultDb();
    expect((await list()).entries).toHaveLength(1);
  });

  it("rejects an entry without a title or a password", async () => {
    await expect(addEntry({ ...NOTE, title: "   " })).rejects.toThrow();
    await expect(addEntry({ ...LOGIN, password: "" })).rejects.toThrow();
    expect(await rawDocuments()).toHaveLength(0);
  });

  it("keeps spaces in a password and trims the title", async () => {
    const entry = await addEntry({ ...LOGIN, title: "  Bank  ", password: " pass word " });
    expect(entry).toMatchObject({ title: "Bank", password: " pass word " });
  });

  it("refuses an entry too large to sync, before saving anything", async () => {
    const huge = { ...NOTE, body: "漢".repeat(25_000) };
    await expect(addEntry(huge)).rejects.toMatchObject({
      message: expect.stringContaining("too large") as unknown,
    });
    const small = await addEntry(NOTE);
    await expect(editEntry(small.id, huge)).rejects.toMatchObject({
      message: expect.stringContaining("too large") as unknown,
    });
    expect(await rawDocuments()).toHaveLength(1);
  });

  it("counts bytes, not characters, against the limit", async () => {
    await expect(addEntry({ ...NOTE, body: "漢".repeat(25_000) })).rejects.toThrow();
    await expect(addEntry({ ...NOTE, body: "漢".repeat(15_000) })).resolves.toBeDefined();
  });

  it("can't add anything while locked", async () => {
    clearUnlockedKey();
    await expect(addEntry(NOTE)).rejects.toMatchObject({ kind: CryptoErrorKind.Locked });
  });
});

describe("editing and deleting", () => {
  it("re-encrypts with a fresh IV and keeps the id and creation time", async () => {
    const original = await addEntry(NOTE);
    const [before] = await rawDocuments();
    const edited = await editEntry(original.id, { ...NOTE, body: "changed" });

    expect(edited).toMatchObject({
      id: original.id,
      createdAt: original.createdAt,
      body: "changed",
    });
    expect(edited.updatedAt).toBeGreaterThan(original.updatedAt);
    const [after] = await rawDocuments();
    expect(after?.envelope.iv).not.toBe(before?.envelope.iv);
    expect(JSON.stringify(after)).not.toContain("changed");
    expect((await list()).entries[0]).toMatchObject({ body: "changed" });
  });

  it("refuses to edit an entry that does not exist", async () => {
    await expect(editEntry("01JNOPE0000000000000000000", NOTE)).rejects.toMatchObject({
      message: "That item no longer exists.",
    });
  });

  it("deletes, and deleting again is harmless", async () => {
    const entry = await addEntry(NOTE);
    await removeEntry(entry.id);
    await removeEntry(entry.id);
    expect((await list()).entries).toHaveLength(0);
  });
});

describe("tampering", () => {
  it("hides, and counts, an entry whose blob was moved onto another record", async () => {
    const a = await addEntry(NOTE);
    const b = await addEntry(LOGIN);
    const documents = await rawDocuments();
    const blobOfA = documents.find((d) => d.id === a.id)?.envelope;
    if (!blobOfA) throw new Error("expected a stored blob");
    const target = await (await getVaultDb()).entries.findOne(b.id).exec();
    await target?.patch({ envelope: blobOfA });

    const { entries, unreadable } = await list();
    expect(unreadable).toBe(1);
    expect(entries.map((entry) => entry.id)).toEqual([a.id]);
  });

  it("hides every entry when opened with a different key", async () => {
    await addEntry(NOTE);
    await addEntry(LOGIN);
    await unlock();
    const { entries, unreadable } = await list();
    expect(entries).toHaveLength(0);
    expect(unreadable).toBe(2);
  });

  it("hides an entry whose ciphertext was altered", async () => {
    const entry = await addEntry(NOTE);
    const target = await (await getVaultDb()).entries.findOne(entry.id).exec();
    const envelope = (await rawDocuments()).find((d) => d.id === entry.id)?.envelope;
    if (!envelope) throw new Error("expected a stored blob");
    const flipped = envelope.ciphertext.replace(/^./, (c) => (c === "A" ? "B" : "A"));
    await target?.patch({ envelope: { ...envelope, ciphertext: flipped } });
    expect((await list()).unreadable).toBe(1);
  });
});

describe("wiping", () => {
  it("removes every entry from the device", async () => {
    await addEntry(NOTE);
    await removeVaultDb();
    expect((await list()).entries).toHaveLength(0);
  });
});
