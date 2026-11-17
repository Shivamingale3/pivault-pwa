import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";
import type * as Router from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

const navigate = vi.fn();
vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof Router>()),
  useNavigate: () => navigate,
}));
const { useBack } = await import("@/hooks/use-back");

const wrapper = ({ children }: { children: ReactNode }) => <MemoryRouter>{children}</MemoryRouter>;
const at = (idx: number | undefined) => {
  window.history.replaceState(idx === undefined ? null : { idx }, "");
};

afterEach(() => {
  navigate.mockReset();
  at(undefined);
});

describe("useBack", () => {
  it("goes back through history when there is somewhere to go", () => {
    at(2);
    const { result } = renderHook(() => useBack(), { wrapper });
    result.current("/notes");
    expect(navigate).toHaveBeenCalledWith(-1);
    result.current("/notes", 2);
    expect(navigate).toHaveBeenLastCalledWith(-2);
  });

  it("replaces the screen with the fallback when opened directly", () => {
    at(0);
    const { result } = renderHook(() => useBack(), { wrapper });
    result.current("/notes");
    expect(navigate).toHaveBeenCalledWith("/notes", { replace: true });
    at(1);
    result.current("/notes", 2);
    expect(navigate).toHaveBeenLastCalledWith("/notes", { replace: true });
  });
});
