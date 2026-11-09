import type { VitePWAOptions } from "vite-plugin-pwa";
import { APP_DESCRIPTION, MANIFEST_ICONS, THEME_COLOR } from "./src/constants/brand.constants.ts";

/**
 * Service worker + manifest config. The service worker precaches the static app shell only:
 * there is deliberately no runtime caching, so API responses (sessions, encrypted vault blobs)
 * never land in Cache Storage. Vault data lives in RxDB.
 */
export const createPwaOptions = (appName: string): Partial<VitePWAOptions> => ({
  registerType: "autoUpdate",
  injectRegister: null,
  manifest: {
    id: "/",
    name: appName,
    short_name: appName,
    description: APP_DESCRIPTION,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    theme_color: THEME_COLOR.light,
    background_color: THEME_COLOR.light,
    categories: ["productivity", "security"],
    icons: MANIFEST_ICONS.map((icon) => ({ ...icon })),
  },
  workbox: {
    globPatterns: ["**/*.{js,css,html,woff2,png,ico,svg}"],
    navigateFallback: "index.html",
    navigateFallbackDenylist: [/^\/api\//],
    cleanupOutdatedCaches: true,
    clientsClaim: true,
    skipWaiting: true,
  },
  // The install gate is enforced in dev too, so the service worker must run there.
  devOptions: {
    enabled: true,
    type: "module",
    navigateFallback: "index.html",
  },
});
