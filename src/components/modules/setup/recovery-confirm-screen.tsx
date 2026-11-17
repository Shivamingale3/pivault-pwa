import { ChevronLeftIcon } from "lucide-react";
import { FormErrorBanner } from "@/components/modules/auth/form-error-banner";
import { PrimaryCta } from "@/components/modules/auth/primary-cta";
import { InfoNote } from "@/components/modules/kit/info-note";
import { HeadingBlock } from "@/components/modules/setup/heading-block";
import { SetupShell } from "@/components/modules/setup/setup-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RECOVERY_KEY_GROUP_SIZE } from "@/constants/crypto.constants";
import { SETUP_COPY } from "@/constants/setup.constants";
import type { useRecoveryConfirm } from "@/hooks/use-recovery-confirm";

const MASK = "X".repeat(RECOVERY_KEY_GROUP_SIZE);

interface GroupRowProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

/** A hidden neighbour group ("XXXXXXXX") and the group to type. */
function GroupRow({ id, label, value, onChange, disabled }: GroupRowProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="flex h-14.5 shrink-0 items-center rounded-lg bg-muted px-3.5 font-mono text-sm font-bold text-subtle"
        >
          {MASK}
        </span>
        <Input
          id={id}
          value={value.toUpperCase()}
          onChange={(event) => {
            onChange(event.target.value);
          }}
          placeholder={SETUP_COPY.confirmPlaceholder}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          disabled={disabled}
          className="min-w-0 flex-1 font-mono text-sm font-bold tracking-widest uppercase"
        />
      </div>
    </div>
  );
}

/** Prove you saved it: type groups 2 and 4 back. */
interface RecoveryConfirmScreenProps {
  confirm: ReturnType<typeof useRecoveryConfirm>;
  /** The action's wording (Settings uses its own instead of "Finish setup"). */
  finishLabel?: string;
}

export function RecoveryConfirmScreen({
  confirm,
  finishLabel = SETUP_COPY.confirmFinish,
}: RecoveryConfirmScreenProps) {
  return (
    <SetupShell>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Back"
        className="-ml-1 w-fit bg-muted"
        onClick={confirm.showAgain}
      >
        <ChevronLeftIcon />
      </Button>
      <HeadingBlock title={SETUP_COPY.confirmTitle}>{SETUP_COPY.confirmBody}</HeadingBlock>
      <GroupRow
        id="group-2"
        label="Group 2"
        value={confirm.second}
        onChange={confirm.setSecond}
        disabled={confirm.pending}
      />
      <GroupRow
        id="group-4"
        label="Group 4"
        value={confirm.fourth}
        onChange={confirm.setFourth}
        disabled={confirm.pending}
      />
      <InfoNote>{SETUP_COPY.confirmNote}</InfoNote>
      <FormErrorBanner message={confirm.error} />
      <div className="mt-auto flex flex-col gap-2">
        <PrimaryCta
          disabled={!confirm.valid}
          busy={confirm.pending}
          busyLabel={SETUP_COPY.confirmBusy}
          onClick={() => void confirm.finish()}
        >
          {finishLabel}
        </PrimaryCta>
        <Button type="button" variant="ghost" size="sm" onClick={confirm.showAgain}>
          {SETUP_COPY.confirmShowAgain}
        </Button>
      </div>
    </SetupShell>
  );
}
