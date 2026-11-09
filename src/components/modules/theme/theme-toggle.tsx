import { THEME_OPTIONS } from "@/constants/theme-options.constants";
import { useTheme } from "@/hooks/use-theme";
import { isTheme } from "@/utils/theme.utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

/** Light / dark / system switcher. Reusable later in Settings. */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const handleChange = (values: unknown[]) => {
    const [next] = values;
    if (isTheme(next)) setTheme(next);
  };

  return (
    <ToggleGroup
      aria-label="Theme"
      value={[theme]}
      onValueChange={handleChange}
      spacing={1}
      className="rounded-full bg-muted p-1"
    >
      {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
        <ToggleGroupItem key={value} value={value} size="sm" aria-label={label}>
          <Icon />
          <span className="max-sm:sr-only">{label}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
