import { describe, expect, it } from "vitest";
import { PWA_BYPASS_PATHS } from "@/constants/pwa.constants";
import { ROUTES } from "@/routes/route-paths";

describe("route paths", () => {
  it("keeps the emailed-link page reachable without installing the app", () => {
    expect(PWA_BYPASS_PATHS).toContain(ROUTES.resetPassword);
  });
});
