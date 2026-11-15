import type { SubmitEvent } from "react";
import { FormErrorBanner } from "@/components/modules/auth/form-error-banner";
import { PrimaryCta } from "@/components/modules/auth/primary-cta";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { useEnterRecoveryKey } from "@/hooks/use-enter-recovery-key";

interface RecoveryKeyEnterProps {
  state: ReturnType<typeof useEnterRecoveryKey>;
}

/** New device: type or paste the recovery key saved on first setup. */
export function RecoveryKeyEnter({ state }: RecoveryKeyEnterProps) {
  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    void state.submit();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-1 flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="recovery-key">Recovery key</Label>
        <Input
          id="recovery-key"
          name="recovery-key"
          type="password"
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="font-mono"
          placeholder="xxxxxxxx-xxxxxxxx-xxxxxxxx-…"
          value={state.value}
          disabled={state.pending}
          aria-invalid={state.error !== null}
          autoFocus
          onChange={(event) => {
            state.setValue(event.target.value);
          }}
        />
      </div>
      <FormErrorBanner message={state.error} />
      <div className="mt-auto">
        <PrimaryCta
          type="submit"
          disabled={!state.valid}
          busy={state.pending}
          busyLabel="Unlocking"
        >
          Unlock vault
        </PrimaryCta>
      </div>
    </form>
  );
}
