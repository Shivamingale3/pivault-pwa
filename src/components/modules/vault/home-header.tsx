import { Link } from "react-router";
import { UserAvatar } from "@/components/modules/kit/user-avatar";
import { HOME_COPY } from "@/constants/vault-design.constants";
import { ROUTES } from "@/routes/route-paths";

/** Hello, {name}, and the user's avatar, which opens Settings. */
export function HomeHeader({ firstName, name }: { firstName: string; name: string }) {
  return (
    <header className="flex animate-rise items-start justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-1.5">
        <h1 className="truncate text-display">{HOME_COPY.hello(firstName)}</h1>
      </div>
      <Link
        to={ROUTES.settings}
        aria-label="Settings"
        className="shrink-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <UserAvatar name={name} />
      </Link>
    </header>
  );
}
