import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";

/**
 * Generates the install icons from the ink logo into public/brand/.
 * Re-run `npm run generate-pwa-assets` whenever the logo changes.
 */
export default defineConfig({
  headLinkOptions: { preset: "2023" },
  preset: {
    ...minimal2023Preset,
    maskable: {
      ...minimal2023Preset.maskable,
      padding: 0.3,
      resizeOptions: { background: "#ffffff" },
    },
    apple: {
      ...minimal2023Preset.apple,
      padding: 0.3,
      resizeOptions: { background: "#ffffff" },
    },
  },
  images: ["public/brand/logo-light.png"],
});
