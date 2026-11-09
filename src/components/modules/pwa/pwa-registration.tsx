import { usePwaRegistration } from "@/hooks/use-pwa-registration";

/** Registers the service worker; renders nothing. */
export function PwaRegistration() {
  usePwaRegistration();
  return null;
}
