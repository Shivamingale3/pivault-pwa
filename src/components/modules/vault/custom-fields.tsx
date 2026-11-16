import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CRUD_COPY } from "@/constants/vault-design.constants";
import { ENTRY_LIMITS } from "@/constants/vault.constants";
import type { CustomField } from "@/schemas/vault.schema";

interface CustomFieldsProps {
  fields: CustomField[];
  onAdd: () => void;
  onChange: (index: number, patch: Partial<CustomField>) => void;
  onRemove: (index: number) => void;
}

const INPUT = "w-full bg-transparent outline-none placeholder:text-subtle";

/** "CUSTOM FIELDS": muted cards with a label over a value and a remove button, and "+ Add field". */
export function CustomFields({ fields, onAdd, onChange, onRemove }: CustomFieldsProps) {
  return (
    <section aria-label="Custom fields" className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-eyebrow">{CRUD_COPY.customFields}</h2>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          disabled={fields.length >= ENTRY_LIMITS.fields}
          onClick={onAdd}
        >
          {CRUD_COPY.addField}
        </Button>
      </div>
      {fields.map((field, index) => (
        <div
          key={index}
          className="flex items-center gap-2 rounded-[1.125rem] bg-muted py-2.5 pr-2 pl-4.5"
        >
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <input
              aria-label={`Field ${String(index + 1)} label`}
              placeholder={CRUD_COPY.fieldLabel}
              value={field.label}
              maxLength={ENTRY_LIMITS.fieldLabel}
              autoComplete="off"
              className={`${INPUT} text-[0.71875rem] font-medium text-muted-foreground`}
              onChange={(event) => {
                onChange(index, { label: event.target.value });
              }}
            />
            <input
              aria-label={`Field ${String(index + 1)} value`}
              placeholder={CRUD_COPY.fieldValue}
              value={field.value}
              maxLength={ENTRY_LIMITS.fieldValue}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              className={`${INPUT} text-[0.9375rem] font-medium`}
              onChange={(event) => {
                onChange(index, { value: event.target.value });
              }}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Remove field ${String(index + 1)}`}
            onClick={() => {
              onRemove(index);
            }}
          >
            <XIcon />
          </Button>
        </div>
      ))}
    </section>
  );
}
