import { LinkIcon } from "lucide-react";
import { Link } from "react-router";
import { AuthScreenLayout } from "@/components/modules/auth/auth-screen-layout";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Unknown, expired, already-used or malformed link. Deliberately says nothing more specific. */
export function LinkInvalid() {
  return (
    <AuthScreenLayout
      title="This link is invalid or has expired"
      description="A link works once and expires after a while. Ask for a new one to continue."
      icon={<LinkIcon />}
      footer={
        <Link to="/" className={cn(buttonVariants({ size: "xl", variant: "outline" }), "w-full")}>
          Back to PiVault
        </Link>
      }
    />
  );
}
