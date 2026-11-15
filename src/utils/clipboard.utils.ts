export const SECRET_CLIPBOARD_MS = 30_000;

/**
 * Copies text and, after `clearAfterMs`, overwrites the clipboard with nothing so a copied
 * password doesn't linger. Returns false when the browser refuses (no permission, insecure page).
 */
export async function copySecret(
  text: string,
  clearAfterMs = SECRET_CLIPBOARD_MS,
): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    return false;
  }
  setTimeout(() => {
    navigator.clipboard.writeText("").catch(() => undefined);
  }, clearAfterMs);
  return true;
}
