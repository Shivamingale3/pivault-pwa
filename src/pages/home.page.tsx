import { AuthScreenLayout } from "@/components/modules/auth/auth-screen-layout";
import { PrimaryCta } from "@/components/modules/auth/primary-cta";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useSession } from "@/hooks/use-session";

/** The signed-in, unlocked app. The vault itself comes later; for now it shows the account. */
export function HomePage() {
  const { lock, signOut } = useAuth();
  const session = useSession();

  return (
    <AuthScreenLayout
      title="Home"
      description={
        session ? `Signed in as ${session.email}. Your vault will appear here.` : undefined
      }
      footer={
        <>
          <PrimaryCta onClick={lock}>Lock</PrimaryCta>
          <Button variant="link" onClick={signOut}>
            Sign out
          </Button>
        </>
      }
    />
  );
}
