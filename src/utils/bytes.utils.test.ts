import { describe, expect, it } from "vitest";
import {
  base64ToBytes,
  base64UrlToBytes,
  bytesToBase64,
  bytesToBase64Url,
  bytesToHex,
  constantTimeEqual,
  hexToBytes,
} from "@/utils/bytes.utils";

describe("bytes utils", () => {
  it("round-trips hex", () => {
    const bytes = Uint8Array.from([0, 1, 15, 16, 255]);
    expect(bytesToHex(bytes)).toBe("00010f10ff");
    expect(hexToBytes("00010f10ff")).toEqual(bytes);
  });

  it("round-trips base64", () => {
    const bytes = Uint8Array.from([0, 250, 3, 128, 77]);
    expect(base64ToBytes(bytesToBase64(bytes))).toEqual(bytes);
  });

  it("encodes base64url without padding or unsafe characters", () => {
    const bytes = Uint8Array.from([251, 255, 254, 1]);
    expect(bytesToBase64(bytes)).toBe("+//+AQ==");
    expect(bytesToBase64Url(bytes)).toBe("-__-AQ");
  });

  it("decodes base64url with or without padding", () => {
    const bytes = Uint8Array.from([251, 255, 254, 1]);
    expect(base64UrlToBytes("-__-AQ")).toEqual(bytes);
    expect(base64UrlToBytes("-__-AQ==")).toEqual(bytes);
    expect(base64UrlToBytes(bytesToBase64Url(Uint8Array.from([1, 2, 3, 4, 5])))).toEqual(
      Uint8Array.from([1, 2, 3, 4, 5]),
    );
  });

  it("compares bytes", () => {
    expect(constantTimeEqual(Uint8Array.of(1, 2), Uint8Array.of(1, 2))).toBe(true);
    expect(constantTimeEqual(Uint8Array.of(1, 2), Uint8Array.of(1, 3))).toBe(false);
    expect(constantTimeEqual(Uint8Array.of(1, 2), Uint8Array.of(1, 2, 0))).toBe(false);
  });
});
