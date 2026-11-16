import { LockIcon } from "lucide-react";
import { PrimaryCta } from "@/components/modules/auth/primary-cta";
import { AppLogo } from "@/components/modules/brand/app-logo";
import { ProgressRing } from "@/components/modules/kit/progress-ring";
import { type Stage, StageList } from "@/components/modules/kit/stage-list";
import { FormErrorBanner } from "@/components/modules/auth/form-error-banner";
import { SetupShell } from "@/components/modules/setup/setup-shell";
import { SETUP_COPY } from "@/constants/setup.constants";
import type { useRebuildVault } from "@/hooks/use-rebuild-vault";

/** Rebuilding your vault: the ring, the named stages with counts, and nothing to press. */
export function RecoveringScreen({ rebuild }: { rebuild: ReturnType<typeof useRebuildVault> }) {
  const { progress, status } = rebuild;
  const recordsValue =
    progress.total === 0 && status === "running"
      ? "waiting"
      : `${String(progress.pulled)} of ${String(Math.max(progress.total, progress.pulled))}`;
  const stages: Stage[] = [
    { label: SETUP_COPY.stageKey, state: "done", value: "" },
    {
      label: SETUP_COPY.stageRecords,
      state: status === "done" ? "done" : "active",
      value: recordsValue,
    },
    {
      label: SETUP_COPY.stageSaved,
      state: status === "done" ? "done" : "waiting",
      value: status === "done" ? "done" : "waiting",
    },
  ];

  return (
    <SetupShell center>
      <AppLogo className="size-13.5 rounded-2xl" />
      <p className="text-eyebrow">{SETUP_COPY.recoveringEyebrow}</p>
      <div className="mt-4 flex flex-col items-center gap-4 text-center">
        <ProgressRing percent={rebuild.percent} label="Rebuilding your vault" size={76}>
          <LockIcon aria-hidden="true" />
        </ProgressRing>
        <h1 className="text-[1.4375rem] font-extrabold tracking-tight">
          {SETUP_COPY.recoveringTitle}
        </h1>
        <p className="max-w-72 text-[0.84375rem] leading-relaxed font-medium text-pretty text-muted-foreground">
          {SETUP_COPY.recoveringBody}
        </p>
      </div>
      <div className="w-full">
        <StageList stages={stages} percent={rebuild.percent} />
      </div>
      {status === "failed" && (
        <div className="flex w-full flex-col gap-3">
          <FormErrorBanner message={rebuild.error ?? SETUP_COPY.recoveringFailed} />
          <PrimaryCta onClick={rebuild.retry}>{SETUP_COPY.retry}</PrimaryCta>
        </div>
      )}
      <p className="mt-auto text-center text-xs font-medium text-muted-foreground">
        {SETUP_COPY.recoveringFooter}
      </p>
    </SetupShell>
  );
}
