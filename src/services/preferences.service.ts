import { BehaviorSubject, type Observable } from "rxjs";
import { RecordId, StoreName } from "@/constants/storage.constants";
import { idbDelete, idbGet, idbPut } from "@/db/idb";
import {
  DEFAULT_PREFERENCES,
  type Preferences,
  preferencesSchema,
} from "@/schemas/preferences.schema";

/**
 * This device's choices (lock timeout, clipboard timeout, avatar). Kept in memory too, so code
 * that can't wait (a copy, the lock timer) reads the current values at once.
 */
const current$ = new BehaviorSubject<Preferences>(DEFAULT_PREFERENCES);
let current: Preferences = DEFAULT_PREFERENCES;
const set = (next: Preferences) => {
  current = next;
  current$.next(next);
};

export const currentPreferences = (): Preferences => current;

/** The choices as they change (the avatar on Home follows a new pick at once). */
export const watchPreferences = (): Observable<Preferences> => current$.asObservable();

/** Reads the saved choices. A missing or unreadable record means the defaults. Never throws. */
export async function loadPreferences(): Promise<Preferences> {
  try {
    const parsed = preferencesSchema.safeParse(await idbGet(StoreName.Auth, RecordId.Preferences));
    set(parsed.success ? parsed.data : DEFAULT_PREFERENCES);
  } catch {
    set(DEFAULT_PREFERENCES);
  }
  return current;
}

/** Applies at once and saves. */
export async function savePreferences(patch: Partial<Preferences>): Promise<Preferences> {
  const next = preferencesSchema.parse({ ...current, ...patch });
  set(next);
  await idbPut(StoreName.Auth, RecordId.Preferences, next);
  return next;
}

export async function clearPreferences(): Promise<void> {
  set(DEFAULT_PREFERENCES);
  await idbDelete(StoreName.Auth, RecordId.Preferences);
}
