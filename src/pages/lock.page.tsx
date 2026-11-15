import { AuthScreenLayout } from "@/components/modules/auth/auth-screen-layout";
import { UnlockForm } from "@/components/modules/lock/unlock-form";
import { LOCK_COPY } from "@/constants/lock.constants";
import { useAuth } from "@/hooks/use-auth";
import { useUnlock } from "@/hooks/use-unlock";

export function LockPage() {
  const unlock = useUnlock();
  const { signOut } = useAuth();

  return (
    <AuthScreenLayout title={LOCK_COPY.title} description={LOCK_COPY.description}>
      <UnlockForm unlock={unlock} onSignOut={signOut} />
    </AuthScreenLayout>
  );
}
