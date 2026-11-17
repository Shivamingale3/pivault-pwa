/**
 * Asks the browser never to clear this app's storage on its own (it may, when the device runs low
 * on space, which would look like being signed out and would lose unsynced items). Best effort:
 * resolves false when the browser refuses or doesn't support it. Never throws.
 */
export async function keepStorage(): Promise<boolean> {
  try {
    if (!("storage" in navigator) || typeof navigator.storage.persist !== "function") return false;
    return (await navigator.storage.persisted()) || (await navigator.storage.persist());
  } catch {
    return false;
  }
}
