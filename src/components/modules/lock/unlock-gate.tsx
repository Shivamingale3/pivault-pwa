import { useState } from "react";
import { SuccessOverlay } from "@/components/modules/kit/success-overlay";
import { FaceIdScreen } from "@/components/modules/lock/face-id-screen";
import { ForgotPinSheet } from "@/components/modules/lock/forgot-pin-sheet";
import { GateLayout } from "@/components/modules/lock/gate-layout";
import { PinLockoutScreen } from "@/components/modules/lock/pin-lockout-screen";
import { PinUnlockScreen } from "@/components/modules/lock/pin-unlock-screen";
import { SignOutDialog } from "@/components/modules/settings/sign-out-dialog";
import { LOCK_COPY } from "@/constants/lock.constants";
import { useUnlockFlow } from "@/hooks/use-unlock-flow";

/** The lock screen: whichever of biometrics, PIN or the paused view applies, plus its sheets. */
export function UnlockGate() {
  const flow = useUnlockFlow();
  const [forgot, setForgot] = useState(false);
  const [leaving, setLeaving] = useState(false);

  return (
    <GateLayout>
      {flow.endedElsewhere && (
        <p
          role="status"
          className="w-full rounded-lg bg-muted px-3.5 py-3 text-center text-xs font-semibold text-muted-foreground"
        >
          {LOCK_COPY.endedElsewhere}
        </p>
      )}
      {flow.stage === "lockout" && (
        <PinLockoutScreen
          flow={flow}
          onSignInWithPassword={() => {
            setLeaving(true);
          }}
        />
      )}
      {(flow.stage === "face" || flow.stage === "face-failed") && <FaceIdScreen flow={flow} />}
      {flow.stage === "pin" && (
        <PinUnlockScreen
          flow={flow}
          onForgot={() => {
            setForgot(true);
          }}
        />
      )}
      {forgot && (
        <ForgotPinSheet
          onClose={() => {
            setForgot(false);
          }}
          onContinue={() => {
            setForgot(false);
            setLeaving(true);
          }}
        />
      )}
      {leaving && (
        <SignOutDialog
          mayLoseChanges
          onClose={() => {
            setLeaving(false);
          }}
        />
      )}
      {flow.unlocked && <SuccessOverlay label={LOCK_COPY.unlocked} onDone={flow.finish} />}
    </GateLayout>
  );
}
