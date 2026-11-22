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
  it("offers every style, starts on the initial, and saves a picked character that Home shows", async () => {
    renderUnlocked(ROUTES.settingsAvatar);
    const user = userEvent.setup();
    const styles = await screen.findByRole("group", { name: "Style" });
    expect(within(styles).getAllByRole("button")).toHaveLength(31);
    expect(within(styles).getByRole("button", { name: "Notionists" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    const grid = screen.getByRole("group", { name: "Characters" });
    expect(within(grid).getByRole("button", { name: "Your initial" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(within(grid).getAllByRole("button")).toHaveLength(13);

    await user.click(within(grid).getByRole("button", { name: "Avatar 3" }));
    await waitFor(() => {
      expect(currentPreferences().avatar).toEqual({ style: "notionists", seed: "3" });
    });
    expect(within(grid).getByRole("button", { name: "Avatar 3" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect((await loadPreferences()).avatar).toEqual({ style: "notionists", seed: "3" });

    await user.click(screen.getByRole("button", { name: "Back to Settings" }));
    await user.click(await screen.findByRole("button", { name: "Back" }));
    const settings = await screen.findByRole("link", { name: "Settings" });
    await waitFor(() => {
      expect(settings.querySelector("img")?.getAttribute("src")).toMatch(/^data:image\/svg\+xml;/);
    });
  });

  it("switches style, shows more characters, and credits the artists", async () => {
    renderUnlocked(ROUTES.settingsAvatar);
    const user = userEvent.setup();
    const styles = await screen.findByRole("group", { name: "Style" });
    await user.click(within(styles).getByRole("button", { name: "Pixel art" }));
    expect(within(styles).getByRole("button", { name: "Pixel art" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    const grid = screen.getByRole("group", { name: "Characters" });
    await user.click(screen.getByRole("button", { name: "Show more" }));
    expect(within(grid).getAllByRole("button")).toHaveLength(25);
    await user.click(within(grid).getByRole("button", { name: "Avatar 20" }));
    await waitFor(() => {
      expect(currentPreferences().avatar).toEqual({ style: "pixel-art", seed: "20" });
    });
    expect(screen.getByText(/Lisa Wischofsky.*CC BY 4\.0/)).toBeInTheDocument();
  });

  it("stops offering more at the limit", async () => {
    renderUnlocked(ROUTES.settingsAvatar);
    const user = userEvent.setup();
    await screen.findByRole("group", { name: "Style" });
    for (let round = 0; round < 7; round += 1) {
      await user.click(screen.getByRole("button", { name: "Show more" }));
    }
    expect(screen.queryByRole("button", { name: "Show more" })).toBeNull();
    expect(
      within(screen.getByRole("group", { name: "Characters" })).getAllByRole("button"),
    ).toHaveLength(97);
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
    await savePreferences({ avatar: { style: "lorelei", seed: "5" } });
    renderUnlocked(ROUTES.settingsAvatar);
    const user = userEvent.setup();
    const styles = await screen.findByRole("group", { name: "Style" });
    // Opens on the style that is picked now.
    expect(within(styles).getByRole("button", { name: "Lorelei" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    const grid = screen.getByRole("group", { name: "Characters" });
    expect(within(grid).getByRole("button", { name: "Avatar 5" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
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
      noteFontSize: "medium",
    });
  });
});
