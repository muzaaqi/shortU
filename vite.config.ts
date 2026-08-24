import { cloudflare } from "@cloudflare/vite-plugin";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";

/**
 * Vite configuration.
 * The Cloudflare plugin must come first so the SSR environment runs on
 * workerd — this keeps the client bundle and the server-function registry
 * in one consistent build target (see TanStack Start hosting guide).
 * Used by: bun dev / build / preview / deploy
 */
const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    devtools(),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
});

export default config;
