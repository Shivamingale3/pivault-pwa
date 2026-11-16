import { LockIcon } from "lucide-react";
import type { SubmitEvent } from "react";
import { Link } from "react-router";
import { EmailField } from "@/components/modules/auth/email-field";
import { FormErrorBanner } from "@/components/modules/auth/form-error-banner";
import { PrimaryCta } from "@/components/modules/auth/primary-cta";
import { PasswordField } from "@/components/modules/password-link/password-field";
import { buttonVariants } from "@/components/ui/button";
import { LOGIN_COPY } from "@/constants/login.constants";
import type { useLoginForm } from "@/hooks/use-login-form";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/routes/route-paths";

/** Email, password, the forgot link, the error slot and the pinned Sign in action. */
export function LoginForm({ form }: { form: ReturnType<typeof useLoginForm> }) {
  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    void form.submit();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-1 flex-col gap-4">
      <EmailField
        id="email"
        value={form.email}
        onChange={form.setEmail}
        onBlur={form.touchEmail}
        valid={form.emailValid}
        invalid={form.emailInvalid}
        disabled={form.pending}
      />
      <PasswordField
        id="password"
        label="Password"
        placeholder={LOGIN_COPY.passwordPlaceholder}
        value={form.password}
        onChange={form.setPassword}
        disabled={form.pending}
        autoComplete="current-password"
        icon={<LockIcon aria-hidden="true" />}
        capsLockHint
      />
      <Link
        to={ROUTES.forgotPassword}
        className={cn(
          buttonVariants({ variant: "link", size: "sm" }),
          "-mr-1 self-end text-[0.8125rem]",
        )}
      >
        {LOGIN_COPY.forgot}
      </Link>
      <div className="mt-auto flex flex-col gap-3">
        <FormErrorBanner message={form.error} />
        <PrimaryCta
          type="submit"
          disabled={!form.valid}
          busy={form.pending}
          busyLabel={LOGIN_COPY.busy}
        >
          {LOGIN_COPY.submit}
        </PrimaryCta>
      </div>
    </form>
  );
}
