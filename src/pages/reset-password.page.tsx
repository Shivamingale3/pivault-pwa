import { AuthScreenLayout } from "@/components/modules/auth/auth-screen-layout";
import { LinkChecking } from "@/components/modules/password-link/link-checking";
import { LinkInvalid } from "@/components/modules/password-link/link-invalid";
import { LinkSuccess } from "@/components/modules/password-link/link-success";
import { LinkUnavailable } from "@/components/modules/password-link/link-unavailable";
import { SetPasswordForm } from "@/components/modules/password-link/set-password-form";
import { LINK_COPY } from "@/constants/password-link.constants";
import { LinkPhase } from "@/enums/password-link.enum";
import { useLinkToken } from "@/hooks/use-link-token";
import { usePasswordLink } from "@/hooks/use-password-link";

/**
 * `/reset-password?key=...`: opened from the emailed link in a plain browser (no install needed).
 * Sets the password and verifies the email in one step. Composition only; logic is in the hooks.
 */
export function ResetPasswordPage() {
  const token = useLinkToken();
  const link = usePasswordLink(token);

  switch (link.phase) {
    case LinkPhase.Checking:
      return <LinkChecking />;
    case LinkPhase.Invalid:
      return <LinkInvalid />;
    case LinkPhase.Unavailable:
      return <LinkUnavailable onRetry={link.retry} />;
    case LinkPhase.Success:
      return <LinkSuccess />;
    case LinkPhase.Ready:
    case LinkPhase.Submitting:
      return (
        <AuthScreenLayout
          title="Set a new password"
          description={link.purpose === "reset" ? LINK_COPY.reset : LINK_COPY.onboarding}
        >
          <SetPasswordForm
            submitting={link.phase === LinkPhase.Submitting}
            error={link.submitError}
            onSubmit={(password) => void link.submit(password)}
          />
        </AuthScreenLayout>
      );
  }
}
