/// <reference types="vitest/config" />
import { resolve } from "node:path";
import { styleText } from "node:util";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { createPwaOptions } from "./pwa.config.ts";
import { validateEnv } from "./src/config/env.config.ts";
import type { Env } from "./src/schemas/env.schema.ts";

const assertValidEnv = (mode: string): Readonly<Env> => {
  try {
    return validateEnv(loadEnv(mode, import.meta.dirname, "VITE_"));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(styleText(["red", "bold"], `\n✖ ${message}\n`));
    console.error(styleText("yellow", "Check your .env file against .env.example.\n"));
    process.exit(1);
  }
};

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = assertValidEnv(mode);

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      tailwindcss(),
      VitePWA(createPwaOptions(env.VITE_APP_NAME)),
    ],
    resolve: {
      alias: {
        "@": resolve(import.meta.dirname, "src"),
      },
    },
    test: {
      alias: {
        "virtual:pwa-register/react": resolve(
          import.meta.dirname,
          "src/test/stubs/pwa-register.ts",
        ),
      },
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      include: ["src/**/*.test.{ts,tsx}"],
      restoreMocks: true,
      css: true,
    },
  };
});
