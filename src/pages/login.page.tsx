import { AuthScreenLayout } from "@/components/modules/auth/auth-screen-layout";
import { LoginForm } from "@/components/modules/auth/login-form";
import { useLoginForm } from "@/hooks/use-login-form";

export function LoginPage() {
  const form = useLoginForm();

  return (
    <AuthScreenLayout title="Welcome back" description="Sign in to open your vault.">
      <LoginForm
        email={form.email}
        onEmailChange={form.setEmail}
        password={form.password}
        onPasswordChange={form.setPassword}
        valid={form.valid}
        pending={form.pending}
        error={form.error}
        onSubmit={() => void form.submit()}
      />
    </AuthScreenLayout>
  );
}
