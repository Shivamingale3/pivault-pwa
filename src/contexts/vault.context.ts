import { createContext } from "react";
import type { VaultContextValue } from "@/interfaces/vault.interface";

export const VaultContext = createContext<VaultContextValue | null>(null);
