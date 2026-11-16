import { use } from "react";
import { UsageContext, type UsageContextValue } from "@/contexts/usage.context";

export function useUsage(): UsageContextValue {
  const context = use(UsageContext);
  if (!context) {
    throw new Error("useUsage must be used within a UsageProvider.");
  }
  return context;
}
