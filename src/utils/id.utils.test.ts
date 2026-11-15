import { describe, expect, it } from "vitest";
import { newId } from "@/utils/id.utils";

describe("newId", () => {
  it("returns a 26 character ULID, unique and sortable by creation", () => {
    const ids = Array.from({ length: 50 }, newId);
    expect(ids.every((id) => /^[0-9A-HJKMNP-TV-Z]{26}$/.test(id))).toBe(true);
    expect(new Set(ids).size).toBe(50);
    expect([...ids].sort()).toEqual(ids);
  });
});
