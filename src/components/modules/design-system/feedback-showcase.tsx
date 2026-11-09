import { CheckIcon, CloudOffIcon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShowcaseSection } from "@/components/modules/design-system/showcase-section";

const showCopiedToast = () => {
  toast.success("Password copied", { description: "Clipboard clears in 30 seconds." });
};

const showErrorToast = () => {
  toast.error("Sync failed", { description: "Nothing was overwritten. Try again when online." });
};

export function FeedbackShowcase() {
  return (
    <ShowcaseSection eyebrow="05 · Feedback" title="Status, cards and toasts">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>Default</Badge>
        <Badge variant="secondary">3 items</Badge>
        <Badge variant="outline">Note</Badge>
        <Badge variant="success">
          <CheckIcon />
          Synced
        </Badge>
        <Badge variant="destructive">
          <CloudOffIcon />
          Offline
        </Badge>
        <Badge variant="mono">New</Badge>
      </div>
      <Card>
        <CardHeader>
          <span className="text-eyebrow">Sync</span>
          <CardTitle>Everything is up to date</CardTitle>
          <CardDescription>
            12 created · 4 updated · 1 deleted since your last sign-in.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2.5">
          <Skeleton className="h-16.5" />
          <Skeleton className="h-16.5" />
        </CardContent>
      </Card>
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={showCopiedToast}>
          Show success toast
        </Button>
        <Button variant="destructive-soft" onClick={showErrorToast}>
          Show error toast
        </Button>
      </div>
    </ShowcaseSection>
  );
}
