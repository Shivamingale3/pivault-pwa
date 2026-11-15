import { ENTRY_AAD_PREFIX } from "@/constants/vault.constants";

/** Ties an encrypted blob to its record id, so it can't be moved onto another record unnoticed. */
export const entryAad = (id: string): string => `${ENTRY_AAD_PREFIX}${id}`;
