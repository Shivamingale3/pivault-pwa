import { KeyRoundIcon, NotebookTextIcon } from "lucide-react";
import { useState } from "react";
import { Fab } from "@/components/modules/kit/fab";
import { AddEntrySheet } from "@/components/modules/vault/add-entry-sheet";
import { CategoryCard } from "@/components/modules/vault/category-card";
import { HomeHeader } from "@/components/modules/vault/home-header";
import { RecentsSection } from "@/components/modules/vault/recents-section";
import { SearchPill } from "@/components/modules/vault/search-pill";
import { HOME_COPY } from "@/constants/vault-design.constants";
import { countLabel } from "@/constants/settings.constants";
import { useDashboard } from "@/hooks/use-dashboard";
import { ROUTES } from "@/routes/route-paths";

/** Home: a greeting, search, the counts, what is on this phone, and recently opened items. */
export function HomePage() {
  const dashboard = useDashboard();
  const [adding, setAdding] = useState(false);

  return (
    <main className="flex min-h-full w-full justify-center bg-canvas">
      <div className="flex w-full max-w-md flex-col gap-5 px-5.5 pt-[max(--spacing(9.5),env(safe-area-inset-top))] pb-6">
        <HomeHeader firstName={dashboard.firstName} name={dashboard.name} />
        <SearchPill />
        <div className="grid grid-cols-2 gap-2.5">
          <CategoryCard
            to={ROUTES.passwords}
            icon={<KeyRoundIcon />}
            title={HOME_COPY.passwords}
            count={countLabel(dashboard.passwords, "item", "items")}
          />
          <CategoryCard
            to={ROUTES.notes}
            icon={<NotebookTextIcon />}
            title={HOME_COPY.notes}
            count={countLabel(dashboard.notes, "note", "notes")}
          />
        </div>
        <RecentsSection
          items={dashboard.recents}
          onOpen={dashboard.openRecent}
          onClear={dashboard.clearRecents}
        />
        <Fab
          label={HOME_COPY.add}
          onClick={() => {
            setAdding(true);
          }}
        />
      </div>
      {adding && (
        <AddEntrySheet
          onClose={() => {
            setAdding(false);
          }}
        />
      )}
    </main>
  );
}
