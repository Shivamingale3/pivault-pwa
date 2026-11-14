import { afterEach, describe, expect, it, vi } from "vitest";
import { calledInit, calledUrl } from "@/test/fetch";
import { completeLink, validateLink } from "@/services/password-link.service";

const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });
const TOKEN = "A".repeat(43);

afterEach(() => vi.restoreAllMocks());

describe("password link service", () => {
  it("validates a link and returns its status", async () => {
    const spy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      reply(200, {
        success: true,
        message: "Link is valid",
        data: { purpose: "onboarding", expiresAt: "2026-11-15T10:00:00.000Z" },
      }),
    );

    await expect(validateLink(TOKEN)).resolves.toEqual({
      purpose: "onboarding",
      expiresAt: "2026-11-15T10:00:00.000Z",
    });
    expect(calledUrl(spy)).toMatch(/\/api\/auth\/password-links\/validate$/);
    expect(calledInit(spy).body).toBe(JSON.stringify({ token: TOKEN }));
  });

  it("keeps the token out of the URL", async () => {
    const spy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(reply(200, { success: true, message: "", data: { emailVerified: true } }));
    await completeLink(TOKEN, "Passw0rd!");
    expect(calledUrl(spy)).not.toContain(TOKEN);
  });

  it("completes a link with the token and password in the body", async () => {
    const spy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(reply(200, { success: true, message: "", data: { emailVerified: true } }));
    await expect(completeLink(TOKEN, "Passw0rd!")).resolves.toBeUndefined();
    expect(calledUrl(spy)).toMatch(/\/api\/auth\/password-links\/complete$/);
    expect(calledInit(spy).body).toBe(JSON.stringify({ token: TOKEN, password: "Passw0rd!" }));
  });

  it("rejects when the server refuses the link", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      reply(400, { success: false, message: "This link is invalid or has expired" }),
    );
    await expect(validateLink(TOKEN)).rejects.toMatchObject({
      status: 400,
      message: "This link is invalid or has expired",
    });
  });
});
