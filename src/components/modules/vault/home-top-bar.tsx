import { Link } from "react-router";
import { UserAvatar } from "@/components/modules/kit/user-avatar";
import { SearchPill } from "@/components/modules/vault/search-pill";
import { ROUTES } from "@/routes/route-paths";

/** The search pill, and the user's avatar, which opens Settings. */
export function HomeTopBar({ name }: { name: string }) {
  return (
    <header className="flex animate-rise items-center gap-2.5">
      <SearchPill />
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
