import { SearchIcon } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

interface FilterFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /** Names the field for screen readers. */
  label: string;
  autoFocus?: boolean;
}

/** The pill-shaped filter (h 48, radius 24) with a search icon. Filters as you type. */
export function FilterField({ value, onChange, placeholder, label, autoFocus }: FilterFieldProps) {
  return (
    <InputGroup className="h-12 rounded-3xl">
      <InputGroupAddon align="inline-start">
        <SearchIcon aria-hidden="true" className="size-4" />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        aria-label={label}
        placeholder={placeholder}
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        autoFocus={autoFocus}
        value={value}
        className="text-sm"
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />
    </InputGroup>
  );
}
