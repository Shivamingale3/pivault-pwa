import { EyeIcon, EyeOffIcon } from "lucide-react";
import { CopyButton } from "@/components/modules/vault/copy-button";
import { DetailField } from "@/components/modules/vault/detail-field";
import { Button } from "@/components/ui/button";
import { useToggle } from "@/hooks/use-toggle";
import type { PasswordEntry } from "@/types/vault.types";
import { safeHttpUrl } from "@/utils/url.utils";

const MASK = "••••••••••";

/** Username, password (hidden until asked for), site and notes of a saved login. */
export function PasswordDetail({ entry }: { entry: PasswordEntry }) {
  const [revealed, toggle] = useToggle();
  const link = safeHttpUrl(entry.url);

  return (
    <>
      {entry.username && (
        <DetailField
          label="Username"
          actions={<CopyButton value={entry.username} label="Username" />}
        >
          {entry.username}
        </DetailField>
      )}
      <DetailField
        label="Password"
        actions={
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={revealed ? "Hide password" : "Show password"}
              aria-pressed={revealed}
              onClick={toggle}
            >
              {revealed ? <EyeOffIcon /> : <EyeIcon />}
            </Button>
            <CopyButton value={entry.password} label="Password" />
          </>
        }
      >
        <span className="font-mono">{revealed ? entry.password : MASK}</span>
      </DetailField>
      {entry.url && (
        <DetailField label="Website" actions={<CopyButton value={entry.url} label="Website" />}>
          {link ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-3"
            >
              {entry.url}
            </a>
          ) : (
            entry.url
          )}
        </DetailField>
      )}
      {entry.notes && <DetailField label="Notes">{entry.notes}</DetailField>}
    </>
  );
}
