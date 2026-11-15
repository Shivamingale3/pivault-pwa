import type { SubmitEvent } from "react";
import { FormErrorBanner } from "@/components/modules/auth/form-error-banner";
import { PrimaryCta } from "@/components/modules/auth/primary-cta";
import { BiometricOption } from "@/components/modules/setup/biometric-option";
import { PinInput } from "@/components/modules/setup/pin-input";
import { Button } from "@/components/ui/button";
import { SETUP_COPY } from "@/constants/setup.constants";
import type { usePinSetup } from "@/hooks/use-pin-setup";

interface AppLockFormProps {
  pin: ReturnType<typeof usePinSetup>;
  biometricAvailable: boolean;
  biometric: boolean;
  onBiometricChange: (checked: boolean) => void;
  pending: boolean;
  error: string | null;
  onSubmit: () => void;
}

/** Create the PIN, confirm it, optionally pick biometrics, then continue. */
export function AppLockForm({
  pin,
  biometricAvailable,
  biometric,
  onBiometricChange,
  pending,
  error,
  onSubmit,
}: AppLockFormProps) {
  const confirmed = pin.pin !== null;
  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-1 flex-col gap-4">
      <PinInput
        key={confirmed ? "done" : pin.step}
        id="pin"
        label={
          confirmed
            ? SETUP_COPY.pinConfirm
            : SETUP_COPY[pin.step === "create" ? "pinCreate" : "pinConfirm"]
        }
        value={pin.value}
        onChange={pin.onChange}
        disabled={pending || confirmed}
        invalid={pin.error !== null}
      />
      <FormErrorBanner message={pin.error ?? error} />
      {confirmed && biometricAvailable && (
        <BiometricOption checked={biometric} onChange={onBiometricChange} disabled={pending} />
      )}
      <div className="mt-auto flex flex-col gap-3">
        <PrimaryCta type="submit" disabled={!confirmed} busy={pending} busyLabel="Saving">
          Continue
        </PrimaryCta>
        {confirmed && !pending && (
          <Button
            type="button"
            variant="link"
            onClick={() => {
              pin.restart(null);
            }}
          >
            Change PIN
          </Button>
        )}
      </div>
    </form>
  );
}
