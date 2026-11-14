import type { SubmitEvent } from "react";
import { FormErrorBanner } from "@/components/modules/auth/form-error-banner";
import { PrimaryCta } from "@/components/modules/auth/primary-cta";
import { PasswordField } from "@/components/modules/password-link/password-field";
import { PasswordRules } from "@/components/modules/password-link/password-rules";
import { PASSWORD_RULE_LABELS, PasswordRuleId } from "@/constants/password.constants";
import { useSetPasswordForm } from "@/hooks/use-set-password-form";

interface SetPasswordFormProps {
  submitting: boolean;
  error: string | null;
  onSubmit: (password: string) => void;
}

/** New password + confirmation, live rule checklist, and the action pinned to the bottom. */
export function SetPasswordForm({ submitting, error, onSubmit }: SetPasswordFormProps) {
  const form = useSetPasswordForm();

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    if (form.valid && !submitting) onSubmit(form.password);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-1 flex-col gap-4">
      <PasswordField
        id="new-password"
        label="New password"
        placeholder={PASSWORD_RULE_LABELS[PasswordRuleId.Length]}
        value={form.password}
        onChange={form.setPassword}
        disabled={submitting}
        autoFocus
      />
      <PasswordField
        id="confirm-password"
        label="Confirm password"
        placeholder="Type it again"
        value={form.confirm}
        onChange={form.setConfirm}
        disabled={submitting}
        match={form.confirmMatch}
      />
      <PasswordRules rules={form.rules} />
      <FormErrorBanner message={error} />
      <div className="mt-auto">
        <PrimaryCta type="submit" disabled={!form.valid} busy={submitting} busyLabel="Saving">
          Save password
        </PrimaryCta>
      </div>
    </form>
  );
}
