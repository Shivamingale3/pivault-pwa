import { AuthLoading } from "@/components/modules/auth/auth-loading";
import { AuthScreenLayout } from "@/components/modules/auth/auth-screen-layout";
import { PrimaryCta } from "@/components/modules/auth/primary-cta";
import { RecoveryKeyCreate } from "@/components/modules/setup/recovery-key-create";
import { RecoveryKeyEnter } from "@/components/modules/setup/recovery-key-enter";
import { SETUP_COPY } from "@/constants/setup.constants";
import { useAuth } from "@/hooks/use-auth";
import { useEnterRecoveryKey } from "@/hooks/use-enter-recovery-key";
import { useNewRecoveryKey } from "@/hooks/use-new-recovery-key";
import { useRecoveryMode } from "@/hooks/use-recovery-mode";

/** First login creates and shows a recovery key; a new device asks for the existing one. */
export function SetupRecoveryKeyPage() {
  const mode = useRecoveryMode();
  const { signOut } = useAuth();

  switch (mode) {
    case "loading":
      return <AuthLoading />;
    case "error":
      return (
        <AuthScreenLayout
          title={SETUP_COPY.accountError}
          footer={<PrimaryCta onClick={signOut}>Sign out</PrimaryCta>}
        />
      );
    case "create":
      return <CreateKey />;
    case "enter":
      return <EnterKey />;
  }
}

function CreateKey() {
  const state = useNewRecoveryKey();
  return (
    <AuthScreenLayout title={SETUP_COPY.keyTitle} description={SETUP_COPY.keyDescription}>
      <RecoveryKeyCreate state={state} />
    </AuthScreenLayout>
  );
}

function EnterKey() {
  const state = useEnterRecoveryKey();
  return (
    <AuthScreenLayout title={SETUP_COPY.enterTitle} description={SETUP_COPY.enterDescription}>
      <RecoveryKeyEnter state={state} />
    </AuthScreenLayout>
  );
}
