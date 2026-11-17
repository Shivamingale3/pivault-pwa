import { KeyRoundIcon } from "lucide-react";
import { FormErrorBanner } from "@/components/modules/auth/form-error-banner";
import { PrimaryCta } from "@/components/modules/auth/primary-cta";
import { IconTile } from "@/components/modules/kit/icon-tile";
import { WarningBlock } from "@/components/modules/kit/info-note";
import { Keypad } from "@/components/modules/kit/keypad";
import { PinCells } from "@/components/modules/kit/pin-cells";
import { SuccessOverlay } from "@/components/modules/kit/success-overlay";
import { KeySwitchProgress } from "@/components/modules/settings/key-switch-progress";
import { SettingsHeader } from "@/components/modules/settings/settings-header";
import { SettingsLayout } from "@/components/modules/settings/settings-layout";
import { HeadingBlock } from "@/components/modules/setup/heading-block";
import { RecoveryConfirmScreen } from "@/components/modules/setup/recovery-confirm-screen";
import { RecoveryRevealScreen } from "@/components/modules/setup/recovery-reveal-screen";
import { Card } from "@/components/ui/card";
import { RECOVERY_KEY_COPY, SECURITY_COPY } from "@/constants/settings.constants";
import { useBack } from "@/hooks/use-back";
import { useReplaceRecoveryKey } from "@/hooks/use-replace-recovery-key";
import { ROUTES } from "@/routes/route-paths";

/** Settings › Recovery key: what it is, and making a new one (PIN, show once, type back, switch). */
export function SettingsRecoveryKeyPage() {
  const flow = useReplaceRecoveryKey();
  const back = useBack();

  if (flow.stage === "reveal")
    return <RecoveryRevealScreen reveal={flow.reveal} eyebrow={RECOVERY_KEY_COPY.revealEyebrow} />;
  if (flow.stage === "confirm")
    return <RecoveryConfirmScreen confirm={flow.confirm} finishLabel={RECOVERY_KEY_COPY.finish} />;
  if (flow.stage === "working" || flow.stage === "done")
    return (
      <>
        <KeySwitchProgress
          progress={flow.progress}
          error={flow.error}
          running={flow.running}
          onRetry={flow.retry}
        />
        {flow.stage === "done" && (
          <SuccessOverlay
            label={RECOVERY_KEY_COPY.done}
            onDone={() => {
              back(ROUTES.settingsSecurity);
            }}
          />
        )}
      </>
    );

  return (
    <SettingsLayout>
      <SettingsHeader
        title={RECOVERY_KEY_COPY.title}
        backTo={ROUTES.settingsSecurity}
        parent={SECURITY_COPY.title}
      />
      {flow.stage === "pin" ? (
        <>
          <HeadingBlock title={RECOVERY_KEY_COPY.pinTitle}>
            {RECOVERY_KEY_COPY.pinBody}
          </HeadingBlock>
          <PinCells
            value={flow.pin.value}
            invalid={flow.pinMessage !== null}
            shakeKey={flow.pin.shakeKey}
          />
          <FormErrorBanner message={flow.pinMessage} />
          <div className="mt-auto">
            <Keypad
              onDigit={flow.pin.digit}
              onBackspace={flow.pin.backspace}
              disabled={flow.checking}
            />
          </div>
        </>
      ) : (
        <>
          <Card className="items-center gap-3 p-5 text-center">
            <IconTile>
              <KeyRoundIcon />
            </IconTile>
            <h2 className="text-[1.0625rem] font-bold">{RECOVERY_KEY_COPY.cardTitle}</h2>
            <p className="text-[0.84375rem] leading-relaxed font-medium text-pretty text-muted-foreground">
              {RECOVERY_KEY_COPY.cardBody}
            </p>
          </Card>
          <WarningBlock>{RECOVERY_KEY_COPY.warning}</WarningBlock>
          <div className="mt-auto flex flex-col gap-3">
            <FormErrorBanner
              message={
                flow.blocked === "offline"
                  ? RECOVERY_KEY_COPY.offline
                  : flow.blocked === "ended"
                    ? RECOVERY_KEY_COPY.ended
                    : null
              }
            />
            <PrimaryCta disabled={flow.blocked !== null} onClick={flow.start}>
              {RECOVERY_KEY_COPY.cta}
            </PrimaryCta>
          </div>
        </>
      )}
    </SettingsLayout>
  );
}
