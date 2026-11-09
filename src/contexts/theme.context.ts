import { createContext } from "react";
import type { ThemeContextValue } from "@/interfaces/theme.interface";

export const ThemeContext = createContext<ThemeContextValue | null>(null);
