import { Link } from "react-router";
import { AppLogo } from "@/components/modules/brand/app-logo";
import { HOME_COPY } from "@/constants/vault-design.constants";
import { ROUTES } from "@/routes/route-paths";

/** "VAULT UNLOCKED", Hello, {name}, and the logo tile that opens Settings. */
export function HomeHeader({ firstName }: { firstName: string }) {
  return (
    <header className="flex animate-rise items-start justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-1.5">
        <p className="text-eyebrow">{HOME_COPY.eyebrow}</p>
        <h1 className="truncate text-display">{HOME_COPY.hello(firstName)}</h1>
      </div>
      <Link
        to={ROUTES.settings}
        aria-label="Settings"
        className="flex size-10.5 shrink-0 items-center justify-center rounded-[0.9375rem] outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <AppLogo className="size-10.5 rounded-[0.9375rem]" />
      </Link>
    </header>
  );
}
