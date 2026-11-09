import type { RegisterSWOptions } from "vite-plugin-pwa/types";
import { vi } from "vitest";

/** Test stand-in for `virtual:pwa-register/react`; captures the options passed by the app. */
export const registerCalls: RegisterSWOptions[] = [];

export const useRegisterSW = vi.fn((options: RegisterSWOptions = {}) => {
  registerCalls.push(options);
  return {
    needRefresh: [false, vi.fn()],
    offlineReady: [false, vi.fn()],
    updateServiceWorker: vi.fn(() => Promise.resolve()),
  };
});
