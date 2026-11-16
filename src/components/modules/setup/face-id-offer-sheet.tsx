import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { SETUP_COPY } from "@/constants/setup.constants";

/** After the PIN matches: turn Face ID on, or not now. It can't be dismissed without an answer. */
export function FaceIdOfferSheet({ onAnswer }: { onAnswer: (withFace: boolean) => void }) {
  return (
    <Drawer open onOpenChange={() => undefined} showSwipeHandle>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{SETUP_COPY.faceOfferTitle}</DrawerTitle>
          <DrawerDescription>{SETUP_COPY.faceOfferBody}</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Button
            type="button"
            size="lg"
            onClick={() => {
              onAnswer(true);
            }}
          >
            {SETUP_COPY.faceOfferYes}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="ghost"
            onClick={() => {
              onAnswer(false);
            }}
          >
            {SETUP_COPY.faceOfferNo}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
