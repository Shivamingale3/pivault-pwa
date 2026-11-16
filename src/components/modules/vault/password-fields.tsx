import { EyeIcon, EyeOffIcon } from "lucide-react";
import { CopyButton } from "@/components/modules/vault/copy-button";
import { FieldCard } from "@/components/modules/vault/field-card";
import { Button } from "@/components/ui/button";
import { CRUD_COPY } from "@/constants/vault-design.constants";
import { useToggle } from "@/hooks/use-toggle";
import type { PasswordEntry } from "@/types/vault.types";
import { safeHttpUrl } from "@/utils/url.utils";

const MASK = "••••••••••••";

/** The field cards of a saved login: username, password (hidden until asked), website, custom fields. */
export function PasswordFields({ entry }: { entry: PasswordEntry }) {
  const [revealed, toggle] = useToggle();
  const link = safeHttpUrl(entry.url);

  return (
    <dl className="flex flex-col gap-2.5">
      {entry.username && (
        <FieldCard
          label={CRUD_COPY.username}
          actions={<CopyButton value={entry.username} label="Username" />}
        >
          {entry.username}
        </FieldCard>
      )}
      <FieldCard
        label={CRUD_COPY.password}
        actions={
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
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
        <span className="font-mono font-semibold">{revealed ? entry.password : MASK}</span>
      </FieldCard>
      {entry.url && (
        <FieldCard
          label={CRUD_COPY.website}
          actions={<CopyButton value={entry.url} label="Website" />}
        >
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
        </FieldCard>
      )}
      {(entry.fields ?? []).map((field, index) => (
        <FieldCard
          key={`${String(index)}-${field.label}`}
          label={field.label.toUpperCase()}
          actions={<CopyButton value={field.value} label={field.label} />}
        >
          {field.value}
        </FieldCard>
      ))}
      {entry.notes && (
        <FieldCard label={CRUD_COPY.notes}>
          <span className="whitespace-pre-wrap">{entry.notes}</span>
        </FieldCard>
      )}
    </dl>
  );
}
