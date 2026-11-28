import { useState } from "react";
import { Fab } from "@/components/modules/kit/fab";
import { AddEntrySheet } from "@/components/modules/vault/add-entry-sheet";
import { NotesPanel, PasswordsPanel } from "@/components/modules/vault/home-panels";
import { HomeSwitch } from "@/components/modules/vault/home-switch";
import { HomeTopBar } from "@/components/modules/vault/home-top-bar";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { HOME_COPY } from "@/constants/vault-design.constants";
import { EntryKind } from "@/enums/vault.enum";
import { useHome } from "@/hooks/use-home";

const PANEL = "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-24 scrollbar-none";

/**
 * Home: search, the Notes / Passwords switch (Notes first), and every item of the picked kind.
 * The list scrolls inside the screen; + asks what to add.
 */
export function HomePage() {
  const home = useHome();
  const [adding, setAdding] = useState(false);

  return (
    <main className="flex h-full min-h-full w-full justify-center bg-canvas">
      <div className="relative flex min-h-0 w-full max-w-md flex-col gap-4 px-5.5 pt-[max(--spacing(9.5),env(safe-area-inset-top))]">
        <h1 className="sr-only">{HOME_COPY.title}</h1>
        <HomeTopBar name={home.name} />
        <Tabs
          value={home.show}
          onValueChange={(value: EntryKind) => {
            home.setShow(value);
          }}
          className="min-h-0 flex-1 gap-4"
        >
          <HomeSwitch notes={home.notes.total} passwords={home.passwords.total} />
          <TabsContent value={EntryKind.Note} className={PANEL}>
            <NotesPanel screen={home.notes} />
          </TabsContent>
          <TabsContent value={EntryKind.Password} className={PANEL}>
            <PasswordsPanel screen={home.passwords} />
          </TabsContent>
        </Tabs>
        <Fab
          label={HOME_COPY.add}
          onClick={() => {
            setAdding(true);
          }}
          className="absolute right-5.5 bottom-[max(--spacing(6),env(safe-area-inset-bottom))] mt-0"
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
