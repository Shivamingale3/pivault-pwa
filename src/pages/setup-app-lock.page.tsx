import { AuthScreenLayout } from "@/components/modules/auth/auth-screen-layout";
import { AppLockForm } from "@/components/modules/setup/app-lock-form";
import { SETUP_COPY } from "@/constants/setup.constants";
import { useAppLockSetup } from "@/hooks/use-app-lock-setup";

export function SetupAppLockPage() {
  const setup = useAppLockSetup();

  return (
    <AuthScreenLayout title={SETUP_COPY.pinTitle} description={SETUP_COPY.pinDescription}>
      <AppLockForm
        pin={setup.pin}
        biometricAvailable={setup.biometricAvailable}
        biometric={setup.biometric}
        onBiometricChange={setup.setBiometric}
        pending={setup.pending}
        error={setup.error}
        onSubmit={() => void setup.submit()}
      />
    </AuthScreenLayout>
  );
}
