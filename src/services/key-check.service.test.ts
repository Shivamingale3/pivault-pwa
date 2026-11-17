import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as auth from "@/services/auth.service";
import { generateRecoveryKey, importRecoveryKey } from "@/services/crypto.service";
import { ensureKeyCheckStored, makeKeyCheck, opensKeyCheck } from "@/services/key-check.service";
import { clearUnlockedKey, setUnlockedKey } from "@/services/secure-memory.service";
import { loadSession, saveSession } from "@/services/session.service";
import * as signed from "@/services/signed-api.client";
import { freshIndexedDbPerTest } from "@/test/indexed-db";
import { TEST_SESSION } from "@/test/vault-screens";

freshIndexedDbPerTest();
afterEach(() => {
  clearUnlockedKey();
  vi.restoreAllMocks();
});

describe("the recovery-key check", () => {
  it("opens only with the key that made it, and is different every time", async () => {
    const key = await importRecoveryKey(generateRecoveryKey());
    const check = await makeKeyCheck(key);
    expect(await opensKeyCheck(key, check)).toBe(true);
    expect(await opensKeyCheck(await importRecoveryKey(generateRecoveryKey()), check)).toBe(false);
    expect((await makeKeyCheck(key)).iv).not.toBe(check.iv);
  });

  it("does not open when it has been tampered with", async () => {
    const key = await importRecoveryKey(generateRecoveryKey());
    const check = await makeKeyCheck(key);
    const flipped = check.ciphertext.startsWith("A") ? "B" : "A";
    expect(
      await opensKeyCheck(key, { ...check, ciphertext: flipped + check.ciphertext.slice(1) }),
    ).toBe(false);
  });
});

describe("ensureKeyCheckStored", () => {
  let key: CryptoKey;
  const serverReturns = (keyCheck: unknown) =>
    vi.spyOn(signed, "postSigned").mockResolvedValue({ keyCheck });

  beforeEach(async () => {
    key = await importRecoveryKey(generateRecoveryKey());
    setUnlockedKey(key);
    await saveSession(TEST_SESSION);
  });

  it("stores a check for an older account that has none, once", async () => {
    serverReturns(null);
    const mark = vi.spyOn(auth, "markRecoveryKeyConfigured").mockResolvedValue();
    await ensureKeyCheckStored();
    const [check] = mark.mock.calls[0] ?? [];
    if (!check) throw new Error("expected a key check");
    expect(await opensKeyCheck(key, check)).toBe(true);
    expect((await loadSession())?.keyCheckStored).toBe(true);

    await ensureKeyCheckStored();
    expect(mark).toHaveBeenCalledOnce();
  });

  it("leaves an existing check alone", async () => {
    serverReturns(await makeKeyCheck(key));
    const mark = vi.spyOn(auth, "markRecoveryKeyConfigured").mockResolvedValue();
    await ensureKeyCheckStored();
    expect(mark).not.toHaveBeenCalled();
    expect((await loadSession())?.keyCheckStored).toBe(true);
  });

  it("tries again next time when the server can't be reached", async () => {
    vi.spyOn(signed, "postSigned").mockRejectedValue(new Error("offline"));
    await expect(ensureKeyCheckStored()).rejects.toThrow("offline");
    expect((await loadSession())?.keyCheckStored).toBeUndefined();
  });
});
