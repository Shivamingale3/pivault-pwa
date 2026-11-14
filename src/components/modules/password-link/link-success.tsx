import { CheckIcon } from "lucide-react";
import { Link } from "react-router";
import { AuthScreenLayout } from "@/components/modules/auth/auth-screen-layout";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Password saved and email verified. */
export function LinkSuccess() {
  return (
    <AuthScreenLayout
      title="Password saved"
      description="Your email is verified. Open PiVault to sign in and finish setting up."
      icon={<CheckIcon />}
      footer={
        <Link to="/" className={cn(buttonVariants({ size: "xl" }), "w-full shadow-float")}>
          Open PiVault
        </Link>
      }
    />
  );
}
