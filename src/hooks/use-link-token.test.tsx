import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, useLocation } from "react-router";
import { describe, expect, it } from "vitest";
import { useLinkToken } from "@/hooks/use-link-token";

const setup = (url: string) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>
  );
  return renderHook(() => ({ token: useLinkToken(), location: useLocation() }), { wrapper });
};

describe("useLinkToken", () => {
  it("returns the token and removes it from the URL", () => {
    const { result } = setup("/reset-password?key=abc123");
    expect(result.current.token).toBe("abc123");
    expect(result.current.location.search).toBe("");
    expect(result.current.location.pathname).toBe("/reset-password");
  });

  it("keeps the token after the URL is cleaned", () => {
    const { result, rerender } = setup("/reset-password?key=abc123");
    rerender();
    expect(result.current.token).toBe("abc123");
  });

  it("returns null when there is no key", () => {
    expect(setup("/reset-password").result.current.token).toBeNull();
  });

  it("leaves other query parameters alone", () => {
    const { result } = setup("/reset-password?key=abc123&lang=en");
    expect(result.current.location.search).toBe("?lang=en");
  });
});
