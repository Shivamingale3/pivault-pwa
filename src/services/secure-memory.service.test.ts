import { afterEach, describe, expect, it } from "vitest";
import { CryptoErrorKind } from "@/enums/crypto.enum";
import { generateRecoveryKey, importRecoveryKey } from "@/services/crypto.service";
import {
  clearUnlockedKey,
  getUnlockedKey,
  isUnlocked,
  setUnlockedKey,
} from "@/services/secure-memory.service";

afterEach(clearUnlockedKey);

describe("secure memory", () => {
  it("is locked until a key is set, and locks again when cleared", async () => {
    expect(isUnlocked()).toBe(false);
    expect(() => getUnlockedKey()).toThrow(
      expect.objectContaining({ kind: CryptoErrorKind.Locked }),
    );
    const key = await importRecoveryKey(generateRecoveryKey());
    setUnlockedKey(key);
    expect(isUnlocked()).toBe(true);
    expect(getUnlockedKey()).toBe(key);
    clearUnlockedKey();
    expect(isUnlocked()).toBe(false);
  });
});
