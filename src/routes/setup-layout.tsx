import { Outlet } from "react-router";
import { RecoveryKeyDraftProvider } from "@/providers/recovery-key-draft.provider";

/** The setup screens share the new recovery key between "reveal" and "confirm". */
export function SetupLayout() {
  return (
    <RecoveryKeyDraftProvider>
      <Outlet />
    </RecoveryKeyDraftProvider>
  );
}
