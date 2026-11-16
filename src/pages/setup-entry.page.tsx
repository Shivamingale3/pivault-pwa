import { Navigate } from "react-router";
import { AuthLoading } from "@/components/modules/auth/auth-loading";
import { useSetupEntry } from "@/hooks/use-setup-entry";

/** `/setup`: sends the user to the next unfinished setup step. */
export function SetupEntryPage() {
  const target = useSetupEntry();
  return target ? <Navigate to={target} replace /> : <AuthLoading />;
}
