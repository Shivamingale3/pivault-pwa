import { describe, expect, it } from "vitest";
import { CryptoErrorKind } from "@/enums/crypto.enum";
import { formatRecoveryKey, parseRecoveryKey } from "@/utils/recovery-key.utils";

const HEX = "0123456789abcdef".repeat(4);

describe("recovery key formatting", () => {
  it("shows 8 groups of 8 characters", () => {
    const parts = formatRecoveryKey(HEX).split("-");
    expect(parts).toHaveLength(8);
    expect(parts.every((part) => part.length === 8)).toBe(true);
  });

  it("parses the displayed form back, ignoring case, spaces and hyphens", () => {
    expect(parseRecoveryKey(formatRecoveryKey(HEX))).toBe(HEX);
    expect(
      parseRecoveryKey(`  ${formatRecoveryKey(HEX).toUpperCase().replaceAll("-", " ")} `),
    ).toBe(HEX);
  });

  it.each(["", "abc", `${HEX}0`, "g".repeat(64), HEX.slice(1)])("rejects %j", (input) => {
    expect(() => parseRecoveryKey(input)).toThrow(
      expect.objectContaining({ kind: CryptoErrorKind.InvalidRecoveryKey }),
    );
  });
});
