import { describe, expect, it } from "vitest";
import { avatarDataUri } from "@/utils/avatar.utils";

describe("avatarDataUri", () => {
  it("draws each style as an SVG data URI, the same for the same seed and different for another", async () => {
    for (const style of ["notionists", "lorelei"] as const) {
      const first = await avatarDataUri({ style, seed: "Aria" });
      expect(first).toMatch(/^data:image\/svg\+xml;/);
      expect(await avatarDataUri({ style, seed: "Aria" })).toBe(first);
      expect(await avatarDataUri({ style, seed: "Milo" })).not.toBe(first);
    }
  });

  it("puts nothing in the picture that would load from outside", async () => {
    const uri = decodeURIComponent(await avatarDataUri({ style: "notionists", seed: "Nova" }));
    // The licence credits mention web addresses as text; nothing may point the picture at one.
    expect(uri).not.toMatch(/(?:href|src)\s*=\s*["']https?:|url\(\s*["']?https?:/);
  });
});
