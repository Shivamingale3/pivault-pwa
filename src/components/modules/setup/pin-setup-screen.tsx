import { FormErrorBanner } from "@/components/modules/auth/form-error-banner";
import { Keypad } from "@/components/modules/kit/keypad";
import { PinCells } from "@/components/modules/kit/pin-cells";
import { StepProgress } from "@/components/modules/kit/step-progress";
import { FaceIdOfferSheet } from "@/components/modules/setup/face-id-offer-sheet";
import { HeadingBlock } from "@/components/modules/setup/heading-block";
import { SetupShell } from "@/components/modules/setup/setup-shell";
import { SETUP_COPY } from "@/constants/setup.constants";
import type { usePinSetupFlow } from "@/hooks/use-pin-setup-flow";

/** Set up PIN: two-segment progress, the six masked cells, the keypad (no biometric key here). */
export function PinSetupScreen({ flow }: { flow: ReturnType<typeof usePinSetupFlow> }) {
  const first = flow.step === 1;
  return (
    <SetupShell>
      <StepProgress step={flow.step} total={2} />
      <HeadingBlock
        eyebrow={first ? SETUP_COPY.step1Eyebrow : SETUP_COPY.step2Eyebrow}
        title={first ? SETUP_COPY.step1Title : SETUP_COPY.step2Title}
      >
        {first ? SETUP_COPY.step1Body : SETUP_COPY.step2Body}
      </HeadingBlock>
      <PinCells
        value={flow.entry.value}
        invalid={flow.message !== null}
        shakeKey={flow.entry.shakeKey}
      />
      <FormErrorBanner message={flow.message} />
      <div className="mt-auto">
        <Keypad
          onDigit={flow.entry.digit}
          onBackspace={flow.entry.backspace}
          disabled={flow.pending}
        />
      </div>
      {flow.offer && <FaceIdOfferSheet onAnswer={flow.answerOffer} />}
    </SetupShell>
  );
}
