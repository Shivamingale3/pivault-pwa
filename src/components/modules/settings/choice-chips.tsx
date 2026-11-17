import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface ChoiceChipsProps {
  /** The mono eyebrow above the chips; also names the group. */
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

/** Equal-width choice chips (h 52, radius 16, bordered); the chosen one is ink. Exactly one is chosen. */
export function ChoiceChips({ label, value, options, onChange }: ChoiceChipsProps) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="px-1 text-eyebrow">{label}</h2>
      <ToggleGroup
        aria-label={label}
        value={[value]}
        onValueChange={(values) => {
          const [next] = values;
          if (typeof next === "string") onChange(next);
        }}
        spacing={2}
        className="w-full"
      >
        {options.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            className="h-13 flex-1 rounded-2xl border-[1.5px] border-border bg-card text-[0.78125rem] font-bold data-pressed:border-primary data-pressed:bg-primary data-pressed:text-primary-foreground"
          >
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </section>
  );
}
