import { LoginBlocked } from "@/components/modules/auth/login-blocked";
import { LoginForm } from "@/components/modules/auth/login-form";
import { BrandHero } from "@/components/modules/brand/brand-hero";
import { SuccessOverlay } from "@/components/modules/kit/success-overlay";
import { LOGIN_COPY } from "@/constants/login.constants";
import { useLoginForm } from "@/hooks/use-login-form";

/** Sign in: the brand card, then the form, or the paused view while a lockout runs. */
export function LoginPage() {
  const form = useLoginForm();

  return (
    <main className="flex min-h-full w-full justify-center bg-background">
      <div className="flex w-full max-w-md flex-1 flex-col gap-6 pb-[max(--spacing(6.5),env(safe-area-inset-bottom))]">
        {form.lock ? null : (
          <div className="px-3.5 pt-[max(--spacing(3.5),env(safe-area-inset-top))]">
            <BrandHero eyebrow={LOGIN_COPY.eyebrow} />
          </div>
        )}
        <div
          className={
            form.lock
              ? "flex flex-1 flex-col px-6.5 pt-[max(--spacing(10),env(safe-area-inset-top))]"
              : "flex flex-1 flex-col gap-4 px-6.5"
          }
        >
          {form.lock ? (
            <LoginBlocked email={form.email} lock={form.lock} remainingMs={form.remainingMs} />
          ) : (
            <>
              <header className="flex animate-rise flex-col gap-2.5">
                <h2 className="text-display">{LOGIN_COPY.title}</h2>
                <p className="text-sm leading-relaxed font-medium text-pretty text-muted-foreground">
                  {LOGIN_COPY.body}
                </p>
              </header>
              <LoginForm form={form} />
            </>
          )}
        </div>
      </div>
      {form.signedIn && <SuccessOverlay label={LOGIN_COPY.signedIn} onDone={form.finish} />}
    </main>
  );
}
