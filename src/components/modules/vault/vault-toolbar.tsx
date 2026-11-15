import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { EntryKind } from "@/enums/vault.enum";
import type { KindFilter } from "@/hooks/use-vault-filter";

const OPTIONS: { value: KindFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: EntryKind.Note, label: "Notes" },
  { value: EntryKind.Password, label: "Passwords" },
];

const isKindFilter = (value: unknown): value is KindFilter =>
  OPTIONS.some((option) => option.value === value);

interface VaultToolbarProps {
  kind: KindFilter;
  onKindChange: (kind: KindFilter) => void;
  query: string;
  onQueryChange: (query: string) => void;
}

export function VaultToolbar({ kind, onKindChange, query, onQueryChange }: VaultToolbarProps) {
  return (
    <div className="flex flex-col gap-3">
      <Input
        type="search"
        aria-label="Search"
        placeholder="Search"
        autoComplete="off"
        value={query}
        onChange={(event) => {
          onQueryChange(event.target.value);
        }}
      />
      <ToggleGroup
        aria-label="Show"
        value={[kind]}
        onValueChange={(values) => {
          const [next] = values;
          if (isKindFilter(next)) onKindChange(next);
        }}
        spacing={1}
        className="self-start rounded-full bg-muted p-1"
      >
        {OPTIONS.map(({ value, label }) => (
          <ToggleGroupItem key={value} value={value} size="sm">
            {label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
