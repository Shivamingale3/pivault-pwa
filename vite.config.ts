import { resolve } from "node:path";
import { styleText } from "node:util";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { validateEnv } from "./src/config/env.config.ts";

const assertValidEnv = (mode: string): void => {
  try {
    validateEnv(loadEnv(mode, import.meta.dirname, "VITE_"));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(styleText(["red", "bold"], `\n✖ ${message}\n`));
    console.error(styleText("yellow", "Check your .env file against .env.example.\n"));
    process.exit(1);
  }
};

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  assertValidEnv(mode);

  return {
    plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
    resolve: {
      alias: {
        "@": resolve(import.meta.dirname, "src"),
      },
    },
  };
});
