import { WifiOffIcon } from "lucide-react";
import { AuthScreenLayout } from "@/components/modules/auth/auth-screen-layout";
import { PrimaryCta } from "@/components/modules/auth/primary-cta";

interface LinkUnavailableProps {
  onRetry: () => void;
}

/** The link could not be checked (offline, timeout, server trouble). Nothing was changed. */
export function LinkUnavailable({ onRetry }: LinkUnavailableProps) {
  return (
    <AuthScreenLayout
      title="Can't reach PiVault"
      description="Your link is untouched. Check your connection and try again."
      icon={<WifiOffIcon />}
      footer={<PrimaryCta onClick={onRetry}>Try again</PrimaryCta>}
    />
  );
}
