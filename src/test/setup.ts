import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import { installMatchMedia } from "@/test/match-media";
import { installPwaCapabilities } from "@/test/pwa-environment";
import { registerCalls } from "@/test/stubs/pwa-register";

installMatchMedia(false);

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  document.documentElement.className = "";
  document.documentElement.removeAttribute("style");
  installMatchMedia(false);
  installPwaCapabilities(false);
  registerCalls.length = 0;
  window.history.replaceState(null, "", "/");
  vi.restoreAllMocks();
});
