import { LockIcon } from "lucide-react";
import { Link } from "react-router";
import { CountdownCard } from "@/components/modules/kit/countdown-card";
import { IconTile } from "@/components/modules/kit/icon-tile";
import { PrimaryCta } from "@/components/modules/auth/primary-cta";
import { PasswordField } from "@/components/modules/password-link/password-field";
import { EmailField } from "@/components/modules/auth/email-field";
import { buttonVariants } from "@/components/ui/button";
import { LOGIN_COPY, lockCaption } from "@/constants/login.constants";
import type { LoginLock } from "@/schemas/lockout.schema";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/routes/route-paths";
import { formatWait } from "@/utils/wait.utils";

interface LoginBlockedProps {
  email: string;
  lock: LoginLock;
  remainingMs: number;
}

/** Sign-in paused: the live wait, the form shown but disabled, and the way out through a reset. */
export function LoginBlocked({ email, lock, remainingMs }: LoginBlockedProps) {
  return (
    <div className="flex flex-1 flex-col gap-5">
      <header className="flex animate-rise flex-col gap-2.5">
        <IconTile className="mb-2">
          <LockIcon />
        </IconTile>
        <h1 className="text-display">{LOGIN_COPY.blockedTitle}</h1>
        <p className="text-sm leading-relaxed font-medium text-pretty text-muted-foreground">
          {LOGIN_COPY.blockedBody}
        </p>
      </header>
      <CountdownCard
        label={LOGIN_COPY.tryAgainIn}
        remainingMs={remainingMs}
        caption={lockCaption(lock.attempt, lock.attemptsPerRound, formatWait(lock.nextWaitSeconds))}
      />
      <div className="flex flex-col gap-4">
        <EmailField id="email" value={email} onChange={() => undefined} disabled />
        <PasswordField
          id="password"
          label="Password"
          placeholder={LOGIN_COPY.passwordPlaceholder}
          value=""
          onChange={() => undefined}
          disabled
          icon={<LockIcon aria-hidden="true" />}
        />
        <PrimaryCta type="submit" disabled>
          {LOGIN_COPY.submit}
        </PrimaryCta>
      </div>
      <Link
        to={ROUTES.forgotPassword}
        className={cn(
          buttonVariants({ variant: "link", size: "sm" }),
          "mt-auto self-center text-[0.8125rem]",
        )}
      >
        {LOGIN_COPY.resetInstead}
      </Link>
    </div>
  );
}
