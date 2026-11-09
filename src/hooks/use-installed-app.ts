import { useSyncExternalStore } from "react";
import { displayModeQuery, INSTALLED_DISPLAY_MODES } from "@/constants/pwa.constants";
import { isInstalledApp } from "@/utils/pwa.utils";

const subscribe = (onChange: () => void) => {
  if (typeof window.matchMedia !== "function") return () => undefined;
  const queries = INSTALLED_DISPLAY_MODES.map((mode) => window.matchMedia(displayModeQuery(mode)));
  queries.forEach((query) => {
    query.addEventListener("change", onChange);
  });
  return () => {
    queries.forEach((query) => {
      query.removeEventListener("change", onChange);
    });
  };
};

/** Live "running as installed app" flag; flips when a tab is turned into the app window. */
export function useInstalledApp(): boolean {
  return useSyncExternalStore(subscribe, isInstalledApp, () => false);
}
