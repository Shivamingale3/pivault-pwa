import { KeyRoundIcon } from "lucide-react";
import type { SubmitEvent } from "react";
import { FormErrorBanner } from "@/components/modules/auth/form-error-banner";
import { PrimaryCta } from "@/components/modules/auth/primary-cta";
import { IconTile } from "@/components/modules/kit/icon-tile";
import { InfoNote } from "@/components/modules/kit/info-note";
import { RecoveryKeyInputs } from "@/components/modules/kit/recovery-key-inputs";
import { HeadingBlock } from "@/components/modules/setup/heading-block";
import { SetupShell } from "@/components/modules/setup/setup-shell";
import { SETUP_COPY } from "@/constants/setup.constants";
import type { useRecoverVault } from "@/hooks/use-recover-vault";

interface RecoverScreenProps {
  recover: ReturnType<typeof useRecoverVault>;
  email: string;
}

/** New phone: type or paste the recovery key. */
export function RecoverScreen({ recover, email }: RecoverScreenProps) {
  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    void recover.submit();
  };
  return (
    <SetupShell>
      <form onSubmit={handleSubmit} noValidate className="flex flex-1 flex-col gap-4">
        <IconTile>
          <KeyRoundIcon />
        </IconTile>
        <HeadingBlock title={SETUP_COPY.recoverTitle}>{SETUP_COPY.recoverBody(email)}</HeadingBlock>
        <RecoveryKeyInputs
          value={recover.value}
          onChange={recover.setValue}
          invalid={recover.error !== null}
          disabled={recover.pending}
          shakeKey={recover.shakeKey}
          onEnter={() => void recover.submit()}
        />
        <FormErrorBanner message={recover.error} />
        <PrimaryCta
          type="submit"
          disabled={!recover.complete}
          busy={recover.pending}
          busyLabel={SETUP_COPY.recoverBusy}
        >
          {SETUP_COPY.recoverSubmit}
        </PrimaryCta>
        <InfoNote className="mt-auto">{SETUP_COPY.recoverNote}</InfoNote>
      </form>
    </SetupShell>
  );
}
