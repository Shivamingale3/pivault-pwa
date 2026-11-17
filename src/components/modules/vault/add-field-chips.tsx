import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CRUD_COPY } from "@/constants/vault-design.constants";
import type { Optional } from "@/hooks/use-password-form";

interface AddFieldChipsProps {
  shown: Record<Optional, boolean>;
  /** True when the item already has custom fields (they have their own add button then). */
  hasCustomFields: boolean;
  onShow: (key: Optional) => void;
  onAddCustom: () => void;
}

/** "+ Username", "+ Website", "+ Custom field": the optional inputs, added only when wanted. */
export function AddFieldChips({ shown, hasCustomFields, onShow, onAddCustom }: AddFieldChipsProps) {
  const chips = [
    ...(shown.username
      ? []
      : [
          {
            label: CRUD_COPY.addUsername,
            onClick: () => {
              onShow("username");
            },
          },
        ]),
    ...(shown.url
      ? []
      : [
          {
            label: CRUD_COPY.addWebsite,
            onClick: () => {
              onShow("url");
            },
          },
        ]),
    ...(hasCustomFields ? [] : [{ label: CRUD_COPY.addCustomField, onClick: onAddCustom }]),
  ];
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map(({ label, onClick }) => (
        <Button
          key={label}
          type="button"
          variant="outline"
          size="sm"
          aria-label={`Add ${label.toLowerCase()}`}
          className="rounded-full border-border"
          onClick={onClick}
        >
          <PlusIcon aria-hidden="true" />
          {label}
        </Button>
      ))}
    </div>
  );
}
