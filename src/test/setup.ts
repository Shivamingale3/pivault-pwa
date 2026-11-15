import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import { closeAuthDb } from "@/db/idb";
import { installMatchMedia } from "@/test/match-media";
import { installPwaCapabilities } from "@/test/pwa-environment";
import { registerCalls } from "@/test/stubs/pwa-register";

installMatchMedia(false);

// jsdom has no layout, and input-otp probes it (password-manager badge detection).
Object.defineProperty(document, "elementFromPoint", { configurable: true, value: () => null });

afterEach(async () => {
  cleanup();
  await closeAuthDb();
  window.localStorage.clear();
  document.documentElement.className = "";
  document.documentElement.removeAttribute("style");
  installMatchMedia(false);
  installPwaCapabilities(false);
  registerCalls.length = 0;
  window.history.replaceState(null, "", "/");
  vi.restoreAllMocks();
});
