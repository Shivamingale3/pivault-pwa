import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { RecordId, StoreName } from "@/constants/storage.constants";
import { idbPut } from "@/db/idb";
import { ROUTES } from "@/routes/route-paths";
import {
  clearPreferences,
  currentPreferences,
  loadPreferences,
  savePreferences,
} from "@/services/preferences.service";
import { clearUnlockedKey } from "@/services/secure-memory.service";
import { freshIndexedDbPerTest } from "@/test/indexed-db";
import { renderUnlocked, unlockVaultForTest } from "@/test/vault-screens";

freshIndexedDbPerTest();
beforeEach(unlockVaultForTest);
afterEach(async () => {
  clearUnlockedKey();
  await clearPreferences();
});

describe("Settings › Avatar", () => {
  it("starts on the initial, saves a picked avatar and shows it on Home", async () => {
    renderUnlocked(ROUTES.settingsAvatar);
    const user = userEvent.setup();
    const grid = await screen.findByRole("group", { name: "Avatar" });
    expect(within(grid).getByRole("button", { name: "Your initial" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(within(grid).getAllByRole("button")).toHaveLength(19);

    await user.click(within(grid).getByRole("button", { name: "Avatar 3" }));
    await waitFor(() => {
      expect(currentPreferences().avatar).toEqual({ style: "notionists", seed: "Nova" });
    });
    expect(within(grid).getByRole("button", { name: "Avatar 3" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect((await loadPreferences()).avatar).toEqual({ style: "notionists", seed: "Nova" });

    await user.click(screen.getByRole("button", { name: "Back to Settings" }));
    await user.click(await screen.findByRole("button", { name: "Back" }));
    const settings = await screen.findByRole("link", { name: "Settings" });
    await waitFor(() => {
      expect(settings.querySelector("img")?.getAttribute("src")).toMatch(/^data:image\/svg\+xml;/);
    });
  });

  it("sits inside the profile card like the initial does, not as a cover image", async () => {
    await savePreferences({ avatar: { style: "notionists", seed: "Nova" } });
    renderUnlocked(ROUTES.settings);
    await waitFor(() => {
      expect(document.querySelector('[data-slot="card"] img')).not.toBeNull();
    });
    const card = document.querySelector('[data-slot="card"]');
    expect(card?.querySelector(":scope > img")).toBeNull();
  });

  it("goes back to the initial", async () => {
    renderUnlocked(ROUTES.settingsAvatar);
    const user = userEvent.setup();
    const grid = await screen.findByRole("group", { name: "Avatar" });
    await user.click(within(grid).getByRole("button", { name: "Avatar 10" }));
    await waitFor(() => {
      expect(currentPreferences().avatar?.style).toBe("lorelei");
    });
    await user.click(within(grid).getByRole("button", { name: "Your initial" }));
    await waitFor(() => {
      expect(currentPreferences().avatar).toBeNull();
    });
  });

  it("keeps the other settings of a record saved before avatars existed", async () => {
    await idbPut(StoreName.Auth, RecordId.Preferences, { autoLockMs: 0, clipboardClearMs: null });
    expect(await loadPreferences()).toEqual({
      autoLockMs: 0,
      clipboardClearMs: null,
      avatar: null,
    });
  });
});
