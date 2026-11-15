import { use } from "react";
import { VaultContext } from "@/contexts/vault.context";
import type { VaultContextValue } from "@/interfaces/vault.interface";

export function useVault(): VaultContextValue {
  const context = use(VaultContext);
  if (!context) {
    throw new Error("useVault must be used within a VaultProvider.");
  }
  return context;
}
