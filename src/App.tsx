import { InstallGate } from "@/components/modules/pwa/install-gate";
import { PwaRegistration } from "@/components/modules/pwa/pwa-registration";
import { Toaster } from "@/components/ui/sonner";
import { DesignSystemPage } from "@/pages/design-system.page";
import { ThemeProvider } from "@/providers/theme.provider";

export function App() {
  return (
    <ThemeProvider>
      <PwaRegistration />
      <InstallGate>
        <DesignSystemPage />
      </InstallGate>
      <Toaster />
    </ThemeProvider>
  );
}
