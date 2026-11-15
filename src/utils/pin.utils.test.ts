import { describe, expect, it } from "vitest";
import { isWeakPin } from "@/utils/pin.utils";

describe("isWeakPin", () => {
  it.each(["000000", "111111", "123456", "654321", "012345", "987654"])("rejects %s", (pin) => {
    expect(isWeakPin(pin)).toBe(true);
  });

  it.each(["135792", "121212", "123457", "112233", "246801", "100000"])("allows %s", (pin) => {
    expect(isWeakPin(pin)).toBe(false);
  });
});
