import { Toaster } from "@/components/ui/sonner";
import { DesignSystemPage } from "@/pages/design-system.page";
import { ThemeProvider } from "@/providers/theme.provider";

export function App() {
  return (
    <ThemeProvider>
      <DesignSystemPage />
      <Toaster />
    </ThemeProvider>
  );
}
