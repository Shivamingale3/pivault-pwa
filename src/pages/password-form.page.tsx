import { Navigate, useParams } from "react-router";
import { PasswordForm } from "@/components/modules/vault/password-form";
import { VaultLoading } from "@/components/modules/vault/vault-loading";
import { EntryKind } from "@/enums/vault.enum";
import { useEntryRoute } from "@/hooks/use-entry-route";
import { ROUTES } from "@/routes/route-paths";

/** A new password. */
export function PasswordNewPage() {
  return <PasswordForm entry={null} />;
}

/** Editing a saved password. The form starts from the saved version and keeps its own state after that. */
export function PasswordEditPage() {
  const { id } = useParams();
  const { entry, loading, missing } = useEntryRoute(EntryKind.Password);
  if (missing) return <Navigate to={ROUTES.passwords} replace />;
  if (loading || !entry) return <VaultLoading />;
  return <PasswordForm key={id} entry={entry} />;
}
