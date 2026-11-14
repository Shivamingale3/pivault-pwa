import { InstallGate } from "@/components/modules/pwa/install-gate";
import { PwaRegistration } from "@/components/modules/pwa/pwa-registration";
import { BrowserRouter } from "react-router";
import { Toaster } from "@/components/ui/sonner";
import { AppRoutes } from "@/routes/app.routes";
import { ThemeProvider } from "@/providers/theme.provider";

export function App() {
  return (
    <ThemeProvider>
      <PwaRegistration />
      <BrowserRouter>
        <InstallGate>
          <AppRoutes />
        </InstallGate>
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  );
}
