import { describe, expect, it } from "vitest";
import { AVATAR_STYLES } from "@/constants/avatar.constants";
import { avatarDataUri } from "@/utils/avatar.utils";

describe("avatarDataUri", () => {
  it("draws every style in the collection, the same for the same seed and different for another", async () => {
    expect(AVATAR_STYLES).toHaveLength(31);
    for (const style of AVATAR_STYLES) {
      const first = await avatarDataUri({ style, seed: "1" });
      expect(first, style).toMatch(/^data:image\/svg\+xml;/);
      expect(await avatarDataUri({ style, seed: "1" })).toBe(first);
      expect(await avatarDataUri({ style, seed: "2" }), style).not.toBe(first);
    }
  }, 60_000);

  it("puts nothing in any picture that would load from outside", async () => {
    for (const style of AVATAR_STYLES) {
      const uri = decodeURIComponent(await avatarDataUri({ style, seed: "3" }));
      // Licence credits mention web addresses as text; nothing may point the picture at one.
      expect(uri, style).not.toMatch(/(?:href|src)\s*=\s*["']https?:|url\(\s*["']?https?:|@import/);
    }
  }, 60_000);
});
