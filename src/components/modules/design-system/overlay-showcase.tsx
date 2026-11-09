import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ShowcaseSection } from "@/components/modules/design-system/showcase-section";

export function OverlayShowcase() {
  return (
    <ShowcaseSection eyebrow="06 · Overlays" title="Sheets when the user must choose">
      <div className="flex flex-wrap gap-3">
        <Drawer showSwipeHandle>
          <DrawerTrigger render={<Button variant="outline" />}>Open sheet</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Your session ran out</DrawerTitle>
              <DrawerDescription>
                Sign in again to sync. Your vault stays on this device and nothing unsynced is lost
                until you sign in elsewhere.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <Button size="lg">Sign in again</Button>
              <DrawerClose render={<Button size="lg" variant="ghost" />}>Not now</DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
        <Dialog>
          <DialogTrigger render={<Button variant="outline" />}>Open dialog</DialogTrigger>
          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>Delete this note?</DialogTitle>
              <DialogDescription>
                This is permanent. There is no trash and no undo.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="destructive" />}>Delete note</DialogClose>
              <DialogClose render={<Button variant="ghost" />}>Keep it</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ShowcaseSection>
  );
}
