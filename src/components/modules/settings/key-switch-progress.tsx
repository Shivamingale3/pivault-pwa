import { FormErrorBanner } from "@/components/modules/auth/form-error-banner";
import { PrimaryCta } from "@/components/modules/auth/primary-cta";
import { type Stage, StageList } from "@/components/modules/kit/stage-list";
import { HeadingBlock } from "@/components/modules/setup/heading-block";
import { SetupShell } from "@/components/modules/setup/setup-shell";
import { RECOVERY_KEY_COPY } from "@/constants/settings.constants";
import type { RunStep } from "@/hooks/use-key-replacement-run";

const ORDER: RunStep[] = ["items", "upload", "switch"];
const LABELS: Record<RunStep, string> = {
  items: RECOVERY_KEY_COPY.stageItems,
  upload: RECOVERY_KEY_COPY.stageUpload,
  switch: RECOVERY_KEY_COPY.stageSwitch,
};

interface KeySwitchProgressProps {
  progress: { step: RunStep; done: number; total: number };
  error: string | null;
  running: boolean;
  onRetry: () => void;
}

/** The switch to the new key: named steps with a count, never a bare spinner, and a retry. */
export function KeySwitchProgress({ progress, error, running, onRetry }: KeySwitchProgressProps) {
  const at = ORDER.indexOf(progress.step);
  const stages: Stage[] = ORDER.map((step, index) => ({
    label: LABELS[step],
    state: index < at ? "done" : index === at ? "active" : "waiting",
    value:
      index < at
        ? "done"
        : index > at
          ? "waiting"
          : step === "items" && progress.total > 0
            ? `${String(progress.done)} of ${String(progress.total)}`
            : "…",
  }));
  return (
    <SetupShell>
      <HeadingBlock title={RECOVERY_KEY_COPY.workingTitle}>
        {RECOVERY_KEY_COPY.workingBody}
      </HeadingBlock>
      <StageList stages={stages} percent={((at + (error ? 0 : 0.5)) / ORDER.length) * 100} />
      <FormErrorBanner message={error} />
      {error && (
        <div className="mt-auto">
          <PrimaryCta busy={running} onClick={onRetry}>
            {RECOVERY_KEY_COPY.retry}
          </PrimaryCta>
        </div>
      )}
    </SetupShell>
  );
}
