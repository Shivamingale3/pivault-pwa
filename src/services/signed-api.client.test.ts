import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { SESSION_MISSING_MESSAGE, signaturePayload } from "@/constants/auth.constants";
import { ApiErrorKind } from "@/enums/api.enum";
import { login } from "@/services/auth.service";
import { loadLoginKeyPair } from "@/services/key-store.service";
import { postSigned } from "@/services/signed-api.client";
import { calledInit } from "@/test/fetch";
import { freshIndexedDbPerTest } from "@/test/indexed-db";

freshIndexedDbPerTest();
afterEach(() => vi.restoreAllMocks());

const reply = (data?: unknown) =>
  new Response(JSON.stringify({ success: true, message: "ok", data }), { status: 200 });

const LOGIN_DATA = {
  token: "t".repeat(43),
  expiresAt: "2026-12-15T10:00:00.000Z",
  user: { id: "01JABC", email: "jane@example.com", firstName: "Jane", lastName: "Doe" },
  recoveryKeyConfigured: false,
};

const fromBase64Url = (value: string): Uint8Array<ArrayBuffer> =>
  Uint8Array.from(atob(value.replaceAll("-", "+").replaceAll("_", "/")), (c) => c.charCodeAt(0));

/* eslint-disable @typescript-eslint/no-non-null-assertion -- the key pair is saved by `login` above */
describe("postSigned", () => {
  it("sends the session token and a signature the device's public key verifies", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(() => Promise.resolve(reply(LOGIN_DATA)));
    await login("jane@example.com", "pw");

    const spy = vi.spyOn(globalThis, "fetch").mockImplementation(() => Promise.resolve(reply()));
    await postSigned("/auth/logout", {}, z.undefined());

    const headers = calledInit(spy, 1).headers as {
      Authorization: string;
      "X-Timestamp": string;
      "X-Signature": string;
    };
    expect(headers.Authorization).toBe(`Bearer ${LOGIN_DATA.token}`);
    const timestamp = headers["X-Timestamp"];
    expect(Math.abs(Date.now() - Number(timestamp))).toBeLessThan(5_000);

    const pair = await loadLoginKeyPair();
    const signature = fromBase64Url(headers["X-Signature"]);
    expect(signature).toHaveLength(64);
    const payload = new TextEncoder().encode(
      signaturePayload(timestamp, "POST", "/api/auth/logout"),
    );
    const valid = await crypto.subtle.verify(
      { name: "ECDSA", hash: "SHA-256" },
      pair!.publicKey,
      signature,
      payload,
    );
    expect(valid).toBe(true);
    const other = new TextEncoder().encode(signaturePayload(timestamp, "POST", "/api/auth/other"));
    await expect(
      crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, pair!.publicKey, signature, other),
    ).resolves.toBe(false);
  });

  it("fails with a 401 and sends nothing when there is no session on this device", async () => {
    const spy = vi.spyOn(globalThis, "fetch");
    await expect(postSigned("/auth/logout", {}, z.undefined())).rejects.toMatchObject({
      kind: ApiErrorKind.Http,
      status: 401,
      message: SESSION_MISSING_MESSAGE,
    });
    expect(spy).not.toHaveBeenCalled();
  });
});
