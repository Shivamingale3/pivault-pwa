import { Outlet } from "react-router";
import { useAutoLock } from "@/hooks/use-auto-lock";

/** Everything behind the unlocked zone: locks itself after time in the background. */
export function PrivateLayout() {
  useAutoLock();
  return <Outlet />;
}
