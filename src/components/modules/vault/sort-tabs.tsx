import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LIST_COPY } from "@/constants/vault-design.constants";
import type { SortTab } from "@/hooks/use-passwords-screen";

const TABS: { value: SortTab; label: string }[] = [
  { value: "recent", label: LIST_COPY.tabRecent },
  { value: "az", label: LIST_COPY.tabAZ },
  { value: "weak", label: LIST_COPY.tabWeak },
];

const isTab = (value: unknown): value is SortTab => TABS.some((tab) => tab.value === value);

/** Pinned Recent / A-Z / Weak tabs: a muted container, the chosen one in ink. */
export function SortTabs({
  value,
  onChange,
}: {
  value: SortTab;
  onChange: (tab: SortTab) => void;
}) {
  return (
    <ToggleGroup
      aria-label="Sort passwords"
      value={[value]}
      onValueChange={(values) => {
        const [next] = values;
        if (isTab(next)) onChange(next);
      }}
      spacing={1}
      className="w-full rounded-2xl bg-muted p-1"
    >
      {TABS.map(({ value: tab, label }) => (
        <ToggleGroupItem
          key={tab}
          value={tab}
          className="h-10 flex-1 rounded-xl text-[0.78125rem] font-bold data-pressed:bg-primary data-pressed:text-primary-foreground"
        >
          {label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
