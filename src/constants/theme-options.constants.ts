import { MonitorIcon, MoonIcon, SunIcon, type LucideIcon } from "lucide-react";
import { Theme } from "@/enums/theme.enum";

export interface ThemeOption {
  value: Theme;
  label: string;
  icon: LucideIcon;
}

export const THEME_OPTIONS: readonly ThemeOption[] = [
  { value: Theme.Light, label: "Light", icon: SunIcon },
  { value: Theme.Dark, label: "Dark", icon: MoonIcon },
  { value: Theme.System, label: "System", icon: MonitorIcon },
];
