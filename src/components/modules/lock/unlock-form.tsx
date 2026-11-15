import { FingerprintIcon } from "lucide-react";
import { FormErrorBanner } from "@/components/modules/auth/form-error-banner";
import { PinInput } from "@/components/modules/setup/pin-input";
import { Button } from "@/components/ui/button";
import { LOCK_COPY } from "@/constants/lock.constants";
import type { useUnlock } from "@/hooks/use-unlock";

interface UnlockFormProps {
  unlock: ReturnType<typeof useUnlock>;
  onSignOut: () => void;
}

/** PIN boxes that unlock as soon as the sixth digit is typed, a biometric shortcut, and sign out. */
export function UnlockForm({ unlock, onSignOut }: UnlockFormProps) {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PinInput
        id="unlock-pin"
        label={LOCK_COPY.pinLabel}
        value={unlock.value}
        onChange={unlock.onChange}
        disabled={unlock.pending || unlock.lockedOut}
        invalid={unlock.message !== null}
      />
      <FormErrorBanner message={unlock.message} />
      <div className="mt-auto flex flex-col gap-3">
        {unlock.biometric && (
          <Button
            type="button"
            variant="outline"
            size="xl"
            className="w-full"
            onClick={() => void unlock.unlockBiometric()}
          >
            <FingerprintIcon aria-hidden="true" />
            {LOCK_COPY.biometricButton}
          </Button>
        )}
        <Button type="button" variant="link" onClick={onSignOut}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
