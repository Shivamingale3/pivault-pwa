import { ClockIcon } from "lucide-react";
import { FilterField } from "@/components/modules/kit/filter-field";
import { RowAvatar } from "@/components/modules/vault/row-avatar";
import { Button } from "@/components/ui/button";
import { SEARCH_COPY } from "@/constants/vault-design.constants";
import { useSearch } from "@/hooks/use-search";
import type { VaultEntry } from "@/types/vault.types";

const Group = ({
  label,
  entries,
  onOpen,
}: {
  label: string;
  entries: VaultEntry[];
  onOpen: (entry: VaultEntry) => void;
}) =>
  entries.length === 0 ? null : (
    <section aria-label={label} className="flex flex-col gap-1">
      <h2 className="px-1 text-eyebrow">{label}</h2>
      <ul>
        {entries.map((entry) => (
          <li key={entry.id}>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                onOpen(entry);
              }}
              className="h-auto w-full justify-start gap-3 rounded-xl px-1 py-2.5 text-left"
            >
              <RowAvatar title={entry.title} />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-[0.9375rem] font-semibold">{entry.title}</span>
                {entry.kind === "password" && entry.username && (
                  <span className="truncate text-xs font-medium text-muted-foreground">
                    {entry.username}
                  </span>
                )}
              </span>
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );

/** Search: its own screen, no tab bar. Results are grouped by type; recent searches stay in memory. */
export function SearchPage() {
  const search = useSearch();

  return (
    <main className="flex min-h-full w-full justify-center bg-background">
      <div className="flex w-full max-w-md flex-col gap-5 px-5.5 pt-[max(--spacing(9.5),env(safe-area-inset-top))] pb-6">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <FilterField
              value={search.query}
              onChange={search.setQuery}
              placeholder={SEARCH_COPY.placeholder}
              label="Search"
              autoFocus
            />
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={search.done}>
            {SEARCH_COPY.done}
          </Button>
        </div>
        {search.searching ? (
          search.nothingFound ? (
            <div role="status" className="flex flex-col items-center gap-2 pt-10 text-center">
              <p className="text-base font-bold">{SEARCH_COPY.none}</p>
              <p className="max-w-64 text-sm font-medium text-pretty text-muted-foreground">
                {SEARCH_COPY.noneBody}
              </p>
            </div>
          ) : (
            <>
              <Group
                label={SEARCH_COPY.passwords}
                entries={search.results.passwords}
                onOpen={search.open}
              />
              <Group
                label={SEARCH_COPY.notes}
                entries={search.results.notes}
                onOpen={search.open}
              />
            </>
          )
        ) : (
          search.recent.length > 0 && (
            <section aria-label="Recent searches" className="flex flex-col gap-1">
              <h2 className="px-1 text-eyebrow">{SEARCH_COPY.recentSearches}</h2>
              <ul className="divide-y divide-border">
                {search.recent.map((term) => (
                  <li key={term}>
                    <button
                      type="button"
                      onClick={() => {
                        search.setQuery(term);
                      }}
                      className="flex min-h-12 w-full items-center gap-3 px-1 py-2 text-left outline-none focus-visible:bg-muted"
                    >
                      <ClockIcon aria-hidden="true" className="size-4 text-subtle" />
                      <span className="flex-1 truncate text-[0.9375rem] font-semibold">{term}</span>
                      <span className="text-[0.71875rem] font-medium text-muted-foreground">
                        all
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )
        )}
      </div>
    </main>
  );
}
