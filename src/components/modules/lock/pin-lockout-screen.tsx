import { LockIcon } from "lucide-react";
import { PrimaryCta } from "@/components/modules/auth/primary-cta";
import { CountdownCard } from "@/components/modules/kit/countdown-card";
import { IconTile } from "@/components/modules/kit/icon-tile";
import { Keypad } from "@/components/modules/kit/keypad";
import { LOCK_COPY } from "@/constants/lock.constants";
import { lockCaption } from "@/constants/login.constants";
import type { useUnlockFlow } from "@/hooks/use-unlock-flow";
import { formatWait } from "@/utils/wait.utils";

interface PinLockoutScreenProps {
  flow: ReturnType<typeof useUnlockFlow>;
  onSignInWithPassword: () => void;
}

/** PIN entry paused: the live wait, a way round it through the password, and a dead keypad. */
export function PinLockoutScreen({ flow, onSignInWithPassword }: PinLockoutScreenProps) {
  const { lock } = flow;
  if (!lock) return null;
  return (
    <>
      <IconTile className="mt-2">
        <LockIcon />
      </IconTile>
      <h1 className="text-[1.4375rem] font-extrabold tracking-tight">{LOCK_COPY.lockoutTitle}</h1>
      <p className="text-center text-[0.84375rem] leading-relaxed font-medium text-pretty text-muted-foreground">
        {LOCK_COPY.lockoutBody}
      </p>
      <div className="w-full">
        <CountdownCard
          label={LOCK_COPY.lockoutLabel}
          remainingMs={flow.remainingMs}
          caption={lockCaption(
            lock.attempt,
            lock.attemptsPerRound,
            formatWait(Math.round(lock.nextWaitMs / 1000)),
          )}
        />
      </div>
      <PrimaryCta onClick={onSignInWithPassword}>{LOCK_COPY.signInWithPassword}</PrimaryCta>
      <div className="mt-auto w-full">
        <Keypad onDigit={flow.pin.digit} onBackspace={flow.pin.backspace} disabled />
      </div>
    </>
  );
}
