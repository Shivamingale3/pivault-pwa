import { describe, expect, it } from "vitest";
import { safeHttpUrl } from "@/utils/url.utils";

describe("safeHttpUrl", () => {
  it("accepts http and https addresses", () => {
    expect(safeHttpUrl("https://bank.example/login")).toBe("https://bank.example/login");
    expect(safeHttpUrl("  http://localhost:3000 ")).toBe("http://localhost:3000/");
  });

  it.each([
    "javascript:alert(1)",
    "data:text/html,<b>x</b>",
    "file:///etc/passwd",
    "bank.example",
    "",
  ])("refuses %j", (value) => {
    expect(safeHttpUrl(value)).toBeNull();
  });
});
