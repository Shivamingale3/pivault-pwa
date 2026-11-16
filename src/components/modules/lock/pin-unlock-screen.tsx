import { AppLogo } from "@/components/modules/brand/app-logo";
import { Keypad } from "@/components/modules/kit/keypad";
import { PinCells } from "@/components/modules/kit/pin-cells";
import { Button } from "@/components/ui/button";
import { LOCK_COPY } from "@/constants/lock.constants";
import type { useUnlockFlow } from "@/hooks/use-unlock-flow";

interface PinUnlockScreenProps {
  flow: ReturnType<typeof useUnlockFlow>;
  onForgot: () => void;
}

/** Welcome, six cells, Show PIN, the error line, then the keypad (with the Face ID key when on). */
export function PinUnlockScreen({ flow, onForgot }: PinUnlockScreenProps) {
  const { pin, wrong, showPin } = flow;
  return (
    <>
      <AppLogo className="size-13.5 rounded-2xl" />
      <h1 className="text-center text-[1.4375rem] font-extrabold tracking-tight">
        {flow.firstName === "" ? LOCK_COPY.welcomeNoName : LOCK_COPY.welcome(flow.firstName)}
      </h1>
      <p className="text-sm font-medium text-muted-foreground">
        {flow.scanning ? LOCK_COPY.scanning : LOCK_COPY.prompt}
      </p>
      <PinCells
        value={pin.value}
        masked={!showPin}
        invalid={wrong !== null}
        shakeKey={pin.shakeKey}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-pressed={showPin}
        onClick={flow.toggleShowPin}
      >
        {showPin ? LOCK_COPY.hidePin : LOCK_COPY.showPin}
      </Button>
      <p
        role="status"
        aria-live="polite"
        className="min-h-7.5 text-center text-xs font-semibold text-destructive-foreground"
      >
        {wrong}
      </p>
      <div className="mt-auto w-full">
        <Keypad
          onDigit={pin.digit}
          onBackspace={pin.backspace}
          onBiometric={flow.faceAvailable ? () => void flow.scan() : undefined}
          scanning={flow.scanning}
        />
      </div>
      <Button type="button" variant="link" size="sm" onClick={onForgot}>
        {LOCK_COPY.forgot}
      </Button>
    </>
  );
}
