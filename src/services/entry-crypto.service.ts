import { type EntryInput, entryPayloadSchema } from "@/schemas/vault.schema";
import { decryptJson } from "@/services/crypto.service";
import type { VaultDocument } from "@/types/vault.types";
import { entryAad } from "@/utils/vault.utils";

/**
 * Opens an entry with the first of `keys` that works (the current key, then one being replaced).
 * Null when none does: the entry is tampered, damaged or from another vault. `keyIndex` says which
 * key opened it, so a key replacement knows what still has to be redone.
 */
export async function openWithAny(
  keys: readonly CryptoKey[],
  document: Pick<VaultDocument, "id" | "envelope">,
): Promise<{ payload: EntryInput; keyIndex: number } | null> {
  for (const [keyIndex, key] of keys.entries()) {
    try {
      const payload = await decryptJson(
        key,
        document.envelope,
        entryPayloadSchema,
        entryAad(document.id),
      );
      return { payload, keyIndex };
    } catch {
      // Not this key: try the next one.
    }
  }
  return null;
}
