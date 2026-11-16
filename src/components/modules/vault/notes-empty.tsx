import { NotebookTextIcon } from "lucide-react";
import { EmptyState } from "@/components/modules/kit/empty-state";
import { Button } from "@/components/ui/button";
import { LIST_COPY } from "@/constants/vault-design.constants";

/** e2: no notes yet. */
export function NotesEmpty({ onWrite }: { onWrite: () => void }) {
  return (
    <EmptyState
      icon={<NotebookTextIcon />}
      title={LIST_COPY.notesEmpty}
      actions={
        <Button type="button" size="lg" className="shadow-float" onClick={onWrite}>
          {LIST_COPY.writeNote}
        </Button>
      }
    >
      {LIST_COPY.notesEmptyBody}
    </EmptyState>
  );
}
