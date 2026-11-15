import { CopyIcon } from "lucide-react";
import type { SubmitEvent } from "react";
import { FormErrorBanner } from "@/components/modules/auth/form-error-banner";
import { PrimaryCta } from "@/components/modules/auth/primary-cta";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SETUP_COPY } from "@/constants/setup.constants";
import type { useNewRecoveryKey } from "@/hooks/use-new-recovery-key";

interface RecoveryKeyCreateProps {
  state: ReturnType<typeof useNewRecoveryKey>;
}

/** Shows the new recovery key (8 groups of 8), a copy action and the "I saved it" confirmation. */
export function RecoveryKeyCreate({ state }: RecoveryKeyCreateProps) {
  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    void state.finish();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-1 flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label>Recovery key</Label>
        <ul
          aria-label="Recovery key"
          className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-3.5 font-mono text-sm font-semibold select-all"
        >
          {state.displayKey.split("-").map((group, index) => (
            <li key={index}>{group}</li>
          ))}
        </ul>
        <Button type="button" variant="outline" size="sm" onClick={() => void state.copy()}>
          <CopyIcon aria-hidden="true" />
          Copy key
        </Button>
      </div>
      <div className="flex items-center justify-between gap-4">
        <Label htmlFor="key-saved">{SETUP_COPY.keySavedLabel}</Label>
        <Switch
          id="key-saved"
          checked={state.saved}
          onCheckedChange={state.setSaved}
          disabled={state.pending}
        />
      </div>
      <FormErrorBanner message={state.error} />
      <div className="mt-auto">
        <PrimaryCta
          type="submit"
          disabled={!state.saved}
          busy={state.pending}
          busyLabel="Finishing"
        >
          Finish setup
        </PrimaryCta>
      </div>
    </form>
  );
}
