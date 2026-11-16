import { HouseIcon, KeyRoundIcon, NotebookTextIcon } from "lucide-react";
import { NavLink } from "react-router";
import { ROUTES } from "@/routes/route-paths";
import { cn } from "@/lib/utils";

const TABS = [
  { to: ROUTES.home, label: "Home", icon: HouseIcon, end: true },
  { to: ROUTES.passwords, label: "Passwords", icon: KeyRoundIcon, end: false },
  { to: ROUTES.notes, label: "Notes", icon: NotebookTextIcon, end: false },
] as const;

/** The bottom tab bar: Home, Passwords, Notes. Active is ink and bold, idle is subtle. */
export function TabBar() {
  return (
    <nav
      aria-label="Main"
      className="sticky bottom-0 z-10 flex border-t-[1.5px] border-border bg-background px-2 pt-2.5 pb-[max(--spacing(2.5),env(safe-area-inset-bottom))]"
    >
      {TABS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              "flex min-h-11 flex-1 flex-col items-center justify-center gap-1 rounded-md text-[0.625rem] outline-none focus-visible:bg-muted [&_svg]:size-5.25",
              isActive ? "font-bold text-foreground" : "font-semibold text-subtle",
            )
          }
        >
          <Icon aria-hidden="true" strokeWidth={1.9} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
