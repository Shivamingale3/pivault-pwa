import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { API_ERROR_MESSAGES } from "@/constants/api.constants";
import { ApiErrorKind } from "@/enums/api.enum";
import { postJson } from "@/services/api.client";
import { ApiError } from "@/services/api.error";
import { calledInit, calledUrl } from "@/test/fetch";

const schema = z.object({ ok: z.literal(true) });
const reply = (status: number, body: unknown) =>
  new Response(typeof body === "string" ? body : JSON.stringify(body), { status });

const mockFetch = (impl: () => Promise<Response>) =>
  vi.spyOn(globalThis, "fetch").mockImplementation(impl);

afterEach(() => vi.restoreAllMocks());

describe("postJson", () => {
  it("returns the validated data of a successful envelope", async () => {
    mockFetch(() =>
      Promise.resolve(reply(200, { success: true, message: "ok", data: { ok: true } })),
    );
    await expect(postJson("/x", { a: 1 }, schema)).resolves.toEqual({ ok: true });
  });

  it("posts JSON to /api on the configured origin with no cookies, cache or referrer", async () => {
    const spy = mockFetch(() =>
      Promise.resolve(reply(200, { success: true, message: "", data: { ok: true } })),
    );
    await postJson("/auth/x", { a: 1 }, schema);

    expect(calledUrl(spy)).toMatch(/\/api\/auth\/x$/);
    expect(calledInit(spy)).toMatchObject({
      method: "POST",
      body: JSON.stringify({ a: 1 }),
      credentials: "omit",
      cache: "no-store",
      referrerPolicy: "no-referrer",
    });
  });

  it("turns an error envelope into an ApiError carrying the server message and status", async () => {
    mockFetch(() => Promise.resolve(reply(400, { success: false, message: "Nope" })));
    const error = await postJson("/x", {}, schema).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ kind: ApiErrorKind.Http, status: 400, message: "Nope" });
  });

  it("falls back to a generic message when an error body is not an envelope", async () => {
    mockFetch(() => Promise.resolve(reply(502, "<html>bad gateway</html>")));
    await expect(postJson("/x", {}, schema)).rejects.toMatchObject({
      kind: ApiErrorKind.Http,
      status: 502,
      message: API_ERROR_MESSAGES.fallback,
    });
  });

  it("rejects a 2xx whose data does not match the schema", async () => {
    mockFetch(() =>
      Promise.resolve(reply(200, { success: true, message: "", data: { ok: false } })),
    );
    await expect(postJson("/x", {}, schema)).rejects.toMatchObject({
      kind: ApiErrorKind.InvalidResponse,
    });
  });

  it("reports an unreachable server as a network error", async () => {
    mockFetch(() => Promise.reject(new TypeError("Failed to fetch")));
    await expect(postJson("/x", {}, schema)).rejects.toMatchObject({
      kind: ApiErrorKind.Network,
      message: API_ERROR_MESSAGES.network,
    });
  });

  it("reports a timeout", async () => {
    mockFetch(() => Promise.reject(new DOMException("timed out", "TimeoutError")));
    await expect(postJson("/x", {}, schema)).rejects.toMatchObject({ kind: ApiErrorKind.Timeout });
  });

  it("rethrows a caller abort untouched so callers can ignore it", async () => {
    const controller = new AbortController();
    const abort = new DOMException("aborted", "AbortError");
    mockFetch(() => {
      controller.abort();
      return Promise.reject(abort);
    });
    await expect(postJson("/x", {}, schema, { signal: controller.signal })).rejects.toBe(abort);
  });
});
