import { LockIcon, SettingsIcon } from "lucide-react";
import { Link } from "react-router";
import { SyncPill } from "@/components/modules/sync/sync-pill";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/routes/route-paths";

interface VaultHeaderProps {
  email: string | null;
  onLock: () => void;
}

/** Title, who is signed in, the sync pill, and Settings / Lock. Sign out lives in Settings. */
export function VaultHeader({ email, onLock }: VaultHeaderProps) {
  return (
    <header className="flex animate-rise items-start justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-1.5">
        <h1 className="text-display">Vault</h1>
        {email && <p className="truncate text-sm font-medium text-muted-foreground">{email}</p>}
        <SyncPill />
      </div>
      <div className="flex gap-1">
        <Link
          to={ROUTES.settings}
          aria-label="Settings"
          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
        >
          <SettingsIcon />
        </Link>
        <Button variant="ghost" size="icon-sm" aria-label="Lock" onClick={onLock}>
          <LockIcon />
        </Button>
      </div>
    </header>
  );
}
