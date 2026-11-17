import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as AppLockConstants from "@/constants/app-lock.constants";
import { EntryKind } from "@/enums/vault.enum";
import { ROUTES } from "@/routes/route-paths";
import { setPin } from "@/services/app-lock.service";
import { generateRecoveryKey } from "@/services/crypto.service";
import * as keyCheck from "@/services/key-check.service";
import { hasPendingReplacement } from "@/services/key-rotation.service";
import * as rotation from "@/services/key-rotation.service";
import { saveVaultKey } from "@/services/key-store.service";
import { clearUnlockedKey, getUnlockedKey } from "@/services/secure-memory.service";
import { addEntry } from "@/services/vault.service";
import { freshIndexedDbPerTest } from "@/test/indexed-db";
import { renderUnlocked, unlockVaultForTest } from "@/test/vault-screens";

vi.mock("@/constants/app-lock.constants", async (importOriginal) => ({
  ...(await importOriginal<typeof AppLockConstants>()),
  PBKDF2_ITERATIONS: 1000,
}));

freshIndexedDbPerTest();

const PIN = "135792";
const press = async (user: ReturnType<typeof userEvent.setup>, pin: string) => {
  for (const digit of pin) await user.click(await screen.findByRole("button", { name: digit }));
};
const groups = () =>
  within(screen.getByRole("list", { name: "Recovery key" })).getAllByRole("listitem");

beforeEach(async () => {
  await unlockVaultForTest();
  await saveVaultKey(getUnlockedKey());
  await setPin(PIN);
});
afterEach(() => {
  clearUnlockedKey();
  vi.restoreAllMocks();
});

describe("Settings › Recovery key", () => {
  it("asks for the PIN, shows the new key once, checks it was saved, then switches to it", async () => {
    await addEntry({ kind: EntryKind.Note, title: "Wifi", body: "x" });
    const oldKey = getUnlockedKey();
    vi.spyOn(rotation, "allOnServer").mockResolvedValue(true);
    const replace = vi.spyOn(keyCheck, "replaceKeyCheck").mockResolvedValue();
    renderUnlocked(ROUTES.settingsRecoveryKey);
    const user = userEvent.setup();

    expect(await screen.findByText("Your recovery key can't be shown again")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Make a new recovery key" }));
    await press(user, PIN);

    expect(await screen.findByText("NEW RECOVERY KEY")).toBeInTheDocument();
    const key = groups().map((group) => group.textContent);
    expect(key).toHaveLength(8);
    const next = screen.getByRole("button", { name: "Continue" });
    expect(next).toBeDisabled();
    await user.click(screen.getByRole("checkbox", { name: "I've saved it somewhere safe" }));
    await user.click(next);

    await user.type(await screen.findByLabelText("Group 2"), key[1] ?? "");
    await user.type(screen.getByLabelText("Group 4"), key[3] ?? "");
    await user.click(screen.getByRole("button", { name: "Use the new key" }));

    expect(await screen.findByText("New key ready")).toBeInTheDocument();
    expect(replace).toHaveBeenCalledOnce();
    expect(await hasPendingReplacement()).toBe(false);
    expect(getUnlockedKey()).not.toBe(oldKey);
  });

  it("finishes an interrupted switch on its own the next time the vault is open", async () => {
    await addEntry({ kind: EntryKind.Note, title: "Wifi", body: "x" });
    await rotation.beginKeyReplacement(generateRecoveryKey());
    vi.spyOn(rotation, "allOnServer").mockResolvedValue(true);
    const replace = vi.spyOn(keyCheck, "replaceKeyCheck").mockResolvedValue();
    const success = vi.spyOn(toast, "success");
    renderUnlocked(ROUTES.home);
    await waitFor(() => {
      expect(success).toHaveBeenCalledWith("Your new recovery key is ready.");
    });
    expect(replace).toHaveBeenCalledOnce();
    expect(await hasPendingReplacement()).toBe(false);
  });

  it("refuses a wrong PIN and keeps the old key", async () => {
    renderUnlocked(ROUTES.settingsRecoveryKey);
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Make a new recovery key" }));
    await press(user, "000111");
    expect(await screen.findByText(/Wrong PIN\. 4 tries left/)).toBeInTheDocument();
    expect(screen.queryByText("NEW RECOVERY KEY")).toBeNull();
  });

  it("stops with a retry when the Pi didn't get everything, keeping the new key for later", async () => {
    vi.spyOn(rotation, "allOnServer").mockResolvedValue(false);
    const replace = vi.spyOn(keyCheck, "replaceKeyCheck").mockResolvedValue();
    renderUnlocked(ROUTES.settingsRecoveryKey);
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Make a new recovery key" }));
    await press(user, PIN);
    await screen.findByText("NEW RECOVERY KEY");
    const key = groups().map((group) => group.textContent);
    await user.click(screen.getByRole("checkbox", { name: "I've saved it somewhere safe" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.type(await screen.findByLabelText("Group 2"), key[1] ?? "");
    await user.type(screen.getByLabelText("Group 4"), key[3] ?? "");
    await user.click(screen.getByRole("button", { name: "Use the new key" }));

    expect(await screen.findByText(/Couldn't save everything to your Pi/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
    await waitFor(async () => {
      expect(await hasPendingReplacement()).toBe(true);
    });
  });
});
