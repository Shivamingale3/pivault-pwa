import { PrimaryCta } from "@/components/modules/auth/primary-cta";
import { WarningBlock } from "@/components/modules/kit/info-note";
import { RecoveryKeyPanel } from "@/components/modules/kit/recovery-key-panel";
import { HeadingBlock } from "@/components/modules/setup/heading-block";
import { SetupShell } from "@/components/modules/setup/setup-shell";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SETUP_COPY } from "@/constants/setup.constants";
import type { useRecoveryReveal } from "@/hooks/use-recovery-reveal";

/** The new recovery key, shown once, with Copy and Download and the "I've saved it" gate. */
export function RecoveryRevealScreen({ reveal }: { reveal: ReturnType<typeof useRecoveryReveal> }) {
  return (
    <SetupShell>
      <HeadingBlock eyebrow={SETUP_COPY.revealEyebrow} title={SETUP_COPY.revealTitle}>
        {SETUP_COPY.revealBody}
      </HeadingBlock>
      <RecoveryKeyPanel
        displayKey={reveal.displayKey}
        onCopy={() => void reveal.copy()}
        onDownload={reveal.download}
      />
      <WarningBlock>{SETUP_COPY.revealWarning}</WarningBlock>
      <div className="mt-auto flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Checkbox id="key-saved" checked={reveal.saved} onCheckedChange={reveal.setSaved} />
          <Label htmlFor="key-saved" className="text-[0.8125rem] font-semibold">
            {SETUP_COPY.revealSaved}
          </Label>
        </div>
        <PrimaryCta disabled={!reveal.saved} onClick={reveal.next}>
          {SETUP_COPY.revealContinue}
        </PrimaryCta>
      </div>
    </SetupShell>
  );
}
