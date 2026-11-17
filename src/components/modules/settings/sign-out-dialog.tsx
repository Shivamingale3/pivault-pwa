import { LogOutIcon } from "lucide-react";
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

interface SignOutDialogProps {
  /** Changes that haven't reached the server would be lost: adds a line saying so. */
  mayLoseChanges: boolean;
  onClose: () => void;
}

/** What signing out removes from this phone, and what stays on the server. */
export function SignOutDialog({ mayLoseChanges, onClose }: SignOutDialogProps) {
  const { signOut } = useAuth();

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
          <DialogDescription>{SIGN_OUT_COPY.body}</DialogDescription>
        </DialogHeader>
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
