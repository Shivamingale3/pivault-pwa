import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { of } from "rxjs";
import type * as SyncModule from "@/services/vault-sync.service";
import { afterEach, vi } from "vitest";
import { closeAuthDb } from "@/db/idb";
import { closeVaultDb } from "@/db/vault.db";
import { installMatchMedia } from "@/test/match-media";
import { installPwaCapabilities } from "@/test/pwa-environment";
import { registerCalls } from "@/test/stubs/pwa-register";

installMatchMedia(false);

// Screens behind the unlock mount the real sync. Tests must not reach the network or leave
// replication running, so it is replaced by one that is simply "synced". The sync's own tests
// load the real module with `vi.importActual`.
vi.mock("@/services/vault-sync.service", async (importOriginal) => ({
  ...(await importOriginal<typeof SyncModule>()),
  startVaultSync: vi.fn(() =>
    Promise.resolve({
      state$: of({
        status: "synced" as const,
        progress: null,
        error: null,
        stats: {
          sent: { created: 0, updated: 0, deleted: 0 },
          received: { created: 0, updated: 0, deleted: 0 },
          lastSyncedAt: null,
        },
      }),
      syncNow: () => Promise.resolve(),
      stop: () => Promise.resolve(),
    }),
  ),
}));

// jsdom has no layout, and input-otp probes it (password-manager badge detection).
Object.defineProperty(document, "elementFromPoint", { configurable: true, value: () => null });

afterEach(async () => {
  cleanup();
  await closeVaultDb();
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
