/// <reference types="vitest/config" />
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    process.env.ANALYZE === "true" &&
      visualizer({ filename: "dist/bundle-stats.html", gzipSize: true }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) return "vendor-react";
          if (id.includes("node_modules/@dnd-kit/")) return "vendor-dnd";
          if (id.includes("node_modules/dexie")) return "vendor-dexie";
          if (id.includes("node_modules/liquidjs/")) return "vendor-liquid";
          if (id.includes("node_modules/i18next") || id.includes("node_modules/react-i18next/")) return "vendor-i18n";
          if (id.includes("node_modules/react-aria-components/")) return "vendor-aria";
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
