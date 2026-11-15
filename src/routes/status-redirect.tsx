import { Navigate } from "react-router";
import { AuthLoading } from "@/components/modules/auth/auth-loading";
import { useAuth } from "@/hooks/use-auth";
import { STATUS_HOME } from "@/routes/route-paths";

/** Unknown paths land on the screen that belongs to the current auth status. */
export function StatusRedirect() {
  const { status, ready } = useAuth();
  if (!ready) return <AuthLoading />;
  return <Navigate to={STATUS_HOME[status]} replace />;
}
