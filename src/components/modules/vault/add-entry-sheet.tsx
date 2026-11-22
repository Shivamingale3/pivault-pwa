import { KeyRoundIcon, NotebookTextIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { HOME_COPY } from "@/constants/vault-design.constants";
import { ROUTES } from "@/routes/route-paths";

const CHOICES = [
  { label: HOME_COPY.addPassword, to: ROUTES.passwordNew, icon: KeyRoundIcon },
  { label: HOME_COPY.addNote, to: ROUTES.noteNew, icon: NotebookTextIcon },
] as const;

/** From the home screen's + button: add a password or a note. */
export function AddEntrySheet({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  return (
    <Drawer
      open
      showSwipeHandle
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{HOME_COPY.addTitle}</DrawerTitle>
          <DrawerDescription className="sr-only">Choose what to add</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          {CHOICES.map(({ label, to, icon: Icon }) => (
            <Button
              key={to}
              type="button"
              variant="outline"
              size="lg"
              className="justify-start gap-3 rounded-3xl border-border"
              onClick={() => {
                onClose();
                void navigate(to);
              }}
            >
              <Icon aria-hidden="true" className="size-4" />
              {label}
            </Button>
          ))}
          <Button type="button" variant="ghost" size="lg" className="rounded-3xl" onClick={onClose}>
            {HOME_COPY.cancel}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
