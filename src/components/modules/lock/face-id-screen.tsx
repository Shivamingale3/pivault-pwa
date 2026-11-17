import { FrownIcon } from "lucide-react";
import { BiometricIcon } from "@/components/modules/kit/biometric-icon";
import { PrimaryCta } from "@/components/modules/auth/primary-cta";
import { AppLogo } from "@/components/modules/brand/app-logo";
import { Button } from "@/components/ui/button";
import { LOCK_COPY } from "@/constants/lock.constants";
import type { useUnlockFlow } from "@/hooks/use-unlock-flow";
import { cn } from "@/lib/utils";

/**
 * Biometrics first (fingerprint or face, whatever the phone uses). The big tile starts a scan (some browsers need a tap before they ask the device);
 * after two misses it turns into the failure screen with a way to the PIN.
 */
export function FaceIdScreen({ flow }: { flow: ReturnType<typeof useUnlockFlow> }) {
  const failed = flow.stage === "face-failed";
  return (
    <>
      <AppLogo className="size-13.5 rounded-2xl" />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <button
          type="button"
          aria-label={LOCK_COPY.faceTitle}
          onClick={() => void flow.scan()}
          className={cn(
            "flex size-33.5 items-center justify-center rounded-[2.25rem] border-[1.5px] outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-14",
            failed
              ? "border-destructive bg-destructive-surface text-destructive"
              : "border-border bg-muted",
            flow.scanning && "animate-pulse-soft",
          )}
        >
          {failed ? <FrownIcon aria-hidden="true" /> : <BiometricIcon />}
        </button>
        <h1 className="text-[1.4375rem] font-extrabold tracking-tight">
          {failed ? LOCK_COPY.failedTitle : LOCK_COPY.faceTitle}
        </h1>
        <p className="max-w-72 text-[0.84375rem] leading-relaxed font-medium text-pretty text-muted-foreground">
          {failed ? LOCK_COPY.failedBody : LOCK_COPY.faceBody}
        </p>
      </div>
      {failed ? (
        <div className="flex w-full flex-col gap-3">
          <PrimaryCta onClick={flow.retryFace} busy={flow.scanning}>
            {LOCK_COPY.tryFaceAgain}
          </PrimaryCta>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={flow.usePin}
          >
            {LOCK_COPY.enterPin}
          </Button>
        </div>
      ) : (
        <div className="flex w-full flex-col items-center gap-3">
          <Button type="button" variant="link" size="sm" onClick={flow.usePin}>
            {LOCK_COPY.enterPin}
          </Button>
        </div>
      )}
    </>
  );
}
