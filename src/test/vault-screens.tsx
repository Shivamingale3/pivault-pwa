import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { AuthStatus } from "@/enums/auth.enum";
import { AuthProvider } from "@/providers/auth.provider";
import { AppRoutes } from "@/routes/app.routes";
import type { SessionRecord } from "@/schemas/session.schema";
import { generateRecoveryKey, importRecoveryKey } from "@/services/crypto.service";
import { setUnlockedKey } from "@/services/secure-memory.service";
import { saveSession } from "@/services/session.service";

export const TEST_SESSION: SessionRecord = {
  userId: "01JABC",
  email: "jane@example.com",
  firstName: "Jane",
  lastName: "Doe",
  token: "t".repeat(43),
  expiresAt: "2099-12-15T10:00:00.000Z",
  recoveryKeyConfigured: true,
  setupDone: true,
};

/** An unlocked vault for a screen test: a saved session and a vault key in memory. */
export async function unlockVaultForTest(): Promise<void> {
  await saveSession(TEST_SESSION);
  setUnlockedKey(await importRecoveryKey(generateRecoveryKey()));
}

/** Renders the whole unlocked app at `path` (or a path with router state). */
export const renderUnlocked = (
  path: string | { pathname: string; search?: string; state?: unknown },
) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider initialStatus={AuthStatus.Unlocked}>
        <AppRoutes />
      </AuthProvider>
    </MemoryRouter>,
  );
