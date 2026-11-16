import { describe, expect, it } from "vitest";
import { DEFAULT_GENERATOR, generatePassword } from "@/utils/password-generator.utils";

describe("generatePassword", () => {
  it("has the asked length and one of each chosen group, without look-alikes", () => {
    for (let round = 0; round < 50; round += 1) {
      const value = generatePassword(DEFAULT_GENERATOR);
      expect(value).toHaveLength(16);
      expect(value).toMatch(/[a-z]/);
      expect(value).toMatch(/[A-Z]/);
      expect(value).toMatch(/\d/);
      expect(value).toMatch(/[^A-Za-z0-9]/);
      expect(value).not.toMatch(/[l1IO0]/);
    }
  });

  it("leaves out the groups that are switched off", () => {
    const value = generatePassword({
      ...DEFAULT_GENERATOR,
      length: 40,
      uppercase: false,
      numbers: false,
      symbols: false,
    });
    expect(value).toMatch(/^[a-z]{40}$/);
  });

  it("keeps the length inside its limits and differs between calls", () => {
    expect(generatePassword({ ...DEFAULT_GENERATOR, length: 2 })).toHaveLength(8);
    expect(generatePassword({ ...DEFAULT_GENERATOR, length: 999 })).toHaveLength(40);
    expect(generatePassword(DEFAULT_GENERATOR)).not.toBe(generatePassword(DEFAULT_GENERATOR));
  });

  it("can use look-alikes when allowed", () => {
    const seen = Array.from({ length: 200 }, () =>
      generatePassword({ ...DEFAULT_GENERATOR, lookAlikes: true, length: 40 }),
    ).join("");
    expect(seen).toMatch(/[l1IO0]/);
  });
});
