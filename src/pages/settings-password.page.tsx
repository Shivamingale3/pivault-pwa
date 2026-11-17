import type { SubmitEvent } from "react";
import { FormErrorBanner } from "@/components/modules/auth/form-error-banner";
import { PrimaryCta } from "@/components/modules/auth/primary-cta";
import { PasswordField } from "@/components/modules/password-link/password-field";
import { PasswordRules } from "@/components/modules/password-link/password-rules";
import { SettingsHeader } from "@/components/modules/settings/settings-header";
import { SettingsLayout } from "@/components/modules/settings/settings-layout";
import { PASSWORD_RULE_LABELS, PasswordRuleId } from "@/constants/password.constants";
import { CHANGE_PASSWORD_COPY, SETTINGS_COPY } from "@/constants/settings.constants";
import { useChangePassword } from "@/hooks/use-change-password";
import { ROUTES } from "@/routes/route-paths";

/** Settings › Change password: current, new and confirm, the live rules, and the save action. */
export function SettingsPasswordPage() {
  const flow = useChangePassword();
  const { form } = flow;
  const onSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    void flow.submit();
  };

  return (
    <SettingsLayout>
      <SettingsHeader
        title={CHANGE_PASSWORD_COPY.title}
        backTo={ROUTES.settings}
        parent={SETTINGS_COPY.title}
      />
      <p className="text-[0.84375rem] leading-relaxed font-medium text-pretty text-muted-foreground">
        {CHANGE_PASSWORD_COPY.intro}
      </p>
      <form onSubmit={onSubmit} noValidate className="flex flex-1 flex-col gap-4">
        <PasswordField
          id="current-password"
          label={CHANGE_PASSWORD_COPY.current}
          placeholder="••••••••"
          autoComplete="current-password"
          value={flow.current}
          onChange={flow.setCurrent}
          disabled={flow.pending}
          autoFocus
        />
        <PasswordField
          id="new-password"
          label={CHANGE_PASSWORD_COPY.next}
          placeholder={PASSWORD_RULE_LABELS[PasswordRuleId.Length]}
          value={form.password}
          onChange={form.setPassword}
          disabled={flow.pending}
        />
        <PasswordField
          id="confirm-password"
          label={CHANGE_PASSWORD_COPY.confirm}
          placeholder={CHANGE_PASSWORD_COPY.confirmPlaceholder}
          value={form.confirm}
          onChange={form.setConfirm}
          disabled={flow.pending}
          match={form.confirmMatch}
        />
        <PasswordRules rules={form.rules} />
        <FormErrorBanner message={flow.error} />
        <div className="mt-auto flex flex-col gap-3">
          <PrimaryCta
            type="submit"
            disabled={!flow.valid}
            busy={flow.pending}
            busyLabel={CHANGE_PASSWORD_COPY.busy}
          >
            {CHANGE_PASSWORD_COPY.cta}
          </PrimaryCta>
        </div>
      </form>
    </SettingsLayout>
  );
}
