import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { LOCK_COPY } from "@/constants/lock.constants";

interface ForgotPinSheetProps {
  onClose: () => void;
  onContinue: () => void;
}

/** Forgot PIN: a PIN can't be reset on its own, only by signing in again with the password. */
export function ForgotPinSheet({ onClose, onContinue }: ForgotPinSheetProps) {
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
          <DrawerTitle>{LOCK_COPY.forgotTitle}</DrawerTitle>
          <DrawerDescription>{LOCK_COPY.forgotBody}</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Button type="button" size="lg" onClick={onContinue}>
            {LOCK_COPY.signInWithPassword}
          </Button>
          <DrawerClose render={<Button type="button" size="lg" variant="ghost" />}>
            Cancel
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
