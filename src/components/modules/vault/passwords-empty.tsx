import { KeyRoundIcon } from "lucide-react";
import { EmptyState } from "@/components/modules/kit/empty-state";
import { Button } from "@/components/ui/button";
import { LIST_COPY } from "@/constants/vault-design.constants";

interface PasswordsEmptyProps {
  onAdd: () => void;
  onRestore: () => void;
}

/** e1: no passwords yet, with the two ways forward. */
export function PasswordsEmpty({ onAdd, onRestore }: PasswordsEmptyProps) {
  return (
    <EmptyState
      icon={<KeyRoundIcon />}
      title={LIST_COPY.passwordsEmpty}
      actions={
        <>
          <Button type="button" size="lg" className="shadow-float" onClick={onAdd}>
            {LIST_COPY.addPassword}
          </Button>
          <Button type="button" variant="link" size="sm" onClick={onRestore}>
            {LIST_COPY.restore}
          </Button>
        </>
      }
    >
      {LIST_COPY.passwordsEmptyBody}
    </EmptyState>
  );
}
