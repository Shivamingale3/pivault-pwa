import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import { installMatchMedia } from "@/test/match-media";

installMatchMedia(false);

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  document.documentElement.className = "";
  document.documentElement.removeAttribute("style");
  installMatchMedia(false);
  vi.restoreAllMocks();
});
