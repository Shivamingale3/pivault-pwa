import { use } from "react";
import { AuthContext } from "@/contexts/auth.context";
import type { AuthContextValue } from "@/interfaces/auth.interface";

export function useAuth(): AuthContextValue {
  const context = use(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
