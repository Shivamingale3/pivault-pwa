import { Navigate } from "react-router";
import { ScreenHeader } from "@/components/modules/kit/screen-header";
import { StatusChip } from "@/components/modules/kit/status-chip";
import { DetailActions } from "@/components/modules/vault/detail-actions";
import { DetailOverlays } from "@/components/modules/vault/detail-overlays";
import { PasswordFields } from "@/components/modules/vault/password-fields";
import { RowAvatar } from "@/components/modules/vault/row-avatar";
import { VaultLoading } from "@/components/modules/vault/vault-loading";
import { CRUD_COPY } from "@/constants/vault-design.constants";
import { EntryKind } from "@/enums/vault.enum";
import { useEntryDetail } from "@/hooks/use-entry-detail";
import { useEntryRoute } from "@/hooks/use-entry-route";
import { ROUTES, entryPath } from "@/routes/route-paths";
import { domainOf, formatDay } from "@/utils/date-format.utils";
import { formatOpened } from "@/utils/time.utils";

/** One saved login: identity, field cards with copy, dates, and where it is saved. */
export function PasswordDetailPage() {
  const { entry, loading, missing } = useEntryRoute(EntryKind.Password);
  const detail = useEntryDetail(entry?.id, EntryKind.Password);
  if (missing) return <Navigate to={ROUTES.passwords} replace />;
  const domain = entry ? domainOf(entry.url) : "";

  return (
    <main className="flex flex-1 justify-center bg-background">
      <div className="flex w-full max-w-md flex-col gap-5 px-5.5 pt-[max(--spacing(9.5),env(safe-area-inset-top))] pb-[max(--spacing(6.5),env(safe-area-inset-bottom))]">
        <ScreenHeader backTo={ROUTES.passwords}>
          {entry && (
            <DetailActions editTo={entryPath.passwordEdit(entry.id)} onMore={detail.openActions} />
          )}
        </ScreenHeader>
        {loading || !entry ? (
          <VaultLoading />
        ) : (
          <>
            <div className="flex items-center gap-3.5">
              <RowAvatar title={entry.title} />
              <div className="flex min-w-0 flex-col gap-0.5">
                <h1 className="truncate text-[1.4375rem] font-extrabold tracking-tight">
                  {entry.title}
                </h1>
                {domain && (
                  <p className="truncate text-[0.78125rem] font-medium text-muted-foreground">
                    {domain}
                  </p>
                )}
              </div>
            </div>
            <PasswordFields entry={entry} />
            <dl className="flex gap-9 px-1">
              <div className="flex flex-col gap-1">
                <dt className="text-eyebrow">{CRUD_COPY.created}</dt>
                <dd className="text-[0.78125rem] font-semibold">{formatDay(entry.createdAt)}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-eyebrow">{CRUD_COPY.modified}</dt>
                <dd className="text-[0.78125rem] font-semibold">{formatOpened(entry.updatedAt)}</dd>
              </div>
            </dl>
            <div className="mt-auto">
              <StatusChip wide>{CRUD_COPY.savedOnPhone}</StatusChip>
            </div>
            <DetailOverlays entry={entry} detail={detail} listPath={ROUTES.passwords} />
          </>
        )}
      </div>
    </main>
  );
}
