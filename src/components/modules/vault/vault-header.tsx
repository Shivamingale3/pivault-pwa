import { LockIcon, LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VaultHeaderProps {
  email: string | null;
  onLock: () => void;
  onSignOut: () => void;
}

export function VaultHeader({ email, onLock, onSignOut }: VaultHeaderProps) {
  return (
    <header className="flex animate-rise items-start justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-display">Vault</h1>
        {email && <p className="truncate text-sm font-medium text-muted-foreground">{email}</p>}
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon-sm" aria-label="Lock" onClick={onLock}>
          <LockIcon />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Sign out" onClick={onSignOut}>
          <LogOutIcon />
        </Button>
      </div>
    </header>
  );
}
