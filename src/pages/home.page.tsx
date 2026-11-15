import { PrimaryCta } from "@/components/modules/auth/primary-cta";
import { EntryList } from "@/components/modules/vault/entry-list";
import { VaultEmpty } from "@/components/modules/vault/vault-empty";
import { VaultHeader } from "@/components/modules/vault/vault-header";
import { VaultLoading } from "@/components/modules/vault/vault-loading";
import { VaultOverlays } from "@/components/modules/vault/vault-overlays";
import { VaultScreenLayout } from "@/components/modules/vault/vault-screen-layout";
import { VaultToolbar } from "@/components/modules/vault/vault-toolbar";
import { useAuth } from "@/hooks/use-auth";
import { useSession } from "@/hooks/use-session";
import { useVault } from "@/hooks/use-vault";
import { useVaultFilter } from "@/hooks/use-vault-filter";
import { useVaultScreen } from "@/hooks/use-vault-screen";

/** The unlocked app: the user's passwords and notes. Composition only; logic is in the hooks. */
export function HomePage() {
  const { lock, signOut } = useAuth();
  const session = useSession();
  const vault = useVault();
  const filter = useVaultFilter(vault.entries);
  const screen = useVaultScreen();

  const renderList = () => {
    if (vault.status === "loading") return <VaultLoading />;
    if (filter.visible.length === 0) return <VaultEmpty filtering={filter.filtering} />;
    return <EntryList entries={filter.visible} onOpen={screen.show} />;
  };

  return (
    <VaultScreenLayout
      header={<VaultHeader email={session?.email ?? null} onLock={lock} onSignOut={signOut} />}
      toolbar={
        <VaultToolbar
          kind={filter.kind}
          onKindChange={filter.setKind}
          query={filter.query}
          onQueryChange={filter.setQuery}
        />
      }
      footer={
        <PrimaryCta disabled={vault.status !== "ready"} onClick={screen.create}>
          Add item
        </PrimaryCta>
      }
    >
      {renderList()}
      <VaultOverlays screen={screen} />
    </VaultScreenLayout>
  );
}
