import { Route, Routes } from "react-router";
import { DesignSystemPage } from "@/pages/design-system.page";
import { ResetPasswordPage } from "@/pages/reset-password.page";
import { ROUTES } from "@/routes/route-paths";

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.resetPassword} element={<ResetPasswordPage />} />
      {/* Placeholder home until the vault screens exist. */}
      <Route path="*" element={<DesignSystemPage />} />
    </Routes>
  );
}
