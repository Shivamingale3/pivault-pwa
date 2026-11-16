import { Outlet } from "react-router";
import { TabBar } from "@/components/modules/kit/tab-bar";

/** Home, Passwords and Notes share the tab bar at the bottom. */
export function TabsLayout() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col">
        <Outlet />
      </div>
      <TabBar />
    </div>
  );
}
