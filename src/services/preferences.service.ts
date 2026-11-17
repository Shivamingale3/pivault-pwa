import { RecordId, StoreName } from "@/constants/storage.constants";
import { idbDelete, idbGet, idbPut } from "@/db/idb";
import {
  DEFAULT_PREFERENCES,
  type Preferences,
  preferencesSchema,
} from "@/schemas/preferences.schema";

/**
 * This device's Security choices (lock timeout, clipboard timeout). Kept in memory too, so code
 * that can't wait (a copy, the lock timer) reads the current values at once.
 */
let current: Preferences = DEFAULT_PREFERENCES;

export const currentPreferences = (): Preferences => current;

/** Reads the saved choices. A missing or unreadable record means the defaults. Never throws. */
export async function loadPreferences(): Promise<Preferences> {
  try {
    const parsed = preferencesSchema.safeParse(await idbGet(StoreName.Auth, RecordId.Preferences));
    current = parsed.success ? parsed.data : DEFAULT_PREFERENCES;
  } catch {
    current = DEFAULT_PREFERENCES;
  }
  return current;
}

/** Applies at once and saves. */
export async function savePreferences(patch: Partial<Preferences>): Promise<Preferences> {
  const next = preferencesSchema.parse({ ...current, ...patch });
  current = next;
  await idbPut(StoreName.Auth, RecordId.Preferences, next);
  return next;
}

export async function clearPreferences(): Promise<void> {
  current = DEFAULT_PREFERENCES;
  await idbDelete(StoreName.Auth, RecordId.Preferences);
}
