import { describe, expect, it } from "vitest";
import { z } from "zod";
import { CryptoErrorKind } from "@/enums/crypto.enum";
import {
  decryptJson,
  encryptJson,
  exportPublicKey,
  generateLoginKeyPair,
  generateRecoveryKey,
  importRecoveryKey,
} from "@/services/crypto.service";
import { formatRecoveryKey } from "@/utils/recovery-key.utils";

const schema = z.object({ site: z.string(), secret: z.string() });
const VALUE = { site: "example.com", secret: "p@ss 😀" };

describe("recovery key", () => {
  it("is 64 hex characters and different every time", () => {
    const [a, b] = [generateRecoveryKey(), generateRecoveryKey()];
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(a).not.toBe(b);
  });

  it("imports as a non-extractable AES-GCM key from any display format", async () => {
    const hex = generateRecoveryKey();
    const key = await importRecoveryKey(formatRecoveryKey(hex));
    expect(key.extractable).toBe(false);
    expect(key.algorithm).toMatchObject({ name: "AES-GCM", length: 256 });
    expect([...key.usages].sort()).toEqual(["decrypt", "encrypt"]);
    await expect(crypto.subtle.exportKey("raw", key)).rejects.toThrow();
  });

  it("rejects a malformed key", async () => {
    await expect(importRecoveryKey("nope")).rejects.toMatchObject({
      kind: CryptoErrorKind.InvalidRecoveryKey,
    });
  });
});

describe("login key pair", () => {
  it("has a non-extractable private key and an exportable public key", async () => {
    const pair = await generateLoginKeyPair();
    expect(pair.privateKey.extractable).toBe(false);
    await expect(crypto.subtle.exportKey("pkcs8", pair.privateKey)).rejects.toThrow();
    expect(await exportPublicKey(pair.publicKey)).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});

describe("encrypted envelope", () => {
  it("round-trips and uses a fresh IV every time", async () => {
    const key = await importRecoveryKey(generateRecoveryKey());
    const [a, b] = [await encryptJson(key, VALUE), await encryptJson(key, VALUE)];
    expect(a).toMatchObject({ version: 1, algorithm: "AES-GCM-256" });
    expect(a.iv).not.toBe(b.iv);
    expect(a.ciphertext).not.toBe(b.ciphertext);
    expect(JSON.stringify(a)).not.toContain("example.com");
    await expect(decryptJson(key, a, schema)).resolves.toEqual(VALUE);
  });

  it("fails the same way for a wrong key, tampering and malformed input", async () => {
    const key = await importRecoveryKey(generateRecoveryKey());
    const other = await importRecoveryKey(generateRecoveryKey());
    const envelope = await encryptJson(key, VALUE);
    const tampered = {
      ...envelope,
      ciphertext: envelope.ciphertext.replace(/^./, (c) => (c === "A" ? "B" : "A")),
    };

    for (const [badKey, input] of [
      [other, envelope],
      [key, tampered],
      [key, { version: 2 }],
      [key, "garbage"],
    ] as const) {
      await expect(decryptJson(badKey, input, schema)).rejects.toMatchObject({
        kind: CryptoErrorKind.DecryptFailed,
        message: expect.not.stringContaining("example.com") as unknown,
      });
    }
  });

  it("rejects a payload of the wrong shape", async () => {
    const key = await importRecoveryKey(generateRecoveryKey());
    const envelope = await encryptJson(key, { unexpected: true });
    await expect(decryptJson(key, envelope, schema)).rejects.toMatchObject({
      kind: CryptoErrorKind.DecryptFailed,
    });
  });
});
