import { CheckIcon, LogOutIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SIGN_OUT_COPY } from "@/constants/settings.constants";
import { useAuth } from "@/hooks/use-auth";
import { useSync } from "@/hooks/use-sync";

interface SignOutDialogProps {
  host: string;
  onClose: () => void;
}

const ROW = "flex items-center gap-3 px-3.5 py-3 text-[0.8125rem] font-semibold [&_svg]:size-3";

/** What signing out removes from this phone, and what stays on the server. */
export function SignOutDialog({ host, onClose }: SignOutDialogProps) {
  const { signOut } = useAuth();
  const { status } = useSync();
  const mayLoseChanges = status !== "synced";

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <span
            aria-hidden="true"
            className="flex size-11 items-center justify-center rounded-lg bg-destructive-surface text-destructive [&_svg]:size-5"
          >
            <LogOutIcon />
          </span>
          <DialogTitle>{SIGN_OUT_COPY.title}</DialogTitle>
          <DialogDescription>{SIGN_OUT_COPY.body(host)}</DialogDescription>
        </DialogHeader>
        <ul className="divide-y divide-border rounded-lg bg-muted">
          <li className={ROW}>
            <XIcon aria-hidden="true" />
            {SIGN_OUT_COPY.tokenCleared}
          </li>
          <li className={ROW}>
            <XIcon aria-hidden="true" />
            {SIGN_OUT_COPY.pinRemoved}
          </li>
          <li className={ROW}>
            <CheckIcon aria-hidden="true" />
            {SIGN_OUT_COPY.vaultUntouched(host)}
          </li>
        </ul>
        <p className="rounded-md bg-destructive-surface px-3.5 py-3 text-xs font-semibold text-destructive-foreground">
          {SIGN_OUT_COPY.warning}
          {mayLoseChanges && ` ${SIGN_OUT_COPY.unsynced}`}
        </p>
        <DialogFooter className="flex-row">
          <DialogClose render={<Button variant="outline" size="lg" className="flex-1" />}>
            {SIGN_OUT_COPY.cancel}
          </DialogClose>
          <Button variant="destructive" size="lg" className="flex-1" onClick={signOut}>
            {SIGN_OUT_COPY.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
