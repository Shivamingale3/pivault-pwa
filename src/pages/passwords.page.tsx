import { ListFilterIcon, SearchIcon } from "lucide-react";
import { Link } from "react-router";
import { OfflinePill } from "@/components/modules/sync/offline-pill";
import { Fab } from "@/components/modules/kit/fab";
import { FilterField } from "@/components/modules/kit/filter-field";
import { ListHeader } from "@/components/modules/vault/list-header";
import { PasswordCardRow } from "@/components/modules/vault/password-card-row";
import { PasswordRow } from "@/components/modules/vault/password-row";
import { PasswordsEmpty } from "@/components/modules/vault/passwords-empty";
import { SortTabs } from "@/components/modules/vault/sort-tabs";
import { VaultLoading } from "@/components/modules/vault/vault-loading";
import { VaultEmpty } from "@/components/modules/vault/vault-empty";
import { Button, buttonVariants } from "@/components/ui/button";
import { LIST_COPY } from "@/constants/vault-design.constants";
import { usePasswordsScreen } from "@/hooks/use-passwords-screen";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/routes/route-paths";

/** Passwords: most recent first, filterable, reveal and copy per row; Sort switches to Recent / A-Z / Weak. */
export function PasswordsPage() {
  const screen = usePasswordsScreen();

  const body = () => {
    if (screen.status === "loading") return <VaultLoading />;
    if (screen.total === 0)
      return <PasswordsEmpty onAdd={screen.add} onRestore={() => void screen.restore()} />;
    if (screen.visible.length === 0) {
      const weak = screen.sorting && screen.tab === "weak" && !screen.filtering;
      return (
        <VaultEmpty
          filtering={!weak}
          title={weak ? LIST_COPY.noWeak : undefined}
          body={weak ? LIST_COPY.noWeakBody : undefined}
        />
      );
    }
    return (
      <ul
        aria-label="Passwords"
        className={screen.sorting ? "flex flex-col gap-2.5" : "flex flex-col"}
      >
        {screen.visible.map((entry) =>
          screen.sorting ? (
            <PasswordCardRow
              key={entry.id}
              entry={entry}
              lastUsedAt={screen.lastUsedAt(entry)}
              onOpen={screen.open}
            />
          ) : (
            <PasswordRow
              key={entry.id}
              entry={entry}
              revealed={screen.isRevealed(entry.id)}
              onOpen={screen.open}
              onToggleReveal={screen.toggleReveal}
              onCopy={(picked) => void screen.copyPassword(picked)}
            />
          ),
        )}
      </ul>
    );
  };

  return (
    <main
      className={cn("flex flex-1 justify-center", screen.sorting ? "bg-canvas" : "bg-background")}
    >
      <div className="flex w-full max-w-md flex-col gap-4 px-5.5 pt-[max(--spacing(9.5),env(safe-area-inset-top))] pb-6">
        <ListHeader
          title={LIST_COPY.passwordsTitle}
          meta={(screen.sorting ? LIST_COPY.passwordsSortMeta : LIST_COPY.passwordsMeta)(
            screen.total,
          )}
          action={
            screen.sorting ? (
              <Link
                to={ROUTES.search}
                aria-label="Search"
                className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }), "bg-card")}
              >
                <SearchIcon />
              </Link>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={screen.openSort}
              >
                <ListFilterIcon aria-hidden="true" />
                {LIST_COPY.sort}
              </Button>
            )
          }
        />
        <OfflinePill />
        {screen.sorting ? (
          <SortTabs value={screen.tab} onChange={screen.setTab} />
        ) : (
          <FilterField
            value={screen.query}
            onChange={screen.setQuery}
            placeholder={LIST_COPY.filter}
            label="Filter passwords"
          />
        )}
        <div className="flex flex-1 flex-col">{body()}</div>
        {screen.status === "ready" && screen.total > 0 && (
          <Fab label={LIST_COPY.addPassword} onClick={screen.add} />
        )}
      </div>
    </main>
  );
}
