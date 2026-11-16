import { Link } from "react-router";
import { AuthScreenLayout } from "@/components/modules/auth/auth-screen-layout";
import { ForgotPasswordForm } from "@/components/modules/auth/forgot-password-form";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RESET_LINK_MINUTES } from "@/constants/auth.constants";
import { FORGOT_COPY } from "@/constants/forgot.constants";
import { useForgotPasswordForm } from "@/hooks/use-forgot-password-form";
import { ROUTES } from "@/routes/route-paths";

export function ForgotPasswordPage() {
  const form = useForgotPasswordForm();

  if (form.sentTo) {
    return (
      <AuthScreenLayout
        title="Check your email"
        description={`We sent a reset link to ${form.sentTo}. It works for ${String(RESET_LINK_MINUTES)} minutes.`}
        footer={
          <Link to={ROUTES.login} className={cn(buttonVariants({ size: "xl" }), "w-full")}>
            Back to login
          </Link>
        }
      />
    );
  }

  return (
    <AuthScreenLayout
      title={FORGOT_COPY.title}
      description={FORGOT_COPY.body}
      backTo={ROUTES.login}
    >
      <ForgotPasswordForm
        email={form.email}
        onEmailChange={form.setEmail}
        valid={form.valid}
        pending={form.pending}
        error={form.error}
        onSubmit={() => void form.submit()}
      />
    </AuthScreenLayout>
  );
}
