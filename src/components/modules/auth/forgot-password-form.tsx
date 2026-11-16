import type { SubmitEvent } from "react";
import { EmailField } from "@/components/modules/auth/email-field";
import { FormErrorBanner } from "@/components/modules/auth/form-error-banner";
import { PrimaryCta } from "@/components/modules/auth/primary-cta";
import { FORGOT_COPY } from "@/constants/forgot.constants";

interface ForgotPasswordFormProps {
  email: string;
  onEmailChange: (value: string) => void;
  valid: boolean;
  pending: boolean;
  error: string | null;
  onSubmit: () => void;
}

/** One field, the action, and the reassurance pinned at the bottom. */
export function ForgotPasswordForm({
  email,
  onEmailChange,
  valid,
  pending,
  error,
  onSubmit,
}: ForgotPasswordFormProps) {
  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-1 flex-col gap-4">
      <EmailField
        id="email"
        label={FORGOT_COPY.field}
        value={email}
        onChange={onEmailChange}
        valid={valid}
        disabled={pending}
        autoFocus
      />
      <FormErrorBanner message={error} />
      <div className="mt-auto flex flex-col gap-4">
        <PrimaryCta type="submit" disabled={!valid} busy={pending} busyLabel={FORGOT_COPY.busy}>
          {FORGOT_COPY.submit}
        </PrimaryCta>
        <p className="text-center text-xs font-medium text-pretty text-muted-foreground">
          {FORGOT_COPY.reassurance}
        </p>
      </div>
    </form>
  );
}
