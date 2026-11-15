import { useState } from "react";
import { KeyValueCard } from "@/components/modules/settings/key-value-card";
import { SettingsHeader } from "@/components/modules/settings/settings-header";
import { SettingsLayout } from "@/components/modules/settings/settings-layout";
import { SyncStatusCard } from "@/components/modules/settings/sync-status-card";
import { SETTINGS_COPY, SYNC_COPY, countLabel } from "@/constants/settings.constants";
import { EntryKind } from "@/enums/vault.enum";
import { useSync } from "@/hooks/use-sync";
import { useVault } from "@/hooks/use-vault";
import { ROUTES } from "@/routes/route-paths";

/** Settings › Sync: when it last finished, what is in the vault, and what moved since sign in. */
export function SettingsSyncPage() {
  const { entries } = useVault();
  const { stats, syncNow } = useSync();
  const [busy, setBusy] = useState(false);

  const passwords = entries.filter((entry) => entry.kind === EntryKind.Password).length;
  const notes = entries.length - passwords;

  const handleSync = async () => {
    setBusy(true);
    try {
      await syncNow();
    } finally {
      setBusy(false);
    }
  };

  const moved = (key: "created" | "updated" | "deleted") =>
    `${String(stats.sent[key])} up · ${String(stats.received[key])} down`;

  return (
    <SettingsLayout>
      <SettingsHeader
        title={SETTINGS_COPY.sync}
        parent={SETTINGS_COPY.title}
        backTo={ROUTES.settings}
      />
      <SyncStatusCard host={window.location.host} busy={busy} onSync={() => void handleSync()} />
      <KeyValueCard
        label={SYNC_COPY.whatSynced}
        rows={[
          { name: SYNC_COPY.passwords, value: countLabel(passwords, "item", "items") },
          { name: SYNC_COPY.notes, value: countLabel(notes, "note", "notes") },
        ]}
      />
      <KeyValueCard
        label={SYNC_COPY.sinceSignIn}
        rows={[
          { name: SYNC_COPY.created, value: moved("created") },
          { name: SYNC_COPY.updated, value: moved("updated") },
          { name: SYNC_COPY.deleted, value: moved("deleted") },
        ]}
      />
    </SettingsLayout>
  );
}
