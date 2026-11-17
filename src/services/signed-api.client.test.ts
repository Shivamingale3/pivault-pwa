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
      "X-Body-SHA256": string;
    };
    // SHA-256 of "{}", the exact body sent.
    const bodyHash = headers["X-Body-SHA256"];
    expect(bodyHash).toBe("RBNvo1WzZ4oRRq0W9-hknpT7T8If536DEMBg9hyq_4o");
    expect(calledInit(spy, 1).body).toBe("{}");
    expect(headers.Authorization).toBe(`Bearer ${LOGIN_DATA.token}`);
    const timestamp = headers["X-Timestamp"];
    expect(Math.abs(Date.now() - Number(timestamp))).toBeLessThan(5_000);

    const pair = await loadLoginKeyPair();
    const signature = fromBase64Url(headers["X-Signature"]);
    expect(signature).toHaveLength(64);
    const payload = new TextEncoder().encode(
      signaturePayload(timestamp, "POST", "/api/auth/logout", bodyHash),
    );
    const valid = await crypto.subtle.verify(
      { name: "ECDSA", hash: "SHA-256" },
      pair!.publicKey,
      signature,
      payload,
    );
    expect(valid).toBe(true);
    const verifies = (text: string) =>
      crypto.subtle.verify(
        { name: "ECDSA", hash: "SHA-256" },
        pair!.publicKey,
        signature,
        new TextEncoder().encode(text),
      );
    // Not valid for another path, another body, or without the body.
    await expect(
      verifies(signaturePayload(timestamp, "POST", "/api/auth/other", bodyHash)),
    ).resolves.toBe(false);
    await expect(
      verifies(signaturePayload(timestamp, "POST", "/api/auth/logout", "x".repeat(43))),
    ).resolves.toBe(false);
    await expect(verifies(`${timestamp}.POST./api/auth/logout`)).resolves.toBe(false);
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
