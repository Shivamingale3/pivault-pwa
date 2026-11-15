import { Navigate, Outlet } from "react-router";
import { AuthLoading } from "@/components/modules/auth/auth-loading";
import type { AuthStatus } from "@/enums/auth.enum";
import { useAuth } from "@/hooks/use-auth";
import { STATUS_HOME } from "@/routes/route-paths";

interface ZoneGuardProps {
  /** The only auth status allowed inside this route zone. */
  allow: AuthStatus;
}

/**
 * Keeps every auth status inside its own zone. Anyone in the wrong zone is redirected with
 * `replace`, so a logged-in user can't reach login/lock by URL or by the back button.
 */
export function ZoneGuard({ allow }: ZoneGuardProps) {
  const { status, ready } = useAuth();
  if (!ready) return <AuthLoading />;
  if (status !== allow) {
    return <Navigate to={STATUS_HOME[status]} replace />;
  }
  return <Outlet />;
}
