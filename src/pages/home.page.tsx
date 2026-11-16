import { KeyRoundIcon, NotebookTextIcon } from "lucide-react";
import { CategoryCard } from "@/components/modules/vault/category-card";
import { HomeHeader } from "@/components/modules/vault/home-header";
import { RecentsSection } from "@/components/modules/vault/recents-section";
import { SearchPill } from "@/components/modules/vault/search-pill";
import { StorageCard } from "@/components/modules/vault/storage-card";
import { HOME_COPY } from "@/constants/vault-design.constants";
import { countLabel } from "@/constants/settings.constants";
import { useDashboard } from "@/hooks/use-dashboard";
import { ROUTES } from "@/routes/route-paths";

/** Home: a greeting, search, the counts, what is on this phone, and recently opened items. */
export function HomePage() {
  const dashboard = useDashboard();

  return (
    <main className="flex flex-1 justify-center bg-canvas">
      <div className="flex w-full max-w-md flex-col gap-5 px-5.5 pt-[max(--spacing(9.5),env(safe-area-inset-top))] pb-6">
        <HomeHeader firstName={dashboard.firstName} />
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
          <StorageCard estimate={dashboard.storage} />
        </div>
        <RecentsSection
          items={dashboard.recents}
          onOpen={dashboard.openRecent}
          onClear={dashboard.clearRecents}
        />
      </div>
    </main>
  );
}
