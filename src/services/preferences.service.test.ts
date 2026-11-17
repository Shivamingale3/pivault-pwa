import { describe, expect, it } from "vitest";
import { RecordId, StoreName } from "@/constants/storage.constants";
import { idbPut } from "@/db/idb";
import { DEFAULT_PREFERENCES } from "@/schemas/preferences.schema";
import {
  clearPreferences,
  currentPreferences,
  loadPreferences,
  savePreferences,
} from "@/services/preferences.service";
import { freshIndexedDbPerTest } from "@/test/indexed-db";

freshIndexedDbPerTest();

describe("preferences", () => {
  it("starts with the defaults, saves a change and applies it at once", async () => {
    expect(await loadPreferences()).toEqual(DEFAULT_PREFERENCES);
    await savePreferences({ autoLockMs: 0 });
    expect(currentPreferences()).toEqual({ autoLockMs: 0, clipboardClearMs: 30_000, avatar: null });
    await savePreferences({ clipboardClearMs: null });
    expect(await loadPreferences()).toEqual({
      autoLockMs: 0,
      clipboardClearMs: null,
      avatar: null,
    });
  });

  it("refuses a value that is not one of the choices", async () => {
    await loadPreferences();
    await expect(savePreferences({ autoLockMs: 5 as never })).rejects.toThrow();
    expect(currentPreferences()).toEqual(DEFAULT_PREFERENCES);
    expect(await loadPreferences()).toEqual(DEFAULT_PREFERENCES);
  });

  it("falls back to the defaults for a damaged record, and on clear", async () => {
    await idbPut(StoreName.Auth, RecordId.Preferences, { autoLockMs: "soon" });
    expect(await loadPreferences()).toEqual(DEFAULT_PREFERENCES);
    await savePreferences({ autoLockMs: 900_000 });
    await clearPreferences();
    expect(currentPreferences()).toEqual(DEFAULT_PREFERENCES);
    expect(await loadPreferences()).toEqual(DEFAULT_PREFERENCES);
  });
});
