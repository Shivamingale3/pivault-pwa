import type { SubmitEvent } from "react";
import { Link } from "react-router";
import { EmailField } from "@/components/modules/auth/email-field";
import { FormErrorBanner } from "@/components/modules/auth/form-error-banner";
import { PrimaryCta } from "@/components/modules/auth/primary-cta";
import { PasswordField } from "@/components/modules/password-link/password-field";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/routes/route-paths";

interface LoginFormProps {
  email: string;
  onEmailChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  valid: boolean;
  pending: boolean;
  error: string | null;
  onSubmit: () => void;
}

/** Email + password, the sign in action pinned to the bottom, and the way to a reset. */
export function LoginForm({
  email,
  onEmailChange,
  password,
  onPasswordChange,
  valid,
  pending,
  error,
  onSubmit,
}: LoginFormProps) {
  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-1 flex-col gap-4">
      <EmailField id="email" value={email} onChange={onEmailChange} disabled={pending} autoFocus />
      <PasswordField
        id="password"
        label="Password"
        placeholder="Your password"
        value={password}
        onChange={onPasswordChange}
        disabled={pending}
        autoComplete="current-password"
      />
      <FormErrorBanner message={error} />
      <div className="mt-auto flex flex-col gap-3">
        <PrimaryCta type="submit" disabled={!valid} busy={pending} busyLabel="Signing in">
          Sign in
        </PrimaryCta>
        <Link
          to={ROUTES.forgotPassword}
          className={cn(buttonVariants({ variant: "link" }), "self-center")}
        >
          Forgot password?
        </Link>
      </div>
    </form>
  );
}
