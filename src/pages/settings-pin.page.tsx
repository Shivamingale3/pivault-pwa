import { FormErrorBanner } from "@/components/modules/auth/form-error-banner";
import { Keypad } from "@/components/modules/kit/keypad";
import { PinCells } from "@/components/modules/kit/pin-cells";
import { StepProgress } from "@/components/modules/kit/step-progress";
import { SettingsHeader } from "@/components/modules/settings/settings-header";
import { SettingsLayout } from "@/components/modules/settings/settings-layout";
import { HeadingBlock } from "@/components/modules/setup/heading-block";
import { CHANGE_PIN_COPY, SECURITY_COPY } from "@/constants/settings.constants";
import { SETUP_COPY } from "@/constants/setup.constants";
import { useChangePinFlow } from "@/hooks/use-change-pin-flow";
import { ROUTES } from "@/routes/route-paths";

const HEADINGS = {
  1: { title: CHANGE_PIN_COPY.currentTitle, body: CHANGE_PIN_COPY.currentBody },
  2: { title: SETUP_COPY.step1Title, body: SETUP_COPY.step1Body },
  3: { title: SETUP_COPY.step2Title, body: SETUP_COPY.step2Body },
} as const;

/** Change PIN: three-segment progress, six masked cells, the keypad (no Face ID key). */
export function SettingsPinPage() {
  const flow = useChangePinFlow();
  const heading = HEADINGS[flow.step];

  return (
    <SettingsLayout>
      <SettingsHeader
        title={CHANGE_PIN_COPY.title}
        backTo={ROUTES.settingsSecurity}
        parent={SECURITY_COPY.title}
      />
      <StepProgress step={flow.step} total={3} />
      <HeadingBlock eyebrow={CHANGE_PIN_COPY.eyebrow(flow.step)} title={heading.title}>
        {heading.body}
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
          disabled={flow.busy}
        />
      </div>
    </SettingsLayout>
  );
}
