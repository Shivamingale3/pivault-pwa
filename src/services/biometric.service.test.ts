import { afterEach, describe, expect, it, vi } from "vitest";
import { BIOMETRIC_MESSAGES } from "@/constants/auth.constants";
import { CryptoErrorKind } from "@/enums/crypto.enum";
import {
  enrollBiometric,
  isBiometricAvailable,
  verifyBiometric,
} from "@/services/biometric.service";

class FakeCredential {
  static available = true;
  rawId = Uint8Array.of(251, 255, 254).buffer;
  static isUserVerifyingPlatformAuthenticatorAvailable = () =>
    Promise.resolve(FakeCredential.available);
}

const install = (create: () => Promise<unknown>) => {
  vi.stubGlobal("PublicKeyCredential", FakeCredential);
  const spy = vi.fn(create);
  Object.defineProperty(navigator, "credentials", { configurable: true, value: { create: spy } });
  return spy;
};

afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(navigator, "credentials");
  FakeCredential.available = true;
});

describe("isBiometricAvailable", () => {
  it("is false without WebAuthn support", async () => {
    await expect(isBiometricAvailable()).resolves.toBe(false);
  });

  it("follows the platform authenticator check, and never throws", async () => {
    vi.stubGlobal("PublicKeyCredential", FakeCredential);
    await expect(isBiometricAvailable()).resolves.toBe(true);
    FakeCredential.available = false;
    await expect(isBiometricAvailable()).resolves.toBe(false);
    vi.stubGlobal("PublicKeyCredential", {
      isUserVerifyingPlatformAuthenticatorAvailable: () => Promise.reject(new Error("blocked")),
    });
    await expect(isBiometricAvailable()).resolves.toBe(false);
  });
});

describe("enrollBiometric", () => {
  const user = { userId: "01JABC", email: "jane@example.com" };

  it("asks for a verified platform credential and returns its id as base64url", async () => {
    const create = install(() => Promise.resolve(new FakeCredential()));
    await expect(enrollBiometric(user)).resolves.toBe("-__-");

    const options = (
      create.mock.calls[0] as unknown as [{ publicKey: PublicKeyCredentialCreationOptions }]
    )[0].publicKey;
    expect(options.authenticatorSelection).toMatchObject({
      authenticatorAttachment: "platform",
      userVerification: "required",
    });
    expect(options.user.name).toBe("jane@example.com");
    expect((options.challenge as Uint8Array).byteLength).toBe(32);
  });

  it("turns a cancel or refusal into a safe error", async () => {
    install(() => Promise.reject(new DOMException("denied", "NotAllowedError")));
    await expect(enrollBiometric(user)).rejects.toMatchObject({
      kind: CryptoErrorKind.Failed,
      message: BIOMETRIC_MESSAGES.failed,
    });
  });

  it("rejects an unexpected result", async () => {
    install(() => Promise.resolve(null));
    await expect(enrollBiometric(user)).rejects.toMatchObject({ kind: CryptoErrorKind.Failed });
  });
});

describe("verifyBiometric", () => {
  const installGet = (get: () => Promise<unknown>) => {
    vi.stubGlobal("PublicKeyCredential", FakeCredential);
    const spy = vi.fn(get);
    Object.defineProperty(navigator, "credentials", { configurable: true, value: { get: spy } });
    return spy;
  };

  it("asks for the enrolled credential with user verification and is true when confirmed", async () => {
    const get = installGet(() => Promise.resolve(new FakeCredential()));
    await expect(verifyBiometric("-__-")).resolves.toBe(true);
    const options = (
      get.mock.calls[0] as unknown as [{ publicKey: PublicKeyCredentialRequestOptions }]
    )[0].publicKey;
    expect(options.userVerification).toBe("required");
    expect(options.allowCredentials).toHaveLength(1);
    expect(new Uint8Array(options.allowCredentials?.[0]?.id as ArrayBuffer)).toEqual(
      Uint8Array.of(251, 255, 254),
    );
  });

  it("is false when cancelled, refused or nothing comes back", async () => {
    installGet(() => Promise.reject(new DOMException("no", "NotAllowedError")));
    await expect(verifyBiometric("-__-")).resolves.toBe(false);
    installGet(() => Promise.resolve(null));
    await expect(verifyBiometric("-__-")).resolves.toBe(false);
  });
});
