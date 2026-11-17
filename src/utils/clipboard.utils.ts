export const SECRET_CLIPBOARD_MS = 30_000;

/**
 * Copies text and, after `clearAfterMs`, overwrites the clipboard with nothing so a copied
 * password doesn't linger. `null` leaves it there (the user chose "Never" in Security). Returns false when the browser refuses (no permission, insecure page).
 */
export async function copySecret(
  text: string,
  clearAfterMs: number | null = SECRET_CLIPBOARD_MS,
): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    return false;
  }
  if (clearAfterMs !== null) {
    setTimeout(() => {
      navigator.clipboard.writeText("").catch(() => undefined);
    }, clearAfterMs);
  }
  return true;
}
