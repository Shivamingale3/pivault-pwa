import type { SubmitEvent } from "react";
import { Link } from "react-router";
import { EmailField } from "@/components/modules/auth/email-field";
import { FormErrorBanner } from "@/components/modules/auth/form-error-banner";
import { PrimaryCta } from "@/components/modules/auth/primary-cta";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/routes/route-paths";

interface ForgotPasswordFormProps {
  email: string;
  onEmailChange: (value: string) => void;
  valid: boolean;
  pending: boolean;
  error: string | null;
  onSubmit: () => void;
}

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
      <EmailField id="email" value={email} onChange={onEmailChange} disabled={pending} autoFocus />
      <FormErrorBanner message={error} />
      <div className="mt-auto flex flex-col gap-3">
        <PrimaryCta type="submit" disabled={!valid} busy={pending} busyLabel="Sending">
          Send reset link
        </PrimaryCta>
        <Link to={ROUTES.login} className={cn(buttonVariants({ variant: "link" }), "self-center")}>
          Back to login
        </Link>
      </div>
    </form>
  );
}
