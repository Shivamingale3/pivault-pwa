import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useToggle } from "@/hooks/use-toggle";

describe("useToggle", () => {
  it("flips and sets the value", () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current[0]).toBe(false);
    act(() => {
      result.current[1]();
    });
    expect(result.current[0]).toBe(true);
    act(() => {
      result.current[2](false);
    });
    expect(result.current[0]).toBe(false);
  });
});
